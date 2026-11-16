import { CheckoutForm } from "@/components/checkout/checkout-form";
import { requirePageUser } from "@/lib/guards";

export default async function CheckoutPage() {
  const user = await requirePageUser("/checkout");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Checkout</h1>
      <CheckoutForm defaultName={user.name ?? ""} />
    </div>
  );
}
