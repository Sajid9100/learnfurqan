import { auth, currentUser } from "@clerk/nextjs/server";

export type AuthedStudent = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
};

/**
 * Resolve the authenticated student's primary email from Clerk.
 * Returns null when no user is signed in.
 */
export async function getAuthedStudent(): Promise<AuthedStudent | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  if (!user) return null;

  const primary = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId
  );
  const email = (primary?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? "").toLowerCase();
  if (!email) return null;

  const firstName = user.firstName ?? "";
  const lastName = user.lastName ?? "";
  return {
    userId,
    email,
    firstName,
    lastName,
    fullName: [firstName, lastName].filter(Boolean).join(" ") || email,
  };
}
