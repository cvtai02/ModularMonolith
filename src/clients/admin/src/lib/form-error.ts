import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";

import { ValidationError } from "@shared/api/types/common";

/**
 * Handles a ValidationError (400) by binding field messages to the form and
 * showing a toast. Returns true if the error was a ValidationError, false
 * otherwise — so callers can re-throw non-validation errors.
 *
 * fieldMap: override PascalCase API key → form field name when they differ
 * (e.g. { PhysicalProduct: "isPhysical" }).
 */
export function applyValidationErrors<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>,
  fieldMap: Partial<Record<string, Path<T>>> = {}
): boolean {
  if (!(err instanceof ValidationError)) return false;

  Object.entries(err.errors ?? {}).forEach(([rawKey, messages]) => {
    const camel = (rawKey.charAt(0).toLowerCase() + rawKey.slice(1)) as Path<T>;
    const field = fieldMap[rawKey] ?? camel;
    if (messages[0]) setError(field, { message: messages[0] });
  });

  toast.error(err.message || "Please fix the validation errors.");
  return true;
}
