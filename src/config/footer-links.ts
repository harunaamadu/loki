export interface FooterLinkItem {
  label: string;
  path: string;
  slug?: string;
}

export interface FooterGroup {
  id: string;
  title: string;
  links: FooterLinkItem[];
}

export interface InfoSection {
  heading: string;
  body: string;
  bullets?: string[];
}

export interface InfoFaqItem {
  question: string;
  answer: string;
}

export interface FashionStory {
  kicker: string;
  title: string;
  summary: string;
  ctaLabel: string;
  ctaPath: string;
}

export interface InfoPageEntry {
  slug: string;
  category: string;
  title: string;
  subtitle: string;
  sections: InfoSection[];
  primaryCta?: { label: string; path: string };
  secondaryCta?: { label: string; path: string };
  faqs?: InfoFaqItem[];
  stories?: FashionStory[];
  isContact?: boolean;
  isSitemap?: boolean;
}

export const FOOTER_GROUPS: FooterGroup[] = [
  {
    id: 'customer-service',
    title: 'Customer Service',
    links: [
      { label: 'Contact us', path: '/gh/info/contact-us', slug: 'contact-us' },
      { label: 'FAQs', path: '/gh/info/faqs', slug: 'faqs' },
      { label: 'Orders and delivery', path: '/gh/info/orders-and-delivery', slug: 'orders-and-delivery' },
      { label: 'Returns and refunds', path: '/gh/info/returns-and-refunds', slug: 'returns-and-refunds' },
      { label: 'Payment and pricing', path: '/gh/info/payment-and-pricing', slug: 'payment-and-pricing' },
      { label: 'Cryptocurrency payments', path: '/gh/info/cryptocurrency-payments', slug: 'cryptocurrency-payments' },
      {
        label: 'Promotion terms and conditions',
        path: '/gh/info/promotion-terms-and-conditions',
        slug: 'promotion-terms-and-conditions',
      },
      { label: 'Loki Customer Promise', path: '/gh/info/customer-promise', slug: 'customer-promise' },
    ],
  },
  {
    id: 'about-loki',
    title: 'About Loki',
    links: [
      { label: 'About us', path: '/gh/info/about-us', slug: 'about-us' },
      { label: 'Press releases', path: '/gh/info/press-releases', slug: 'press-releases' },
      { label: 'Loki partner boutiques', path: '/gh/boutiques' },
      { label: 'Careers', path: '/gh/info/careers', slug: 'careers' },
      { label: 'Loki app', path: '/gh/info/loki-app', slug: 'loki-app' },
      {
        label: 'Modern slavery statement',
        path: '/gh/info/modern-slavery-statement',
        slug: 'modern-slavery-statement',
      },
      { label: 'Loki Advertising', path: '/gh/info/advertising', slug: 'advertising' },
      { label: 'Sitemap', path: '/gh/info/sitemap', slug: 'sitemap' },
    ],
  },
  {
    id: 'discounts-membership',
    title: 'Discounts and membership',
    links: [
      { label: 'Affiliate program', path: '/gh/info/affiliate-program', slug: 'affiliate-program' },
      { label: 'Refer a friend', path: '/gh/info/refer-a-friend', slug: 'refer-a-friend' },
      { label: 'Loki membership', path: '/gh/info/membership', slug: 'membership' },
      {
        label: 'Student Beans and Graduates',
        path: '/gh/info/student-beans-and-graduates',
        slug: 'student-beans-and-graduates',
      },
    ],
  },
  {
    id: 'content-services',
    title: 'Content and services',
    links: [
      {
        label: 'Fashion Feed: the latest style stories',
        path: '/gh/info/fashion-feed',
        slug: 'fashion-feed',
      },
    ],
  },
];

export const INFO_PAGES: Record<string, InfoPageEntry> = {
  'contact-us': {
    slug: 'contact-us',
    category: 'Customer Service',
    title: 'Contact Client Concierge',
    subtitle:
      'Dedicated styling, order logistics, and boutique provenance assistance across Accra, London, Paris, and worldwide.',
    isContact: true,
    sections: [
      {
        heading: 'Direct Client Desks',
        body: 'Our multilingual concierge specialists coordinate directly with partner ateliers in Milan, Stockholm, Paris, and Accra to resolve sizing, authentication, and DHL Express DDP inquiries.',
        bullets: [
          'Accra Private Client Desk: Airport Residential & Cantonments · Mon–Sat 08:00–20:00 GMT',
          'Global Order Desk: concierge@loki.gh · +233 30 274 8810',
          'Private Client Priority Line: Active within your Account Suite for dispatched orders',
        ],
      },
    ],
    primaryCta: { label: 'Track Existing Order', path: '/gh/account?tab=orders' },
  },
  faqs: {
    slug: 'faqs',
    category: 'Customer Service',
    title: 'Frequently Asked Questions',
    subtitle: 'Answers covering boutique sourcing, import duties for Ghana, payments, and returns.',
    sections: [],
    faqs: [
      {
        question: 'Are Ghana import duties included at checkout?',
        answer:
          'Yes. Every Loki shipment bound for Accra, Kumasi, Takoradi, or worldwide destinations uses Delivered Duty Paid (DDP) settlement—all customs duties (8% standard Ghana luxury DDP) are calculated upfront so DHL Express delivers straight to your door without surprise customs fees.',
      },
      {
        question: 'How does Loki verify authenticity across independent boutiques?',
        answer:
          'Every boutique in the Loki network is vetted before onboarding. New Season, Conscious, and Pre-Owned archive pieces ship with boutique provenance seals, serial verification cards, and original atelier packaging.',
      },
      {
        question: 'Can I pay in Ghanaian Cedis (GHS) or Mobile Money?',
        answer:
          'Switch currency anytime between USD ($) and GHS (₵) in the top utility bar or footer. At checkout, you can settle via Visa/Mastercard, Apple Pay, MTN Mobile Money, or Telecel Cash.',
      },
      {
        question: 'What happens if an item is out of stock in my size?',
        answer:
          'Select any sold-out size on the product page and click "Email me when back in stock" to register a restock alert tied to boutique inventory replenishment.',
      },
    ],
    primaryCta: { label: 'Browse All Pieces', path: '/gh/shopping/all' },
  },
  'orders-and-delivery': {
    slug: 'orders-and-delivery',
    category: 'Customer Service',
    title: 'Orders and Delivery',
    subtitle: 'Express air dispatch from European and North American ateliers directly to Ghana & global addresses.',
    sections: [
      {
        heading: 'DHL Express DDP Timelines',
        body: 'Orders are prepared by the originating partner boutique within 24 hours of confirmation.',
        bullets: [
          'Accra & Tema: 2–4 business days via DHL Express DDP',
          'Kumasi & Takoradi: 3–5 business days insured door-to-door',
          'Complimentary shipping on all orders over $500 ($25 standard flat fee below $500; $55 Atelier Priority Courier)',
        ],
      },
      {
        heading: 'Real-Time Tracking & Stock Reservation',
        body: 'Boutique stock decrements immediately upon order placement. Follow every milestone from Order Placed through Boutique Authentication to In Transit via DHL inside your Client Suite.',
      },
    ],
    primaryCta: { label: 'Track Your Order', path: '/gh/account?tab=orders' },
    secondaryCta: { label: 'Explore Partner Boutiques', path: '/gh/boutiques' },
  },
  'returns-and-refunds': {
    slug: 'returns-and-refunds',
    category: 'Customer Service',
    title: 'Returns and Refunds',
    subtitle: 'Complimentary 14-day courier return collection with full duty reimbursement.',
    sections: [
      {
        heading: '14-Day Complimentary Return Window',
        body: 'If a piece does not fit as intended, request collection within 14 days of delivery. Items must remain unworn with Loki and boutique security tags intact alongside original dust bags and boxes.',
        bullets: [
          'Complimentary DHL return pickup from your Accra, Kumasi, or international address',
          'Original Ghana DDP import duties and taxes refunded automatically on eligible returns',
          'Refunds processed within 3–5 business days after atelier inspection',
        ],
      },
      {
        heading: 'Order Cancellations Before Dispatch',
        body: 'Orders in the "Order Placed" stage can be cancelled directly from your Account order ledger, immediately restoring boutique inventory.',
      },
    ],
    primaryCta: { label: 'Manage Orders in Account', path: '/gh/account?tab=orders' },
  },
  'payment-and-pricing': {
    slug: 'payment-and-pricing',
    category: 'Customer Service',
    title: 'Payment and Pricing',
    subtitle: 'Transparent multi-boutique pricing in USD ($) and GHS (₵) with zero hidden fees.',
    sections: [
      {
        heading: 'Accepted Payment Methods',
        body: 'Loki checkout supports international and Ghanaian local payment rails over 256-bit TLS encryption.',
        bullets: [
          'International Visa, Mastercard, and American Express cards',
          'MTN Mobile Money & Telecel Cash instant mobile authorization',
          'Apple Pay express settlement on compatible Safari & iOS devices',
        ],
      },
      {
        heading: 'Why Boutique Prices Can Vary',
        body: 'Because Loki connects over 1,400 independent boutiques across Europe, North America, and Japan, pricing reflects each partner boutique’s regional retail valuation and availability.',
      },
    ],
    primaryCta: { label: 'View Shopping Bag', path: '/gh/bag' },
  },
  'cryptocurrency-payments': {
    slug: 'cryptocurrency-payments',
    category: 'Customer Service',
    title: 'Cryptocurrency Payments',
    subtitle: 'Guidance on digital asset settlement availability and verified payment gateways.',
    sections: [
      {
        heading: 'Supported Digital Asset Settlement Regions',
        body: 'Select Loki private client orders and international boutique settlements support regulated crypto-to-fiat conversion via approved payment partners in eligible jurisdictions.',
        bullets: [
          'Instant rate lock during the checkout authorization window to shield against volatility',
          'Full transaction receipts issued in your chosen display currency (USD or GHS)',
          'All orders within Ghana settle primarily via Card, MTN Mobile Money, Telecel Cash, or Apple Pay in compliance with local settlement guidelines',
        ],
      },
    ],
    primaryCta: { label: 'Contact Private Client Desk', path: '/gh/info/contact-us' },
  },
  'promotion-terms-and-conditions': {
    slug: 'promotion-terms-and-conditions',
    category: 'Customer Service',
    title: 'Promotion Terms and Conditions',
    subtitle: 'Eligibility rules for Loki privilege codes, seasonal private sales, and complimentary shipping.',
    sections: [
      {
        heading: 'Active Privilege Codes',
        body: 'Apply eligible codes inside your Shopping Bag prior to entering checkout settlement.',
        bullets: [
          'LOKI10 — 10% off eligible catalog orders (single privilege code per order)',
          'ACCRAVIP — $150 privilege reduction on qualifying orders of $1,000 USD or more',
          'Complimentary DHL Express DDP applies automatically when merchandise subtotal reaches $500+',
        ],
      },
      {
        heading: 'Exclusions & Adjustments',
        body: 'Certain archival Pre-Owned pieces and limited capsule releases may carry partner-boutique restrictions. Privilege codes cannot be applied retroactively after dispatch.',
      },
    ],
    primaryCta: { label: 'Shop Private Sale', path: '/gh/shopping/sale' },
  },
  'customer-promise': {
    slug: 'customer-promise',
    category: 'Customer Service',
    title: 'The Loki Customer Promise',
    subtitle: 'Authenticity guaranteed, duties settled upfront, and effortless global curation.',
    sections: [
      {
        heading: 'Four Pillars of Trust',
        body: 'Every purchase on Loki is protected end-to-end from the moment a boutique reserves your piece.',
        bullets: [
          '100% Authentic Luxury — Sourced solely from authorized designers and curated partner boutiques',
          'Guaranteed DDP Pricing — Transparent Ghana duties calculated before you pay',
          'Real-Time Inventory Integrity — Direct stock allocation with zero phantom listings',
          'Protected 14-Day Returns — Complimentary courier pickup and full duty refund',
        ],
      },
    ],
    primaryCta: { label: 'Explore Curated Boutiques', path: '/gh/boutiques' },
  },
  'about-us': {
    slug: 'about-us',
    category: 'About Loki',
    title: 'About Loki',
    subtitle: 'The global luxury fashion platform connecting discerning wardrobes in Ghana and worldwide to independent boutiques.',
    sections: [
      {
        heading: 'Our Editorial Mission',
        body: 'Founded to unite independent luxury ateliers and heritage fashion houses with modern collectors across Accra, Kumasi, Takoradi, London, and Paris, Loki delivers museum-grade curation with frictionless cross-border logistics.',
        bullets: [
          'Curated network of premier boutiques in Paris, Milan, Stockholm, Antwerp, and London',
          'Conscious & Pre-Owned archive departments extending the lifecycle of collectible fashion',
          'Bespoke DDP customs infrastructure engineered specifically for West African luxury delivery',
        ],
      },
    ],
    primaryCta: { label: 'Browse Designers A–Z', path: '/gh/designers' },
    secondaryCta: { label: 'Partner Boutiques', path: '/gh/boutiques' },
  },
  'press-releases': {
    slug: 'press-releases',
    category: 'About Loki',
    title: 'Press Releases',
    subtitle: 'Official announcements from Loki Luxury Retail and our global boutique partnerships.',
    sections: [
      {
        heading: 'Recent Announcements',
        body: 'Stay informed on seasonal flagship launches, boutique integrations, and West African client service expansions.',
        bullets: [
          'Loki Launches Guaranteed 8% DDP Express Logistics Across Accra, Kumasi & Takoradi (2026)',
          'Archive & Pre-Owned Division Debuts Authenticated Chanel & Bottega Provenance Seals',
          'Loki Introduces Real-Time Boutique Stock Alerts & Multi-Currency GHS Checkout',
        ],
      },
    ],
    primaryCta: { label: 'Press Inquiries', path: '/gh/info/contact-us' },
  },
  careers: {
    slug: 'careers',
    category: 'About Loki',
    title: 'Careers at Loki',
    subtitle: 'Shape the future of luxury retail across engineering, editorial curation, and client concierge.',
    sections: [
      {
        heading: 'Open Disciplines',
        body: 'We collaborate across Accra, London, and Lisbon with technologists, fashion historians, and supply-chain architects.',
        bullets: [
          'Private Client Stylists & VIP Concierge — Accra & London',
          'Full-Stack Commerce & Real-Time Inventory Engineers — Remote / Hybrid',
          'Luxury Authentication & Archive Specialists — Paris & Milan',
        ],
      },
    ],
    primaryCta: { label: 'Reach Talent Desk', path: '/gh/info/contact-us' },
  },
  'loki-app': {
    slug: 'loki-app',
    category: 'About Loki',
    title: 'The Loki App Experience',
    subtitle: 'Seamless mobile shopping, instant restock notifications, and live DHL shipment telemetry on any device.',
    sections: [
      {
        heading: 'Designed for Mobile & Desktop Precision',
        body: 'Access the full multi-boutique catalog, synchronized wishlist, Mobile Money checkout, and real-time order tracking directly from your browser or mobile home screen.',
        bullets: [
          'Instant Back-in-Stock email triggers when rare sizes replenish at partner boutiques',
          'Synchronized wishlist and shopping bag across sessions and devices',
          'One-tap currency switching between USD ($) and GHS (₵)',
        ],
      },
    ],
    primaryCta: { label: 'Explore Women’s Edit', path: '/gh/shopping/women' },
  },
  'modern-slavery-statement': {
    slug: 'modern-slavery-statement',
    category: 'About Loki',
    title: 'Modern Slavery Statement',
    subtitle: 'Our commitment to ethical luxury, transparent boutique sourcing, and fair labor across every tier.',
    sections: [
      {
        heading: 'Supply Chain Integrity & Compliance',
        body: 'Loki maintains zero tolerance for forced labor, human trafficking, or unsafe working conditions across our corporate offices, logistics couriers, and partner boutique network.',
        bullets: [
          'Mandatory partner-boutique ethical provenance attestations prior to catalog onboarding',
          'Annual logistics and packaging vendor audits across European and West African corridors',
          'Prominent curation of Conscious-certified wool, leather, and circular Pre-Owned houses',
        ],
      },
    ],
    primaryCta: { label: 'Shop Conscious Edit', path: '/gh/shopping/all' },
  },
  advertising: {
    slug: 'advertising',
    category: 'About Loki',
    title: 'Loki Advertising & Brand Partnerships',
    subtitle: 'Editorial storytelling, seasonal capsule spotlights, and boutique campaigns reaching high-intent collectors.',
    sections: [
      {
        heading: 'Editorial Placements & House Spotlights',
        body: 'Luxury houses and independent boutiques partner with Loki Media Solutions to showcase runway arrivals inside Fashion Feed stories and curated department edits.',
        bullets: [
          'Dedicated seasonal lookbooks across Women’s, Men’s, and Pre-Owned channels',
          'Curated regional spotlights tailored for Accra, London, and Paris collectors',
          'Performance insights adhering strictly to client privacy standards',
        ],
      },
    ],
    primaryCta: { label: 'Read Fashion Feed', path: '/gh/info/fashion-feed' },
  },
  sitemap: {
    slug: 'sitemap',
    category: 'About Loki',
    title: 'Sitemap',
    subtitle: 'Complete directory of Loki departments, designer indices, client tools, and help resources.',
    sections: [],
    isSitemap: true,
    primaryCta: { label: 'Return to Flagship Home', path: '/gh' },
  },
  'affiliate-program': {
    slug: 'affiliate-program',
    category: 'Discounts and membership',
    title: 'Loki Affiliate Program',
    subtitle: 'Partner with Loki to curate verified luxury edits for your editorial publication or style community.',
    sections: [
      {
        heading: 'Creator & Editorial Benefits',
        body: 'Approved fashion editors, stylists, and digital publications earn competitive commissions on verified net sales across our global boutique catalog.',
        bullets: [
          'Competitive commission structure with 30-day attribution window',
          'Direct access to seasonal campaign lookbooks and high-resolution editorial imagery',
          'Dedicated partnership support for Accra, Lagos, London, and international creators',
        ],
      },
    ],
    primaryCta: { label: 'Apply via Concierge', path: '/gh/info/contact-us' },
  },
  'refer-a-friend': {
    slug: 'refer-a-friend',
    category: 'Discounts and membership',
    title: 'Refer a Friend',
    subtitle: 'Share the Loki boutique experience and unlock privilege rewards on your next archive or new-season order.',
    sections: [
      {
        heading: 'How Client Referrals Work',
        body: 'Introduce fellow collectors to Loki’s duty-settled boutique network.',
        bullets: [
          'Your guest receives 10% off their first qualifying order using privilege code LOKI10',
          'Access $150 privilege savings on orders over $1,000 with ACCRAVIP',
          'Track active rewards and order history inside your Loki Client Suite',
        ],
      },
    ],
    primaryCta: { label: 'Visit Account Suite', path: '/gh/account' },
  },
  membership: {
    slug: 'membership',
    category: 'Discounts and membership',
    title: 'Loki Membership',
    subtitle: 'Tiered client privileges offering early private-sale access, complimentary priority dispatch, and private styling.',
    sections: [
      {
        heading: 'Membership Tiers & Benefits',
        body: 'Every client account earns tier status automatically with verified purchases across Women’s, Men’s, Kids’, and Pre-Owned edits.',
        bullets: [
          'Bronze & Silver — Complimentary DDP shipping threshold perks and early sale previews',
          'Gold & Platinum — Priority Atelier Courier upgrades and dedicated Accra/London stylist access',
          'Private Client — Invitation-only archive previews and custom boutique sourcing',
        ],
      },
    ],
    primaryCta: { label: 'Sign In / View Account', path: '/gh/account' },
  },
  'student-beans-and-graduates': {
    slug: 'student-beans-and-graduates',
    category: 'Discounts and membership',
    title: 'Student Beans and Graduates',
    subtitle: 'Academic privilege savings for verified university students and recent graduates.',
    sections: [
      {
        heading: 'Academic Verification Privilege',
        body: 'Students enrolled in accredited universities—including University of Ghana, KNUST, Ashesi, and international institutions—and graduates within 5 years qualify for seasonal privilege savings.',
        bullets: [
          'Use code LOKI10 at your shopping bag for 10% savings on eligible New Season edits',
          'Stackable with complimentary DHL Express DDP shipping on orders over $500',
          'Full eligibility details reviewed during promotional checkout validation',
        ],
      },
    ],
    primaryCta: { label: 'Shop New Season', path: '/gh/shopping/women' },
  },
  'fashion-feed': {
    slug: 'fashion-feed',
    category: 'Content and services',
    title: 'Fashion Feed: The Latest Style Stories',
    subtitle: 'Runway dispatches, atelier craftsmanship profiles, and seasonal wardrobe edits from Loki’s editorial desk.',
    sections: [],
    stories: [
      {
        kicker: 'Tailoring Edit',
        title: 'Sculptural Minimalism: Why Nordic & Milanese Tailoring Anchors the Modern Wardrobe',
        summary:
          'From Toteme’s hourglass virgin-wool blazers to The Row’s bias-cut silk, explore quiet architectural silhouettes built for effortless year-round rotation.',
        ctaLabel: 'Shop Women’s Clothing',
        ctaPath: '/gh/shopping/women?category=Clothing',
      },
      {
        kicker: 'Archive Provenance',
        title: 'Collecting Authenticated Chanel & Bottega Veneta: A Buyer’s Field Guide',
        summary:
          'How boutique provenance seals, hardware hallmarks, and lambskin care preserve archival investment value across decades.',
        ctaLabel: 'Explore Pre-Owned Archive',
        ctaPath: '/gh/shopping/pre-owned',
      },
      {
        kicker: 'Atelier Craft',
        title: 'Inside Our European Partner Boutiques: Stockholm, Paris & Milan to Accra in 72 Hours',
        summary:
          'Meet the independent multi-brand buyers curating rare runway sizes with guaranteed DDP delivery across Ghana.',
        ctaLabel: 'Meet Partner Boutiques',
        ctaPath: '/gh/boutiques',
      },
    ],
    primaryCta: { label: 'Explore Full Collection', path: '/gh/shopping/all' },
  },
};
