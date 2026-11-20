"use client";

import { useCallback, useEffect, useState } from "react";
import { CldImage } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { UploadedImage } from "@/lib/types";

interface Asset extends UploadedImage {
  name: string;
}
interface Listing {
  folders: string[];
  assets: Asset[];
  nextCursor: string | null;
  error?: string;
}

interface Props {
  selected: string[];
  onAdd: (image: UploadedImage) => void;
  onRemove: (publicId: string) => void;
}

const ROOT = "loki";

export function CloudinaryLibraryPicker({ selected, onAdd, onRemove }: Props) {
  const [open, setOpen] = useState(false);
  const [folder, setFolder] = useState(ROOT);
  const [folders, setFolders] = useState<string[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (path: string, next?: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ folder: path });
      if (next) qs.set("cursor", next);
      const res = await fetch(`/api/admin/cloudinary-assets?${qs}`, {
        cache: "no-store",
      });
      const json = (await res.json()) as Listing;
      if (!res.ok) throw new Error(json.error ?? "Could not load the library.");
      if (!next) setFolders(json.folders);
      setAssets((prev) => (next ? [...prev, ...json.assets] : json.assets));
      setCursor(json.nextCursor);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load the library.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch the library from the API whenever the dialog opens or the folder changes.
  useEffect(() => {
    if (open) void load(folder);
  }, [open, folder, load]);

  function toggle(a: Asset) {
    if (selected.includes(a.publicId)) onRemove(a.publicId);
    else
      onAdd({
        publicId: a.publicId,
        url: a.url,
        width: a.width,
        height: a.height,
      });
  }

  const parent = folder.includes("/")
    ? folder.slice(0, folder.lastIndexOf("/"))
    : null;

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        Choose from library
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-2xl"
        >
          <SheetHeader>
            <SheetTitle>Cloudinary library</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 px-4 pb-4">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {parent && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setFolder(parent)}
                >
                  ← Up
                </Button>
              )}
              <span className="text-muted-foreground">/{folder}</span>
            </div>

            {folders.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {folders.map((f) => (
                  <Button
                    key={f}
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setFolder(f)}
                  >
                    {f.split("/").pop()}
                  </Button>
                ))}
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
            {!loading && !error && assets.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No images in this folder.
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {assets.map((a) => {
                const on = selected.includes(a.publicId);
                return (
                  <button
                    key={a.publicId}
                    type="button"
                    onClick={() => toggle(a)}
                    aria-pressed={on}
                    title={a.name}
                    className={cn(
                      "relative aspect-square overflow-hidden border bg-secondary",
                      on && "ring-2 ring-foreground",
                    )}
                  >
                    <CldImage
                      src={a.publicId}
                      width={300}
                      height={300}
                      crop="fill"
                      gravity="auto"
                      alt={a.name}
                      className="h-full w-full object-cover"
                    />
                    {on && (
                      <span className="absolute right-1 top-1 bg-foreground px-1.5 py-0.5 text-[10px] uppercase text-background">
                        Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {loading && (
              <p className="text-sm text-muted-foreground">Loading…</p>
            )}
            {cursor && !loading && (
              <Button
                type="button"
                variant="outline"
                onClick={() => void load(folder, cursor)}
              >
                Load more
              </Button>
            )}
          </div>

          <div className="mt-auto border-t p-4">
            <Button
              type="button"
              className="w-full"
              onClick={() => setOpen(false)}
            >
              Done ({selected.length} selected)
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
