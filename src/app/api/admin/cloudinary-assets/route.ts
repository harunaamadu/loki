import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { cloudinary } from "@/lib/cloudinary";

interface Resource {
  public_id: string;
  secure_url: string;
  resource_type?: string;
  width?: number;
  height?: number;
  display_name?: string;
}

const FOLDER_RE = /^loki(\/[A-Za-z0-9 _\-.]+)*$/;

// Lists assets in the loki/ folder tree so an admin can attach them to products. Admin + verified only.
export async function GET(req: NextRequest) {
  const session = await auth();
  const u = session?.user;
  if (!u || u.role !== "ADMIN" || !u.verified) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const folder = req.nextUrl.searchParams.get("folder") ?? "loki";
  const cursor = req.nextUrl.searchParams.get("cursor") ?? undefined;
  if (!FOLDER_RE.test(folder) || folder.includes("..")) {
    return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
  }

  try {
    let resources: Resource[] = [];
    let nextCursor: string | null = null;

    try {
      // Dynamic folder mode: assets are organised by asset_folder
      const r = await cloudinary.api.resources_by_asset_folder(folder, {
        max_results: 60,
        next_cursor: cursor,
      });
      resources = r.resources as Resource[];
      nextCursor = (r.next_cursor as string | undefined) ?? null;
    } catch {
      /* older fixed-folder accounts: handled below */
    }

    if (resources.length === 0 && !cursor) {
      // Fixed folder mode: the folder is part of the public_id
      const r = await cloudinary.api.resources({
        type: "upload",
        resource_type: "image",
        prefix: `${folder}/`,
        max_results: 60,
      });
      resources = r.resources as Resource[];
      nextCursor = (r.next_cursor as string | undefined) ?? null;
    }

    let folders: string[] = [];
    if (!cursor) {
      try {
        const f = await cloudinary.api.sub_folders(folder);
        folders = (f.folders as { path: string }[]).map((x) => x.path);
      } catch {
        folders = [];
      }
    }

    const assets = resources
      .filter((r) => !r.resource_type || r.resource_type === "image")
      .map((r) => ({
        publicId: r.public_id,
        url: r.secure_url,
        width: r.width ?? null,
        height: r.height ?? null,
        name: r.display_name ?? r.public_id.split("/").pop() ?? r.public_id,
      }));

    return NextResponse.json(
      { folders, assets, nextCursor },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    console.error("cloudinary-assets failed", e);
    return NextResponse.json(
      { error: "Could not load the Cloudinary library." },
      { status: 502 },
    );
  }
}
