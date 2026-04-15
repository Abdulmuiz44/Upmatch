import type { JsonValue } from "@/lib/db/types";

export function toDate(value: Date | string | null): Date | null {
  if (value === null) {
    return null;
  }

  return value instanceof Date ? value : new Date(value);
}

export function toNumber(value: number | string | null): number | null {
  if (value === null) {
    return null;
  }

  return typeof value === "number" ? value : Number(value);
}

export function toStringArray(value: string[] | null): string[] {
  return value ?? [];
}

export function toJson(value: JsonValue | null): JsonValue | null {
  return value ?? null;
}
