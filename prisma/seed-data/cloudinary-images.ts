// Cloudinary public IDs (assets live in the `loki` asset folder; IDs have no folder prefix).
// Keyed by catalog product id. Dimensions are the uploaded originals.

export interface SeedImage {
  publicId: string;
  width: number;
  height: number;
}

const p = (publicId: string): SeedImage => ({
  publicId,
  width: 896,
  height: 1200,
});

export const PRODUCT_IMAGES: Record<string, SeedImage[]> = {
  "loki-bv-01": [p("bag_woven_leather_1794776657063_ato3zn")],
  "loki-ch-02": [p("bag_quilted_tote_1794776657868_nshheg")],
  "loki-row-03": [p("dress_silk_draped_1794776657109_wcwvma")],
  "loki-max-04": [p("coat_cashmere_camel_1794776658639_vcepxh")],
  "loki-tot-05": [p("blazer_ivory_wool_1794776658137_hfea8f")],
  "loki-pr-06": [p("shoes_slingback_heels_1794776659088_am7ahi")],
  "loki-miu-07": [p("shoes_loafers_leather_1794776660357_xrjtfw")],
  "loki-loe-08": [p("jewelry_sculptural_cuff_1794776660605_zgekd9")],
  "loki-kp-09": [p("knit_cashmere_sweater_1794776661174_nvdvx6")],
  "loki-men-01": [p("men_coat_tailoring_1794778829283_xv1icw")],
  "loki-men-02": [p("men_leather_weekender_1794778830448_lun6ti")],
  "loki-men-03": [p("men_suede_loafers_1794778831080_jkd7jd")],
  "loki-kids-01": [p("kids_knit_cardigan_1794778830042_kicckv")],
  "loki-kids-02": [p("kids_leather_sneakers_1794778831142_ziz5ry")],
};

// Reserved for the home page hero banners (not attached to any product).
export const HERO_IMAGES = {
  women: {
    publicId: "hero_women_editorial_1794776658094_sfonfo",
    width: 1376,
    height: 768,
  },
  men: {
    publicId: "hero_men_editorial_1794778829590_exzxrq",
    width: 1376,
    height: 768,
  },
} as const;

export function cloudinaryUrl(publicId: string): string {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloud) throw new Error("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set");
  return `https://res.cloudinary.com/${cloud}/image/upload/${publicId}`;
}
