import { CheckoutForm } from "@/components/checkout/checkout-form";
import { requirePageUser } from "@/lib/guards";
import { getProfile } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await requirePageUser("/checkout");
  if (!user.verified) {
    return (
      <p>
        Please verify your email address before checking out. Check your inbox
        or use the banner above.
      </p>
    );
  }
  const p = await getProfile(user.id);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Checkout</h1>
      <CheckoutForm
        defaults={{
          name: p?.name ?? "",
          phone: p?.phone ?? "",
          city: p?.city ?? "",
          country: p?.country ?? "",
          street: p?.streetAddress ?? "",
        }}
      />
    </div>
  );
}
