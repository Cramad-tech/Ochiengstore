import type { FaqItem, HighlightItem, SiteSettingsShape } from "@/lib/store-types"

export const SITE_SETTINGS_FALLBACK: SiteSettingsShape = {
  storeName: "Ochieng Store",
  tagline: "Owner-led home appliances and general supplies across Tanzania.",
  supportPhone: "+255 656 844 497",
  supportEmail: "support@ochienghome.co.tz",
  whatsappPhone: "255656844497",
  address: "Kariakoo, Dar es Salaam, Tanzania",
  defaultDeliveryLead: "2-5 business days",
  regions: [
    "Dar es Salaam",
    "Arusha",
    "Dodoma",
    "Mwanza",
    "Mbeya",
    "Morogoro",
    "Tanga",
    "Zanzibar",
    "Pwani",
    "Kilimanjaro",
  ],
}

export const WHY_SHOP_WITH_US: HighlightItem[] = [
  {
    title: "Warranty-backed products",
    titleSw: "Bidhaa zenye dhamana",
    description: "Every major appliance ships with clear warranty coverage and after-sales support guidance.",
    descriptionSw: "Kila kifaa kikubwa kinakuja na dhamana iliyo wazi pamoja na maelekezo ya huduma baada ya mauzo.",
  },
  {
    title: "Delivery across Tanzania",
    titleSw: "Uwasilishaji Tanzania nzima",
    description: "We support urban delivery, upcountry dispatch coordination, and clear lead-time messaging.",
    descriptionSw: "Tunawezesha uwasilishaji mijini, uratibu wa kusafirisha mikoani, na maelezo wazi ya muda wa kufikisha.",
  },
  {
    title: "WhatsApp-first support",
    titleSw: "Huduma ya WhatsApp kwanza",
    description: "Customers can confirm specifications, stock, delivery, and installation needs before they order.",
    descriptionSw: "Wateja wanaweza kuthibitisha vipimo, stoo, uwasilishaji na mahitaji ya usakinishaji kabla ya kuagiza.",
  },
  {
    title: "Genuine leading brands",
    titleSw: "Bidhaa halisi za chapa maarufu",
    description: "The catalog focuses on reliable brands with clear specs, model numbers, and appliance fit guidance.",
    descriptionSw: "Katalogi inalenga chapa zinazotegemewa zenye vipimo, namba za modeli na ushauri wa matumizi nyumbani.",
  },
]

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Do you deliver outside Dar es Salaam?",
    questionSw: "Mnafikisha bidhaa nje ya Dar es Salaam?",
    answer: "Yes. We coordinate delivery to major Tanzania regions and confirm timing before dispatch for bulky appliances.",
    answerSw: "Ndiyo. Tunaratibu uwasilishaji kwa mikoa mikuu ya Tanzania na kuthibitisha muda kabla ya kutuma vifaa vikubwa.",
  },
  {
    question: "Can I order through WhatsApp?",
    questionSw: "Naweza kuagiza kupitia WhatsApp?",
    answer: "Yes. WhatsApp is the fastest ordering path for stock confirmation, delivery planning, and payment follow-up before dispatch.",
    answerSw: "Ndiyo. WhatsApp ndiyo njia ya haraka zaidi ya kuagiza, kuthibitisha stok, kupanga delivery na kufuatilia malipo kabla ya kutuma.",
  },
  {
    question: "Do appliances come with installation guidance?",
    questionSw: "Vifaa vinakuja na maelekezo ya usakinishaji?",
    answer: "Products that need setup include installation notes so customers know whether delivery-only or technician support is required.",
    answerSw: "Bidhaa zinazohitaji kufungwa zina maelezo ya usakinishaji ili mteja ajue kama anahitaji uletaji tu au fundi pia.",
  },
  {
    question: "Which payment methods are supported?",
    questionSw: "Ni njia gani za malipo zinaungwa mkono?",
    answer: "The current process prioritizes WhatsApp-confirmed orders, with support for bank transfer, manual mobile money confirmation, and cash on delivery where eligible.",
    answerSw: "Kwa sasa tunaweka kipaumbele kwa oda zinazothibitishwa kwa WhatsApp, pamoja na uhamisho wa benki, uthibitisho wa manual wa mobile money, na malipo wakati wa kupokea inapowezekana.",
  },
]

export const POLICY_CONTENT = {
  warranty: {
    title: "Warranty Policy",
    intro:
      "Major appliances include warranty coverage based on brand and product type. Warranty duration is shown on every product page and on the order confirmation summary.",
    sections: [
      "Warranty claims require a valid receipt or order confirmation number.",
      "Physical damage caused after delivery, improper voltage use, and unauthorized repairs are excluded.",
      "Customers should report warranty issues through support phone or WhatsApp within 48 hours of noticing the fault.",
    ],
  },
  delivery: {
    title: "Delivery Policy",
    intro:
      "Delivery timelines depend on item size, stock location, and destination region. Bulky appliances receive a delivery confirmation call before dispatch.",
    sections: [
      "Dar es Salaam orders are prioritized for 1-3 business day delivery where stock is available.",
      "Upcountry dispatch timelines are confirmed before payment approval or release.",
      "Customers should ensure a reachable phone number and accurate delivery region during checkout.",
    ],
  },
  returns: {
    title: "Return & Refund Policy",
    intro:
      "Returns are evaluated based on product condition, installation status, and the reason for return. Open-box and installed appliances may be handled differently.",
    sections: [
      "Report incorrect, damaged, or missing items within 48 hours of delivery.",
      "Approved refunds are processed through the original payment path where possible or by agreed manual transfer.",
      "Products returned after use or with missing accessories may attract a restocking or rejection decision.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    intro:
      "We collect customer information needed to fulfil orders, arrange delivery, provide support, and improve store operations.",
    sections: [
      "Customer contact details are used for order updates, delivery coordination, and support follow-up.",
      "Payment references are stored for reconciliation and fraud prevention.",
      "We do not expose private customer information publicly or sell it to third parties.",
    ],
  },
  cookies: {
    title: "Cookies Policy",
    intro:
      "Our website uses cookies and local storage to keep your session secure, remember preferences, and make shopping smoother on future visits.",
    sections: [
      "Essential cookies keep login sessions, security checks, and your cookie-consent choices working while you browse the site.",
      "Functional storage remembers cart items, wishlist choices, and language settings only when you allow those preferences.",
      "Security cookies help us protect admin and customer accounts from abuse, suspicious sign-in attempts, and session hijacking.",
      "We may use basic analytics cookies to understand page usage and improve performance, but we do not sell cookie-derived personal data.",
    ],
  },
  session: {
    title: "Session & Account Security Policy",
    intro:
      "Customer and admin sessions are protected so the right person reaches the right dashboard, and account recovery follows verification checks.",
    sections: [
      "Signed-in sessions are tied to secure authentication tokens and should only be used on trusted devices and networks.",
      "Password reset and sign-up verification rely on email-based verification codes or verified manual approval by store administration.",
      "Admins should sign out after using shared devices and review account activity, password changes, and role assignments regularly.",
    ],
  },
  terms: {
    title: "Terms & Conditions",
    intro:
      "By placing an order, customers agree to the pricing, delivery, warranty, and payment confirmation terms shown at checkout and on product pages.",
    sections: [
      "Stock availability and final dispatch timing are subject to confirmation for high-demand items.",
      "Prices are shown in Tanzanian Shillings and may change before order confirmation if inventory status changes.",
      "The store reserves the right to refuse fraudulent or abusive orders and accounts.",
    ],
  },
}
