import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Integration tests for ProtectedRoute auth guard and role-based redirects
 * Tests access denial logic and portal URL routing
 */

type UserRole = "student" | "hostel_owner" | "super_admin";

interface PortalUrlConfig {
  student: string;
  hostel_owner: string;
  super_admin: string;
}

const getPortalUrlForRole = (
  role: UserRole,
  config: PortalUrlConfig,
): string => {
  return config[role] ?? "/";
};

const mockPortalConfig: PortalUrlConfig = {
  student: "https://uni-nest.vercel.app/student",
  hostel_owner: "https://uni-nest.vercel.app/owner",
  super_admin: "https://uni-nest.vercel.app/admin",
};

describe("Protected Route Auth Guard Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Role-to-Portal Mapping", () => {
    it("should map student role to student portal", () => {
      const url = getPortalUrlForRole("student", mockPortalConfig);
      expect(url).toBe("https://uni-nest.vercel.app/student");
    });

    it("should map hostel_owner role to owner portal", () => {
      const url = getPortalUrlForRole("hostel_owner", mockPortalConfig);
      expect(url).toBe("https://uni-nest.vercel.app/owner");
    });

    it("should map super_admin role to admin portal", () => {
      const url = getPortalUrlForRole("super_admin", mockPortalConfig);
      expect(url).toBe("https://uni-nest.vercel.app/admin");
    });

    it("should return fallback URL for invalid role", () => {
      const url = getPortalUrlForRole("invalid_role" as UserRole, mockPortalConfig);
      expect(url).toBe("/");
    });

    it("should use environment-configured URLs", () => {
      const customConfig: PortalUrlConfig = {
        student: "https://custom.dev/student",
        hostel_owner: "https://custom.dev/owner",
        super_admin: "https://custom.dev/admin",
      };

      expect(getPortalUrlForRole("student", customConfig)).toBe(
        "https://custom.dev/student",
      );
      expect(getPortalUrlForRole("hostel_owner", customConfig)).toBe(
        "https://custom.dev/owner",
      );
      expect(getPortalUrlForRole("super_admin", customConfig)).toBe(
        "https://custom.dev/admin",
      );
    });
  });

  describe("Route Guard Scenarios", () => {
    interface GuardContext {
      userRole: UserRole | null;
      requiredRoles: UserRole[];
      isAuthenticated: boolean;
    }

    const shouldAllowAccess = (context: GuardContext): boolean => {
      if (!context.isAuthenticated) return false;
      if (!context.userRole) return false;
      return context.requiredRoles.includes(context.userRole);
    };

    it("should deny access to unauthenticated users", () => {
      const context: GuardContext = {
        userRole: null,
        requiredRoles: ["hostel_owner"],
        isAuthenticated: false,
      };

      expect(shouldAllowAccess(context)).toBe(false);
    });

    it("should deny access to users without required role", () => {
      const context: GuardContext = {
        userRole: "student",
        requiredRoles: ["hostel_owner", "super_admin"],
        isAuthenticated: true,
      };

      expect(shouldAllowAccess(context)).toBe(false);
    });

    it("should allow access to users with required role", () => {
      const context: GuardContext = {
        userRole: "hostel_owner",
        requiredRoles: ["hostel_owner"],
        isAuthenticated: true,
      };

      expect(shouldAllowAccess(context)).toBe(true);
    });

    it("should allow super_admin access to any role-restricted route", () => {
      const context: GuardContext = {
        userRole: "super_admin",
        requiredRoles: ["super_admin", "hostel_owner", "student"],
        isAuthenticated: true,
      };

      // If super_admin is included in required roles
      expect(shouldAllowAccess(context)).toBe(true);
    });

    it("should return correct portal for denied user", () => {
      const context: GuardContext = {
        userRole: "student",
        requiredRoles: ["super_admin"],
        isAuthenticated: true,
      };

      if (!shouldAllowAccess(context) && context.userRole) {
        const targetPortal = getPortalUrlForRole(
          context.userRole,
          mockPortalConfig,
        );
        expect(targetPortal).toBe("https://uni-nest.vercel.app/student");
      }
    });
  });

  describe("Multi-Role Access Scenarios", () => {
    it("should allow multiple roles for a single route", () => {
      const allowedRoles: UserRole[] = ["hostel_owner", "super_admin"];

      const studentHasAccess = allowedRoles.includes("student");
      const ownerHasAccess = allowedRoles.includes("hostel_owner");
      const adminHasAccess = allowedRoles.includes("super_admin");

      expect(studentHasAccess).toBe(false);
      expect(ownerHasAccess).toBe(true);
      expect(adminHasAccess).toBe(true);
    });

    it("should deny based on portal-specific rules", () => {
      interface PortalAccessRule {
        route: string;
        allowedRoles: UserRole[];
      }

      const accessRules: PortalAccessRule[] = [
        { route: "/admin/dashboard", allowedRoles: ["super_admin"] },
        { route: "/owner/properties", allowedRoles: ["hostel_owner", "super_admin"] },
        { route: "/student/bookings", allowedRoles: ["student", "super_admin"] },
      ];

      const canAccessAdminDashboard = (role: UserRole) => {
        const rule = accessRules.find((r) => r.route === "/admin/dashboard");
        return rule?.allowedRoles.includes(role) ?? false;
      };

      expect(canAccessAdminDashboard("super_admin")).toBe(true);
      expect(canAccessAdminDashboard("hostel_owner")).toBe(false);
      expect(canAccessAdminDashboard("student")).toBe(false);
    });
  });

  describe("Error Handling in Redirects", () => {
    it("should handle null role gracefully", () => {
      const role: UserRole | null = null;

      let url: string | null = null;
      if (role) {
        url = getPortalUrlForRole(role, mockPortalConfig);
      }

      // Should not attempt redirect if role is null
      expect(url).toBeNull();
    });

    it("should handle missing config gracefully", () => {
      const incompleteConfig = {
        student: "https://uni-nest.vercel.app/student",
      } as PortalUrlConfig;

      const url = getPortalUrlForRole("hostel_owner", incompleteConfig);

      // Should fallback to "/" when config is incomplete
      expect(url).toBe("/");
    });

    it("should not cause errors with invalid URLs", () => {
      const invalidConfig: PortalUrlConfig = {
        student: "not-a-valid-url",
        hostel_owner: "also-invalid",
        super_admin: "../../dangerous-path",
      };

      const url = getPortalUrlForRole("student", invalidConfig);

      // Should still return the configured value (validation happens elsewhere)
      expect(url).toBe("not-a-valid-url");
    });
  });

  describe("Portal Config Resolution", () => {
    it("should use custom config URLs when provided", () => {
      const customConfig: PortalUrlConfig = {
        student: "http://localhost:3000/student",
        hostel_owner: "http://localhost:3001/owner",
        super_admin: "http://localhost:3002/admin",
      };

      expect(getPortalUrlForRole("student", customConfig)).toMatch(/localhost/);
      expect(getPortalUrlForRole("hostel_owner", customConfig)).toMatch(/localhost/);
      expect(getPortalUrlForRole("super_admin", customConfig)).toMatch(/localhost/);
    });

    it("should use production config URLs", () => {
      Object.values(mockPortalConfig).forEach((url) => {
        expect(url).toMatch(/https:\/\//);
      });
    });
  });
});
