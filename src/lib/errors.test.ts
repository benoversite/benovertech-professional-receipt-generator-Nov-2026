import { describe, expect, it } from "vitest";
import { getErrorMessage } from "@/lib/errors";

describe("getErrorMessage", () => {
  it("returns an Error message", () => {
    expect(getErrorMessage(new Error("Request failed"), "Fallback")).toBe("Request failed");
  });

  it("returns a message from Supabase-style error objects", () => {
    expect(getErrorMessage({ message: "Permission denied" }, "Fallback")).toBe("Permission denied");
  });

  it("uses the fallback when an error has no message", () => {
    expect(getErrorMessage({ code: "unknown" }, "Fallback")).toBe("Fallback");
  });
});
