// Cards for the home page "Shop by Wardrobe" section. Image IDs are Cloudinary public IDs.
export const DEPARTMENT_CARDS = [
  {
    key: "WOMEN",
    label: "Women",
    subtitle: "Autumn / Winter Runways & Icons",
    href: "/shop?department=WOMEN",
    publicId: "coat_cashmere_camel_1794776658639_vcepxh",
  },
  {
    key: "MEN",
    label: "Men",
    subtitle: "Savile & Milanese Tailoring",
    href: "/shop?department=MEN",
    publicId: "men_coat_tailoring_1794778829283_xv1icw",
  },
  {
    key: "KIDS",
    label: "Kids",
    subtitle: "Junior Heritage Knitwear & Footwear",
    href: "/shop?department=KIDS",
    publicId: "kids_knit_cardigan_1794778830042_kicckv",
  },
  {
    key: "PRE_OWNED",
    label: "Pre-Owned",
    subtitle: "Authenticated Archive Icons",
    href: "/shop?condition=PRE_OWNED",
    publicId: "bag_quilted_tote_1794776657868_nshheg",
  },
] as const;

export type DepartmentCardKey = (typeof DEPARTMENT_CARDS)[number]["key"];
