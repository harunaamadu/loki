import { ProfileForm } from "@/components/account/profile-form";
import { requirePageUser } from "@/lib/guards";
import { getProfile } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string }>;
}) {
  const user = await requirePageUser("/account");
  const { verified } = await searchParams;
  const profile = await getProfile(user.id);
  if (!profile) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Account</h1>
      {verified === "1" && (
        <p className="text-sm">Your email has been verified. Thank you!</p>
      )}
      <p className="text-sm text-muted-foreground">
        {profile.email} · {profile.emailVerified ? "Verified" : "Not verified"}
      </p>
      {profile.emailVerified ? (
        <ProfileForm
          initial={{
            name: profile.name ?? "",
            phone: profile.phone ?? "",
            city: profile.city ?? "",
            country: profile.country ?? "",
            streetAddress: profile.streetAddress ?? "",
            currency: profile.currency,
          }}
        />
      ) : (
        <p className="text-sm">Verify your email to edit your profile.</p>
      )}
    </div>
  );
}
