"use client";

import { useState, useTransition } from "react";
import { subscribeAction } from "@/actions/newsletter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Preference = "WOMEN" | "MEN" | "ALL";

const OPTIONS: [Preference, string][] = [
  ["WOMEN", "Women"],
  ["MEN", "Men"],
  ["ALL", "Both"],
];

export function NewsletterSignup({
  defaultEmail = "",
}: {
  defaultEmail?: string;
}) {
  const [email, setEmail] = useState(defaultEmail);
  const [preference, setPreference] = useState<Preference>("ALL");
  const [subscribedAs, setSubscribedAs] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await subscribeAction({
        email,
        departmentPreference: preference,
        source: "footer",
      });
      if (res.ok) setSubscribedAs(email.trim().toLowerCase());
      else setError(res.error);
    });
  }

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="grid gap-6 border-b border-border pb-8 md:grid-cols-2 md:items-center"
    >
      <div>
        <h2
          id="newsletter-heading"
          className="text-sm font-semibold uppercase tracking-[0.12em]"
        >
          Join the Loki list
        </h2>
        <p className="mt-2 max-w-md text-xs leading-relaxed text-muted-foreground">
          New arrivals from our partner boutiques and private offers, delivered
          to your inbox. We only email about new arrivals and offers.
        </p>
      </div>

      <div aria-live="polite">
        {subscribedAs ? (
          <div className="space-y-2 text-sm">
            <p>
              Thank you. <span className="font-medium">{subscribedAs}</span> is
              on the list.
            </p>
            <button
              type="button"
              onClick={() => {
                setSubscribedAs(null);
                setEmail("");
              }}
              className="cursor-pointer text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3" noValidate={false}>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <Input
                id="newsletter-email"
                type="email"
                required
                autoComplete="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "newsletter-error" : undefined}
              />
              <Button type="submit" disabled={pending} className="shrink-0">
                {pending ? "Subscribing…" : "Subscribe"}
              </Button>
            </div>

            <fieldset className="flex flex-wrap items-center gap-2">
              <legend className="sr-only">
                Which collections are you interested in?
              </legend>
              <span className="text-xs text-muted-foreground">
                I&apos;m interested in:
              </span>
              {OPTIONS.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={preference === value}
                  onClick={() => setPreference(value)}
                  className={cn(
                    "cursor-pointer border px-3 py-1.5 text-xs transition-colors",
                    preference === value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </fieldset>

            {error && (
              <p
                id="newsletter-error"
                role="alert"
                className="text-xs text-destructive"
              >
                {error}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
