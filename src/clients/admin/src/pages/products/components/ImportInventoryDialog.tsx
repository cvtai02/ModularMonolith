import { useState } from "react";
import { PlusIcon, TrashIcon, CheckCircle2Icon, XCircleIcon, MinusCircleIcon } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { IInventoryClient } from "@shared/api/contracts/inventory";
import type { ImportVariantInventoryRequest, ImportVariantInventoryResponse } from "@shared/api/contracts/inventory";

// ─── Types ────────────────────────────────────────────────────────────────────

type ImportRow = {
  id: number;
  variantId: string;
  quantity: string;
};

type RowError = {
  variantId?: string;
  quantity?: string;
};

// ─── Summary view ─────────────────────────────────────────────────────────────

function ImportSummary({
  result,
  onClose,
}: {
  result: ImportVariantInventoryResponse;
  onClose: () => void;
}) {
  const rows = (result as any).rows ?? [];

  return (
    <div className="flex flex-col gap-4">
      {/* Counts */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total", value: (result as any).total ?? 0, color: "text-foreground" },
          { label: "Applied", value: (result as any).applied ?? 0, color: "text-emerald-600" },
          { label: "Skipped", value: (result as any).skipped ?? 0, color: "text-muted-foreground" },
          { label: "Failed", value: (result as any).failed ?? 0, color: "text-destructive" },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border bg-muted/40 p-3 text-center">
            <div className={`text-xl font-bold tabular-nums ${item.color}`}>{item.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Per-row results */}
      {rows.length > 0 && (
        <div className="rounded-lg border overflow-hidden">
          <div className="text-xs font-medium px-3 py-2 border-b bg-muted/40 text-muted-foreground uppercase tracking-wide">
            Row Results
          </div>
          <div className="divide-y max-h-60 overflow-y-auto">
            {rows.map((row: any, i: number) => {
              const status = row.status ?? "";
              const isApplied = status === "Applied";
              const isSkipped = status === "Skipped";
              return (
                <div key={i} className="flex items-center gap-3 px-3 py-2 text-sm">
                  {isApplied ? (
                    <CheckCircle2Icon className="size-4 text-emerald-500 shrink-0" />
                  ) : isSkipped ? (
                    <MinusCircleIcon className="size-4 text-muted-foreground shrink-0" />
                  ) : (
                    <XCircleIcon className="size-4 text-destructive shrink-0" />
                  )}
                  <span className="font-medium tabular-nums w-20 shrink-0">
                    Variant #{row.variantId}
                  </span>
                  {row.previousQuantity != null && row.newQuantity != null && (
                    <span className="text-muted-foreground">
                      {row.previousQuantity} → <span className="text-foreground font-medium">{row.newQuantity}</span>
                    </span>
                  )}
                  {row.message && (
                    <span className="text-xs text-muted-foreground ml-auto truncate max-w-40">{row.message}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <DialogFooter>
        <Button onClick={onClose}>Done</Button>
      </DialogFooter>
    </div>
  );
}

// ─── Dialog ───────────────────────────────────────────────────────────────────

let _nextId = 1;
function nextId() { return _nextId++; }

interface Props {
  open: boolean;
  onClose: () => void;
  inventoryClient: IInventoryClient;
  onSuccess: () => void;
}

export function ImportInventoryDialog({ open, onClose, inventoryClient, onSuccess }: Props) {
  const [rows, setRows] = useState<ImportRow[]>([{ id: nextId(), variantId: "", quantity: "" }]);
  const [rowErrors, setRowErrors] = useState<Record<number, RowError>>({});
  const [note, setNote] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<ImportVariantInventoryResponse | null>(null);

  function addRow() {
    setRows((prev) => [...prev, { id: nextId(), variantId: "", quantity: "" }]);
  }

  function removeRow(id: number) {
    setRows((prev) => prev.filter((r) => r.id !== id));
    setRowErrors((prev) => { const next = { ...prev }; delete next[id]; return next; });
  }

  function updateRow(id: number, field: "variantId" | "quantity", value: string) {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r));
    setRowErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev, [id]: { ...prev[id], [field]: undefined } };
      return next;
    });
  }

  function validate() {
    const errors: Record<number, RowError> = {};
    const seenVariantIds = new Set<number>();

    for (const row of rows) {
      const err: RowError = {};
      const vid = parseInt(row.variantId, 10);
      const qty = parseInt(row.quantity, 10);

      if (!row.variantId.trim() || isNaN(vid) || vid <= 0) {
        err.variantId = "Must be a positive integer";
      } else if (seenVariantIds.has(vid)) {
        err.variantId = "Duplicate variant ID";
      } else {
        seenVariantIds.add(vid);
      }

      if (!row.quantity.trim() || isNaN(qty) || qty < 0) {
        err.quantity = "Must be ≥ 0";
      }

      if (Object.keys(err).length > 0) errors[row.id] = err;
    }

    setRowErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    setIsPending(true);
    try {
      const input: ImportVariantInventoryRequest = {
        referenceId: referenceId.trim() || undefined,
        note: note.trim() || undefined,
        rows: rows.map((r) => ({
          variantId: parseInt(r.variantId, 10),
          quantity: parseInt(r.quantity, 10),
        })),
      } as any;

      const res = await inventoryClient.importVariantInventory(input);
      setResult(res);
      onSuccess();
      toast.success("Inventory imported");
    } catch {
      toast.error("Import failed. Check your data and try again.");
    } finally {
      setIsPending(false);
    }
  }

  function handleClose() {
    setRows([{ id: nextId(), variantId: "", quantity: "" }]);
    setRowErrors({});
    setNote("");
    setReferenceId("");
    setResult(null);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-2xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{result ? "Import Summary" : "Import Variant Inventory"}</DialogTitle>
        </DialogHeader>

        {result ? (
          <ImportSummary result={result} onClose={handleClose} />
        ) : (
          <div className="flex flex-col gap-4">
            {/* Optional fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Reference ID (optional)</label>
                <input
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  placeholder="e.g. PO-2024-001"
                  className="rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Note (optional)</label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Quarterly restock"
                  className="rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            {/* Rows table */}
            <div className="rounded-lg border overflow-hidden">
              <div className="grid grid-cols-[1fr_1fr_auto] gap-0 text-xs font-medium text-muted-foreground uppercase tracking-wide border-b bg-muted/40">
                <div className="px-3 py-2">Variant ID</div>
                <div className="px-3 py-2">Quantity (absolute)</div>
                <div className="px-3 py-2 w-10" />
              </div>
              <div className="divide-y max-h-64 overflow-y-auto">
                {rows.map((row) => {
                  const err = rowErrors[row.id];
                  return (
                    <div key={row.id} className="grid grid-cols-[1fr_1fr_auto] items-start gap-0">
                      <div className="px-3 py-2">
                        <input
                          type="number"
                          min={1}
                          value={row.variantId}
                          onChange={(e) => updateRow(row.id, "variantId", e.target.value)}
                          placeholder="e.g. 42"
                          className={`w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground ${err?.variantId ? "text-destructive" : ""}`}
                        />
                        {err?.variantId && (
                          <p className="text-[10px] text-destructive mt-0.5">{err.variantId}</p>
                        )}
                      </div>
                      <div className="px-3 py-2 border-l">
                        <input
                          type="number"
                          min={0}
                          value={row.quantity}
                          onChange={(e) => updateRow(row.id, "quantity", e.target.value)}
                          placeholder="e.g. 100"
                          className={`w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground ${err?.quantity ? "text-destructive" : ""}`}
                        />
                        {err?.quantity && (
                          <p className="text-[10px] text-destructive mt-0.5">{err.quantity}</p>
                        )}
                      </div>
                      <div className="px-2 py-2 border-l flex items-center justify-center">
                        <button
                          disabled={rows.length === 1}
                          onClick={() => removeRow(row.id)}
                          className="size-6 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <TrashIcon className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t px-3 py-2">
                <button
                  onClick={addRow}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <PlusIcon className="size-3.5" />
                  Add row
                </button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Quantity is the final on-hand count. The import is all-or-nothing — validation errors prevent any row from applying.
            </p>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={isPending}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={isPending}>
                {isPending ? "Importing…" : `Import ${rows.length} row${rows.length !== 1 ? "s" : ""}`}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
