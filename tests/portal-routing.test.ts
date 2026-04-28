import { describe, expect, it } from "vitest";
import { getPortalUrlForRole } from "../packages/shared/src/lib/portalRouting";

describe("getPortalUrlForRole", () => {
  const config = {
    student: "https://student.example.com",
    hostel_owner: "https://owner.example.com",
    super_admin: "https://admin.example.com",
  };

  it("returns student portal URL", () => {
    expect(getPortalUrlForRole("student", config)).toBe(config.student);
  });

  it("returns owner portal URL", () => {
    expect(getPortalUrlForRole("hostel_owner", config)).toBe(config.hostel_owner);
  });

  it("returns super admin portal URL", () => {
    expect(getPortalUrlForRole("super_admin", config)).toBe(config.super_admin);
  });
});
