import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { cloudinary } from "@/lib/cloudinary";

const inLokiFolder = (v: unknown) =>
  typeof v === "string" && (v === "loki" || v.startsWith("loki/"));

// Only admins get upload signatures, and only for the loki/ folder tree.
export async function POST(req: Request) {
  const session = await auth();
  const u = session?.user;
  if (!u || u.role !== "ADMIN" || !u.verified) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as { paramsToSign?: Record<string, string> };
  const params = body.paramsToSign;
  if (
    !params ||
    !(inLokiFolder(params.folder) || inLokiFolder(params.asset_folder))
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
