"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Link2, Mail, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { productShareUrl, shareLinks } from "@/lib/share";

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    /* clipboard API unavailable or blocked: fall through to the legacy method */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

const itemClass =
  "flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none";

export function ShareButton({
  productId,
  text,
}: {
  productId: string;
  text: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();

    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const currentUrl = () => productShareUrl(window.location.origin, productId);

  async function copy() {
    const ok = await copyText(currentUrl());
    if (ok) {
      toast.success("Link copied");
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error(
        "Couldn't copy the link. Please copy it from the address bar.",
      );
    }
    setOpen(false);
  }

  async function onTriggerClick() {
    // Phones and tablets: use the native share sheet. Desktop: show the menu.
    const native =
      typeof navigator.share === "function" &&
      window.matchMedia("(pointer: coarse)").matches;
    if (!native) {
      setOpen((v) => !v);
      return;
    }
    try {
      await navigator.share({ title: text, text, url: currentUrl() });
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return; // user closed the sheet
      await copy();
    }
  }

  function onMenuKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    );
    const i = items.indexOf(document.activeElement as HTMLElement);
    const next =
      e.key === "ArrowDown"
        ? (i + 1) % items.length
        : (i - 1 + items.length) % items.length;
    items[next]?.focus();
  }

  // Computed when the menu is open (client only), so the server render never touches `window`
  const links = open ? shareLinks(currentUrl(), text) : null;

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        size="icon"
        aria-label="Share this product"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={onTriggerClick}
      >
        {copied ? (
          <Check className="h-4 w-4" aria-hidden />
        ) : (
          <Share2 className="h-4 w-4" aria-hidden />
        )}
      </Button>

      {open && links && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Share"
          onKeyDown={onMenuKeyDown}
          className="absolute right-0 top-full z-30 mt-2 w-56 border bg-background py-1 shadow-md"
        >
          <button
            type="button"
            role="menuitem"
            onClick={copy}
            className={itemClass}
          >
            <Link2 className="h-4 w-4" aria-hidden />
            Copy link
          </button>
          <a
            role="menuitem"
            href={links.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className={itemClass}
          >
            WhatsApp
          </a>
          <a
            role="menuitem"
            href={links.facebook}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className={itemClass}
          >
            Facebook
          </a>
          <a
            role="menuitem"
            href={links.x}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className={itemClass}
          >
            X
          </a>
          <a
            role="menuitem"
            href={links.email}
            onClick={() => setOpen(false)}
            className={itemClass}
          >
            <Mail className="h-4 w-4" aria-hidden />
            Email
          </a>
        </div>
      )}
    </div>
  );
}
