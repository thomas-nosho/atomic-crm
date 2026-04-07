import { useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  CalendarClock,
  Heart,
  Mail,
  Monitor,
  MoreVertical,
  Package,
  Phone,
  RotateCcw,
  User,
  Users,
  Utensils,
} from "lucide-react";
import { useDeleteWithUndoController, useNotify, useUpdate } from "ra-core";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { ReferenceField } from "@/components/admin/reference-field";
import { DateField } from "@/components/admin/date-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Contact, Task as TData } from "../types";
import { TaskEdit } from "./TaskEdit";
import { TaskEditSheet } from "./TaskEditSheet";
import { useIsMobile } from "@/hooks/use-mobile";

type TaskTypeStyle = {
  icon: ReactNode;
  color: string;
  bg: string;
};

const taskTypeStyles: Record<string, TaskTypeStyle> = {
  email: {
    icon: <Mail className="size-3" />,
    color: "text-blue-700 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/50",
  },
  call: {
    icon: <Phone className="size-3" />,
    color: "text-green-700 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/50",
  },
  meeting: {
    icon: <Users className="size-3" />,
    color: "text-violet-700 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/50",
  },
  demo: {
    icon: <Monitor className="size-3" />,
    color: "text-orange-700 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/50",
  },
  lunch: {
    icon: <Utensils className="size-3" />,
    color: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/50",
  },
  "follow-up": {
    icon: <RotateCcw className="size-3" />,
    color: "text-teal-700 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-950/50",
  },
  "thank-you": {
    icon: <Heart className="size-3" />,
    color: "text-pink-700 dark:text-pink-400",
    bg: "bg-pink-50 dark:bg-pink-950/50",
  },
  ship: {
    icon: <Package className="size-3" />,
    color: "text-stone-700 dark:text-stone-400",
    bg: "bg-stone-100 dark:bg-stone-800/50",
  },
};

export const Task = ({
  task,
  showContact,
}: {
  task: TData;
  showContact?: boolean;
}) => {
  const isMobile = useIsMobile();
  const { taskTypes } = useConfigurationContext();
  const notify = useNotify();
  const queryClient = useQueryClient();

  const [openEdit, setOpenEdit] = useState(false);

  const handleCloseEdit = () => {
    setOpenEdit(false);
  };

  const [update, { isPending: isUpdatePending, isSuccess, variables }] =
    useUpdate();
  const { handleDelete } = useDeleteWithUndoController({
    record: task,
    redirect: false,
    mutationOptions: {
      onSuccess() {
        notify("Tâche supprimée", { undoable: true });
      },
    },
  });

  const handleEdit = () => {
    setOpenEdit(true);
  };

  const handleCheck = () => () => {
    update("tasks", {
      id: task.id,
      data: {
        done_date: task.done_date ? null : new Date().toISOString(),
      },
      previousData: task,
    });
  };

  useEffect(() => {
    // We do not want to invalidate the query when a tack is checked or unchecked
    if (
      isUpdatePending ||
      !isSuccess ||
      variables?.data?.done_date != undefined
    ) {
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["tasks", "getList"] });
  }, [queryClient, isUpdatePending, isSuccess, variables]);

  const labelId = `checkbox-list-label-${task.id}`;
  const typeStyle =
    task.type && task.type !== "none" ? taskTypeStyles[task.type] : undefined;
  const typeLabel =
    task.type && task.type !== "none"
      ? (taskTypes.find((t) => t.value === task.type)?.label ?? task.type)
      : undefined;

  return (
    <>
      <div className="flex items-start justify-between gap-1">
        <div
          className="flex items-start gap-2 flex-1 min-w-0"
          onClick={isMobile ? handleCheck() : undefined}
        >
          <Checkbox
            id={labelId}
            checked={!!task.done_date}
            onCheckedChange={handleCheck()}
            disabled={isUpdatePending}
            className="mt-1 shrink-0"
          />
          <div
            className={`flex-grow min-w-0 ${task.done_date ? "opacity-50" : ""}`}
          >
            {/* Task type badge */}
            {typeLabel && (
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium mb-1 ${typeStyle ? `${typeStyle.color} ${typeStyle.bg}` : "text-muted-foreground bg-muted"}`}
              >
                {typeStyle?.icon}
                {typeLabel}
              </span>
            )}

            {/* Task text */}
            <div
              className={`text-sm leading-snug ${task.done_date ? "line-through" : ""}`}
            >
              {task.text}
            </div>

            {/* Contact + company */}
            {showContact && (
              <ReferenceField<TData, Contact>
                source="contact_id"
                reference="contacts"
                record={task}
                link="show"
                className="block mt-0.5"
                render={({ referenceRecord }) => {
                  if (!referenceRecord) return null;
                  return (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
                      <User className="size-3 shrink-0" />
                      <span>
                        {referenceRecord.first_name} {referenceRecord.last_name}
                      </span>
                      {referenceRecord.company_name && (
                        <>
                          <span className="text-muted-foreground/40">·</span>
                          <Building2 className="size-3 shrink-0" />
                          <span>{referenceRecord.company_name}</span>
                        </>
                      )}
                    </span>
                  );
                }}
              />
            )}

            {/* Due date */}
            <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
              <CalendarClock className="size-3 shrink-0" />
              <DateField source="due_date" record={task} showDate showTime />
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 pr-0! size-8 cursor-pointer shrink-0"
              aria-label="task actions"
            >
              <MoreVertical className="size-5 md:size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer h-12 md:h-8 px-4 md:px-2 text-base md:text-sm"
              onClick={() => {
                update("tasks", {
                  id: task.id,
                  data: {
                    due_date: new Date(Date.now() + 24 * 60 * 60 * 1000)
                      .toISOString()
                      .slice(0, 10),
                  },
                  previousData: task,
                });
              }}
            >
              Postpone to tomorrow
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer h-12 md:h-8 px-4 md:px-2 text-base md:text-sm"
              onClick={() => {
                update("tasks", {
                  id: task.id,
                  data: {
                    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .slice(0, 10),
                  },
                  previousData: task,
                });
              }}
            >
              Postpone to next week
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer h-12 md:h-8 px-4 md:px-2 text-base md:text-sm"
              onClick={handleEdit}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer h-12 md:h-8 px-4 md:px-2 text-base md:text-sm"
              onClick={handleDelete}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isMobile ? (
        <TaskEditSheet
          taskId={task.id}
          open={openEdit}
          onOpenChange={setOpenEdit}
        />
      ) : (
        <TaskEdit taskId={task.id} open={openEdit} close={handleCloseEdit} />
      )}
    </>
  );
};
