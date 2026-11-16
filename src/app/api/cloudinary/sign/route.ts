import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { cloudinary } from "@/lib/cloudinary";

// Replaces Firebase Storage rules: only admins can obtain upload signatures,
// and only for the loki/ folder.
export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as { paramsToSign?: Record<string, string> };
  const params = body.paramsToSign;
  if (
    !params ||
    typeof params.folder !== "string" ||
    !params.folder.startsWith("loki/")
  ) {
    return NextResponse.json(
      { error: "Invalid upload parameters" },
      { status: 400 },
    );
  }

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!,
  );
  return NextResponse.json({ signature });
}
