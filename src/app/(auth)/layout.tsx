import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-8 px-4 py-12">
      <Link
        href="/"
        className="text-center text-lg font-semibold tracking-tight"
      >
        Loki
      </Link>
      {children}
    </div>
  );
}
