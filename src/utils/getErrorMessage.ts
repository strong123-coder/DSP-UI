type ApiErrorResponse =
  | { error: string }
  | { detail: string }
  | Record<string, string | string[]>;

export function extractApiErrors(response: unknown): string[] {
  const errors: string[] = [];

  if (typeof response !== "object" || response === null) {
    return ["An unknown error occurred."];
  }

  const res = response as ApiErrorResponse;

  // Case 1: { error: "some error" }
  if ("error" in res && typeof res.error === "string") {
    errors.push(res.error);
  }

  // Case 2: { detail: "some error" }
  if ("detail" in res && typeof res.detail === "string") {
    errors.push(res.detail);
  }

  // Case 3 & 4: field-level errors { username: "required" } or { email: ["required"] }
  for (const [key, value] of Object.entries(res)) {
    if (key === "error" || key === "detail") continue;

    if (typeof value === "string") {
      errors.push(`${key}: ${value}`);
    } else if (Array.isArray(value)) {
      value.forEach((msg) => {
        if (typeof msg === "string") {
          errors.push(`${key}: ${msg}`);
        }
      });
    }
  }

  return errors.length ? errors : ["An unknown error occurred."];
}
