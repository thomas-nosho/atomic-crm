import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { supabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { corsHeaders, OptionsMiddleware } from "../_shared/cors.ts";
import { createErrorResponse } from "../_shared/utils.ts";
import { AuthMiddleware, UserMiddleware } from "../_shared/authentication.ts";
import { getUserSale } from "../_shared/getUserSale.ts";
import { googleFetch } from "../_shared/googleAuth.ts";

const PEOPLE_API_BASE = "https://people.googleapis.com/v1";

const UPDATE_PERSON_FIELDS =
  "names,organizations,emailAddresses,phoneNumbers,urls,biographies";

interface CrmContact {
  id: number;
  first_name: string | null;
  last_name: string | null;
  title: string | null;
  company_name: string | null;
  email_jsonb: Array<{ email: string; type: string }> | null;
  phone_jsonb: Array<{ number: string; type: string }> | null;
  linkedin_url: string | null;
  background: string | null;
}

interface GooglePerson {
  resourceName: string;
  etag: string;
  emailAddresses?: Array<{ value: string; type?: string }>;
}

function mapContactTypeToGoogle(type: string): string {
  if (type === "Home") return "home";
  if (type === "Work") return "work";
  return "other";
}

function buildPersonPayload(contact: CrmContact) {
  const person: Record<string, unknown> = {
    names: [
      {
        givenName: contact.first_name ?? "",
        familyName: contact.last_name ?? "",
      },
    ],
  };

  if (contact.company_name || contact.title) {
    person.organizations = [
      {
        name: contact.company_name ?? "",
        title: contact.title ?? "",
      },
    ];
  }

  if (contact.email_jsonb?.length) {
    person.emailAddresses = contact.email_jsonb.map((e) => ({
      value: e.email,
      type: mapContactTypeToGoogle(e.type),
    }));
  }

  if (contact.phone_jsonb?.length) {
    person.phoneNumbers = contact.phone_jsonb.map((p) => ({
      value: p.number,
      type: mapContactTypeToGoogle(p.type),
    }));
  }

  if (contact.linkedin_url) {
    person.urls = [{ value: contact.linkedin_url, type: "profile" }];
  }

  if (contact.background) {
    person.biographies = [
      { value: contact.background, contentType: "TEXT_PLAIN" },
    ];
  }

  return person;
}

async function fetchAllGoogleContacts(
  userId: string,
): Promise<Map<string, { resourceName: string; etag: string }>> {
  const emailIndex = new Map<string, { resourceName: string; etag: string }>();
  let nextPageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      personFields: "emailAddresses",
      pageSize: "1000",
    });
    if (nextPageToken) params.set("pageToken", nextPageToken);

    const response = await googleFetch(
      userId,
      `${PEOPLE_API_BASE}/people/me/connections?${params}`,
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("People API list error:", response.status, errorBody);
      throw new Error(`People API error: ${response.status}`);
    }

    const data = await response.json();
    const connections: GooglePerson[] = data.connections ?? [];

    for (const person of connections) {
      for (const ea of person.emailAddresses ?? []) {
        if (ea.value) {
          emailIndex.set(ea.value.toLowerCase(), {
            resourceName: person.resourceName,
            etag: person.etag,
          });
        }
      }
    }

    nextPageToken = data.nextPageToken;
  } while (nextPageToken);

  return emailIndex;
}

async function exportContacts(userId: string) {
  // Fetch all Google contacts indexed by email
  const googleEmailIndex = await fetchAllGoogleContacts(userId);

  // Fetch all CRM contacts (paginated)
  const allCrmContacts: CrmContact[] = [];
  const PAGE_SIZE = 100;
  let offset = 0;

  while (true) {
    const { data, error } = await supabaseAdmin
      .from("contacts_summary")
      .select(
        "id, first_name, last_name, title, company_name, email_jsonb, phone_jsonb, linkedin_url, background",
      )
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error("Error fetching CRM contacts:", error);
      throw new Error("Failed to fetch CRM contacts");
    }

    if (!data || data.length === 0) break;
    allCrmContacts.push(...(data as CrmContact[]));
    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const contact of allCrmContacts) {
    // Skip contacts with no useful data
    if (
      !contact.first_name &&
      !contact.last_name &&
      !contact.email_jsonb?.length
    ) {
      skipped++;
      continue;
    }

    const payload = buildPersonPayload(contact);

    // Check if any of the contact's emails already exist in Google
    const emails = contact.email_jsonb?.map((e) => e.email.toLowerCase()) ?? [];
    const existingGoogle = emails
      .map((email) => googleEmailIndex.get(email))
      .find(Boolean);

    if (existingGoogle) {
      // Update existing Google contact (CRM wins)
      const updatePayload = { ...payload, etag: existingGoogle.etag };
      const response = await googleFetch(
        userId,
        `${PEOPLE_API_BASE}/${existingGoogle.resourceName}:updateContact?updatePersonFields=${UPDATE_PERSON_FIELDS}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatePayload),
        },
      );

      if (response.ok) {
        updated++;
      } else {
        const errorBody = await response.text();
        console.error(
          `Failed to update contact ${contact.id}:`,
          response.status,
          errorBody,
        );
        skipped++;
      }
    } else {
      // Create new Google contact
      const response = await googleFetch(
        userId,
        `${PEOPLE_API_BASE}/people:createContact`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (response.ok) {
        // Index new contact's emails to avoid duplicates within the same run
        const newPerson: GooglePerson = await response.json();
        for (const ea of newPerson.emailAddresses ?? []) {
          if (ea.value) {
            googleEmailIndex.set(ea.value.toLowerCase(), {
              resourceName: newPerson.resourceName,
              etag: newPerson.etag,
            });
          }
        }
        created++;
      } else {
        const errorBody = await response.text();
        console.error(
          `Failed to create contact ${contact.id}:`,
          response.status,
          errorBody,
        );
        skipped++;
      }
    }
  }

  // Update last export timestamp in preferences
  const { data: prefs } = await supabaseAdmin
    .from("connector_preferences")
    .select("preferences")
    .eq("user_id", userId)
    .eq("connector_type", "google")
    .single();

  await supabaseAdmin
    .from("connector_preferences")
    .update({
      preferences: {
        ...(prefs?.preferences as Record<string, unknown>),
        lastExportAt: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("connector_type", "google");

  return {
    total: allCrmContacts.length,
    created,
    updated,
    skipped,
  };
}

Deno.serve(async (req: Request) =>
  OptionsMiddleware(req, async (req) =>
    AuthMiddleware(req, async (req) =>
      UserMiddleware(req, async (req, user) => {
        if (req.method !== "POST") {
          return createErrorResponse(405, "Method Not Allowed");
        }

        const currentUserSale = await getUserSale(user);
        if (!currentUserSale) {
          return createErrorResponse(401, "Unauthorized");
        }

        try {
          const { action } = await req.json();

          let result: unknown;

          switch (action) {
            case "export":
              result = await exportContacts(user!.id);
              break;

            default:
              return createErrorResponse(400, `Unknown action: ${action}`);
          }

          return new Response(JSON.stringify({ data: result }), {
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        } catch (e) {
          console.error("google-contacts-export error:", e);
          const message = e instanceof Error ? e.message : "Internal error";
          if (
            message === "GOOGLE_NOT_CONNECTED" ||
            message === "GOOGLE_TOKEN_EXPIRED"
          ) {
            return createErrorResponse(401, message);
          }
          return createErrorResponse(500, message);
        }
      }),
    ),
  ),
);
