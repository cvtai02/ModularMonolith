import { PlusIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { OptionEntry } from "./types";

type Props = {
  options: OptionEntry[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onNameChange: (id: string, name: string) => void;
  onValueChange: (optId: string, idx: number, val: string) => void;
  onValueBlur: (optId: string, idx: number) => void;
};

export function OptionsSection({
  options,
  onAdd,
  onRemove,
  onNameChange,
  onValueChange,
  onValueBlur,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Product Options</CardTitle>
          {options.length > 0 && (
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
          <div className="flex flex-col gap-4">
            {options.map((opt) => (
              <div key={opt.localId} className="flex flex-col gap-3 rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <Input
                    value={opt.name}
                    onChange={(e) => onNameChange(opt.localId, e.target.value)}
                    placeholder="Option name (e.g. Color)"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemove(opt.localId)}
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Values</span>
                  {opt.inputValues.map((val, idx) => (
                    <Input
                      key={idx}
                      value={val}
                      onChange={(e) => onValueChange(opt.localId, idx, e.target.value)}
                      onBlur={() => onValueBlur(opt.localId, idx)}
                      placeholder={idx === opt.inputValues.length - 1 ? "Add value…" : ""}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
