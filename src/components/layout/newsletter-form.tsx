"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { subscribeAction } from "@/actions/newsletter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PREFERENCES } from "@/lib/labels";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function NewsletterForm() {
  const [pending, start] = useTransition();
  const [email, setEmail] = useState("");
  const [pref, setPref] = useState<(typeof PREFERENCES)[number]>("ALL");

  return (
    <form
      className="flex flex-wrap gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await subscribeAction({
            email,
            departmentPreference: pref,
            source: "footer",
          });
          if (res.ok) {
            toast.success("Thank you for subscribing");
            setEmail("");
          } else {
            toast.error(res.error);
          }
        });
      }}
    >
      <Input
        type="email"
        required
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={pending}
        className="max-w-xs"
      />
      <Select
        value={pref}
        onValueChange={(value) =>
          setPref(value as (typeof PREFERENCES)[number])
        }
        disabled={pending}
      >
        <SelectTrigger className="w-full max-w-28">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>

        <SelectContent>
          <SelectGroup>
            <SelectLabel>Categories</SelectLabel>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="WOMEN">Women</SelectItem>
            <SelectItem value="MEN">Men</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button type="submit" disabled={pending}>
        {pending ? "Subscribing..." : "Subscribe"}
      </Button>
    </form>
  );
}
