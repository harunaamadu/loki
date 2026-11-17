import { expect } from "vitest";
import { createProductAction } from "@/actions/product";

expect(
  (
    await createProductAction({
      ...base,
      images: [
        {
          publicId: "x/y",
          url: "https://evil.test/a.jpg",
          width: 1,
          height: 1,
        },
      ],
    })
  ).ok,
).toBe(false); // not hosted on our Cloudinary account
expect(
  (
    await createProductAction({
      ...base,
      images: [
        {
          publicId: "loki/a",
          url: "https://res.cloudinary.com/demo/image/upload/loki/a.jpg",
          width: 1,
          height: 1,
        },
      ],
    })
  ).ok,
).toBe(true);
