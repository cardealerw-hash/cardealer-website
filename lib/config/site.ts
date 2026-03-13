import type { HomeStats } from "@/types/dealership";

const dealershipContactNumbers = [
  {
    raw: "0792141523",
    display: "0792 141 523",
    href: "tel:0792141523",
  },
  {
    raw: "0704337697",
    display: "0704 337 697",
    href: "tel:0704337697",
  },
] as const;

const primaryContactNumber = dealershipContactNumbers[0];

export const siteConfig = {
  name: "Ocean Motors",
  shortName: "Ocean Motors",
  description:
    "Browse used, imported, and traded-in cars in Mombasa with stronger trust signals, clear pricing, and fast enquiry options.",
  tagline: "Trusted cars. Faster answers. Better buying confidence in Mombasa.",
  contactNumbers: dealershipContactNumbers,
  phoneDisplay: primaryContactNumber.display,
  phoneHref: primaryContactNumber.href,
  whatsappNumber: `254${primaryContactNumber.raw.slice(1)}`,
  whatsappLabel: "Chat on WhatsApp",
  email: "hello@oceanmotors.demo",
  salesEmail: "sales@oceanmotors.demo",
  address: "Kizingo, Mombasa",
  region: "Mombasa, Kenya",
  hoursLabel: "Mon - Sat, 8:00 AM - 6:00 PM",
  socialLinks: {
    facebook: "#",
    instagram: "#",
    x: "#",
  },
  primaryCtaLabel: "Get Today's Price",
  inventorySearchDefaults: {
    sort: "latest",
    pageSize: 9,
  },
} as const;

export const homeStats: HomeStats = {
  inStockCount: 15,
  deliveredCount: 180,
  financePartners: 4,
  responseTime: "10 min",
};

export const navigationLinks = [
  { href: "/", label: "Home" },
  { href: "/inventory", label: "Inventory" },
  { href: "/inventory/new", label: "New Cars" },
  { href: "/inventory/used", label: "Used Cars" },
  { href: "/inventory/imported", label: "Imported Units" },
  { href: "/financing", label: "Financing" },
  { href: "/trade-in", label: "Trade-In" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];
