import { useRef } from "react";
import { GripVerticalIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { OptionEntry } from "./types";

type Props = {
  options: OptionEntry[];
  canAddOption?: boolean;
  onAdd: () => void;
  onRemoveOption: (id: string) => void;
  onNameChange: (id: string, name: string) => void;
  onPendingChange: (optId: string, val: string) => void;
  onCommitPending: (optId: string) => void;
  onRemoveValue: (optId: string, idx: number) => void;
  onReorderValues: (optId: string, from: number, to: number) => void;
  duplicateNameIds?: Set<string>;
};

export function OptionsSection({
  options,
  canAddOption = true,
  onAdd,
  onRemoveOption,
  onNameChange,
  onPendingChange,
  onCommitPending,
  onRemoveValue,
  onReorderValues,
  duplicateNameIds,
}: Props) {
  const dragRef = useRef<{ optId: string; idx: number } | null>(null);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Product Options</CardTitle>
          {options.length > 0 && canAddOption && (
            <Button
              variant="outline"
              size="sm"
              type="button"
              disabled={options.length >= 2}
              onClick={onAdd}
            >
              <PlusIcon className="size-4" />
              Add option
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {options.length === 0 ? (
          canAddOption ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <p className="text-sm text-muted-foreground">
                Add options like size or color to create variants.
              </p>
              <Button variant="outline" size="sm" type="button" onClick={onAdd}>
                <PlusIcon className="size-4" />
                Add option
              </Button>
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              This product has no options.
            </p>
          )
        ) : (
          <div className="flex flex-col gap-4">
            {options.map((opt) => {
              const nameFrozen = opt.initialValueCount > 0;
              const isDupName = !!duplicateNameIds?.has(opt.localId);
              const pendingTrim = opt.pending.trim().toLowerCase();
              const isPendingDup =
                !!pendingTrim &&
                opt.values.some((v) => v.trim().toLowerCase() === pendingTrim);

              return (
                <div key={opt.localId} className="flex flex-col gap-3 rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    {nameFrozen ? (
                      <span className="flex-1 rounded-md border bg-muted px-3 py-1.5 text-sm text-muted-foreground select-none">
                        {opt.name}
                      </span>
                    ) : (
                      <Input
                        value={opt.name}
                        maxLength={100}
                        onChange={(e) => onNameChange(opt.localId, e.target.value)}
                        placeholder="Option name (e.g. Color)"
                        className={cn("flex-1", isDupName && "border-destructive")}
                      />
                    )}
                    {!nameFrozen && (
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => onRemoveOption(opt.localId)}
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    )}
                  </div>
                  {isDupName && (
                    <p className="text-xs text-destructive">An option with this name already exists.</p>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-muted-foreground">Values</span>

                    {opt.values.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {opt.values.map((val, idx) => {
                          const removable = idx >= opt.initialValueCount;
                          return (
                            <span
                              key={`${idx}-${val}`}
                              draggable
                              onDragStart={() => { dragRef.current = { optId: opt.localId, idx }; }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                const d = dragRef.current;
                                if (d && d.optId === opt.localId && d.idx !== idx) {
                                  onReorderValues(opt.localId, d.idx, idx);
                                  dragRef.current = { optId: opt.localId, idx };
                                }
                              }}
                              onDragEnd={() => { dragRef.current = null; }}
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium cursor-grab active:cursor-grabbing select-none",
                                removable
                                  ? "bg-background"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              <GripVerticalIcon className="size-3 text-muted-foreground/50 -ml-0.5" />
                              {val}
                              {removable && (
                                <button
                                  type="button"
                                  aria-label={`Remove ${val}`}
                                  onClick={() => onRemoveValue(opt.localId, idx)}
                                  className="text-muted-foreground hover:text-destructive transition-colors"
                                >
                                  <XIcon className="size-3" />
                                </button>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    <Input
                      value={opt.pending}
                      onChange={(e) => onPendingChange(opt.localId, e.target.value)}
                      onBlur={() => onCommitPending(opt.localId)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          onCommitPending(opt.localId);
                        }
                      }}
                      placeholder="Add value — press Enter to commit"
                      className={cn(isPendingDup && "border-destructive")}
                    />
                    {isPendingDup && (
                      <p className="text-xs text-destructive">This value already exists.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
