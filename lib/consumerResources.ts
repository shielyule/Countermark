import type { DisputeCategory } from "@/lib/types";

export type ConsumerResourceLink = {
  label: string;
  url: string;
  note?: string;
};

const RESOURCES: Record<DisputeCategory, ConsumerResourceLink[]> = {
  energy: [
    {
      label: "Energy Ombudsman",
      url: "https://www.energyombudsman.org/",
      note: "Free dispute resolution if your supplier does not resolve your complaint.",
    },
    {
      label: "Citizens Advice — gas & electricity",
      url: "https://www.citizensadvice.org.uk/consumer/energy/energy-supply/",
    },
  ],
  telecoms: [
    {
      label: "Ombudsman Services — communications",
      url: "https://www.ombudsman-services.org/sectors/communications",
      note: "Mobile, broadband, and home phone complaints (UK).",
    },
    {
      label: "Ofcom — make a complaint",
      url: "https://www.ofcom.org.uk/phones-telecoms-and-internet/how-to/report-a-complaint-to-ofcom",
    },
  ],
  subscription: [
    {
      label: "Citizens Advice — cancel a subscription",
      url: "https://www.citizensadvice.org.uk/consumer/somethings-gone-wrong-with-a-product/cancel-subscription/",
    },
    {
      label: "GOV.UK — unfair contract terms",
      url: "https://www.gov.uk/unfair-terms-in-sales-contracts",
    },
  ],
  council: [
    {
      label: "Local Government & Social Care Ombudsman",
      url: "https://www.lgo.org.uk/",
      note: "Council services, housing benefit, bins, planning — not court fines.",
    },
    {
      label: "GOV.UK — complain about your council",
      url: "https://www.gov.uk/complain-about-council",
    },
  ],
  banking: [
    {
      label: "Financial Ombudsman Service",
      url: "https://www.financial-ombudsman.org.uk/consumers/how-to-complain",
    },
    {
      label: "Citizens Advice — banking & payments",
      url: "https://www.citizensadvice.org.uk/debt-and-money/banking/",
    },
  ],
  water: [
    {
      label: "Consumer Council for Water",
      url: "https://www.ccw.org.uk/complain/",
    },
  ],
  retail: [
    {
      label: "Citizens Advice — faulty products & refunds",
      url: "https://www.citizensadvice.org.uk/consumer/somethings-gone-wrong-with-a-product/",
    },
    {
      label: "Which? — consumer rights",
      url: "https://www.which.co.uk/consumer-rights",
    },
  ],
  other: [
    {
      label: "Citizens Advice — get help",
      url: "https://www.citizensadvice.org.uk/about-us/contact-us/",
    },
    {
      label: "GOV.UK — consumer rights",
      url: "https://www.gov.uk/consumer-protection-rights",
    },
  ],
};

const CATEGORY_LABELS: Record<DisputeCategory, string> = {
  energy: "Energy & utilities",
  telecoms: "Telecoms & broadband",
  subscription: "Subscriptions & digital services",
  council: "Council & local services",
  banking: "Banking & payments",
  water: "Water",
  retail: "Shopping & goods",
  other: "General consumer",
};

export function normalizeDisputeCategory(raw: unknown): DisputeCategory {
  const s = String(raw ?? "other").toLowerCase().replace(/\s+/g, "_");
  const allowed: DisputeCategory[] = [
    "energy",
    "telecoms",
    "subscription",
    "council",
    "banking",
    "water",
    "retail",
    "other",
  ];
  if (allowed.includes(s as DisputeCategory)) {
    return s as DisputeCategory;
  }
  if (s.includes("broadband") || s.includes("mobile") || s.includes("phone")) {
    return "telecoms";
  }
  if (s.includes("saas") || s.includes("software")) {
    return "subscription";
  }
  return "other";
}

export function getConsumerResources(category: DisputeCategory): {
  categoryLabel: string;
  links: ConsumerResourceLink[];
} {
  return {
    categoryLabel: CATEGORY_LABELS[category],
    links: RESOURCES[category],
  };
}
