import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

// Usage: npx tsx scripts/list-cloudinary.ts [folder]
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

type R = {
  public_id: string;
  width?: number;
  height?: number;
  display_name?: string;
  resource_type?: string;
};

async function main() {
  const folder = process.argv[2] ?? "loki";
  let rows: R[] = [];
  let cursor: string | undefined;

  try {
    do {
      const r = await cloudinary.api.resources_by_asset_folder(folder, {
        max_results: 100,
        next_cursor: cursor,
      });
      rows = rows.concat(r.resources as R[]);
      cursor = r.next_cursor as string | undefined;
    } while (cursor);
  } catch {
    rows = [];
  }
  if (rows.length === 0) {
    const r = await cloudinary.api.resources({
      type: "upload",
      prefix: `${folder}/`,
      max_results: 500,
    });
    rows = r.resources as R[];
  }

  for (const r of rows.filter(
    (x) => !x.resource_type || x.resource_type === "image",
  )) {
    console.log(
      `${r.public_id}\t${r.width}x${r.height}\t${r.display_name ?? ""}`,
    );
  }
  console.log(`\n${rows.length} asset(s) in "${folder}"`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
