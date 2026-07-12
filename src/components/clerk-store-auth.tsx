"use client";

import { useClerk, useUser } from "@clerk/nextjs";

import { readClerkRole } from "@/lib/clerk-role";
import type { AuthUser } from "@/lib/types";

export function useStoreAuth() {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { signOut: clerkSignOut } = useClerk();

  const role = readClerkRole(clerkUser?.publicMetadata.role);
  const primaryEmail = clerkUser?.primaryEmailAddress?.emailAddress ?? "";
  const user: AuthUser | null =
    isSignedIn && clerkUser
      ? {
          id: clerkUser.id,
          email: primaryEmail,
          emailConfirmed:
            clerkUser.primaryEmailAddress?.verification?.status === "verified",
          firstName: clerkUser.firstName ?? undefined,
          lastName: clerkUser.lastName ?? undefined,
          phone: clerkUser.primaryPhoneNumber?.phoneNumber ?? undefined,
          role,
        }
      : null;

  return {
    user,
    loading: !isLoaded,
    signOut: async () => {
      await clerkSignOut({ redirectUrl: "/login" });
    },
  };
}
