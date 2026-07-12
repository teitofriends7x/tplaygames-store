import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";

import { readClerkRole } from "@/lib/clerk-role";
import type { Role } from "@/lib/types";

export type ClerkStoreUser = {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName?: string;
  lastName?: string;
  phone?: string;
  imageUrl?: string;
  role: Role;
};

export async function getCurrentClerkUser(): Promise<ClerkStoreUser | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  if (!user) return null;

  const primaryEmail =
    user.primaryEmailAddress ??
    user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId) ??
    user.emailAddresses[0];
  if (!primaryEmail?.emailAddress) return null;

  const phone =
    user.primaryPhoneNumber?.phoneNumber ?? user.phoneNumbers[0]?.phoneNumber;

  return {
    id: user.id,
    email: primaryEmail.emailAddress.toLowerCase(),
    emailVerified: primaryEmail.verification?.status === "verified",
    firstName: user.firstName ?? undefined,
    lastName: user.lastName ?? undefined,
    phone: phone ?? undefined,
    imageUrl: user.imageUrl || undefined,
    role: readClerkRole(user.publicMetadata.role),
  };
}

export async function getCurrentClerkRole(): Promise<Role | undefined> {
  return (await getCurrentClerkUser())?.role;
}
