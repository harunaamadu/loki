import { auth } from "@/auth";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BagDrawer } from "@/components/bag/bag-drawer";
import { BagHydrator } from "@/components/bag/bag-hydrator";
import { VerifyBanner } from "@/components/auth/verify-banner";
import { getBagForUser } from "@/lib/queries";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;
  const bag = user ? await getBagForUser(user.id) : [];

  return (
    <>
      {user && !user.verified && <VerifyBanner />}
      <Header />
      <BagHydrator initial={bag} />
      <BagDrawer />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
      <Footer defaultSubscriberEmail={user?.email ?? ""} />
    </>
  );
}
