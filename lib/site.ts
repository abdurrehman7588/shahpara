/** The shop's WhatsApp number, as linked from every page of the live store. */
export const WHATSAPP_NUMBER = "923314544078";

/** Everything here is taken from the live shahpara.pk about, contact and product pages. */
export const site = {
  name: "Shahpara",
  urduName: "شہ پارہ",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://shahpara.pk",
  tagline: "Create moments of happiness",
  urduTagline: "رکھنی ہے تحفہ کی رسم برقرار",
  description:
    "Handmade and personalised gifts from Lahore — calligraphy cards, Nikkah papers, name boards, keepsakes and Eidi, made one at a time for the people close to your heart.",
  email: "momentsbyshahpara@gmail.com",
  whatsapp: WHATSAPP_NUMBER,
  whatsappDisplay: `+${WHATSAPP_NUMBER.slice(0, 2)} ${WHATSAPP_NUMBER.slice(2, 5)} ${WHATSAPP_NUMBER.slice(5)}`,
  instagram: { handle: "@shahpara01", url: "https://instagram.com/shahpara01" },
  facebook: { handle: "shah.para01", url: "https://www.facebook.com/shah.para01" },
  city: "Lahore, Pakistan",
  logo: "https://shahpara.pk/wp-content/uploads/2022/11/shahpara_logo-removebg-preview-1-300x300.png",
  /** The flat-lay photographs used as the live homepage hero. */
  heroImages: [
    "https://shahpara.pk/wp-content/uploads/2024/04/0aad8dce-e726-498c-bd3b-c1ee9fc7f813.jpeg",
    "https://shahpara.pk/wp-content/uploads/2023/03/WhatsApp-Image-2023-03-03-at-9.18.05-AM.jpeg",
  ],
} as const;

/**
 * Search engines are blocked unless this is explicitly turned on, so a preview or
 * Vercel deployment never competes with the live shahpara.pk in Google.
 * Set NEXT_PUBLIC_ALLOW_INDEXING=true only when this site replaces the live one.
 */
export const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

export const deliveryNotes = [
  "Every order is confirmed with you by text or email before we begin.",
  "Orders arrive in 4–5 working days.",
  "Extra delivery charges apply outside Lahore, depending on size and weight; the receipt is shared at delivery.",
  "Payment is by direct bank transfer — account details are shared when your order is confirmed.",
];

export const terms = [
  "High-quality images are required for image-based orders.",
  "Text should be precise and spell-checked. We are not responsible for grammar or spelling mistakes in copied and pasted text.",
  "Share detailed notes about your order — add-ons, captions or any special instructions.",
  "We send a confirmation email or text for every order.",
  "You will receive your order within 4–5 working days.",
  "This is handmade craftwork, so pieces may vary slightly from the pictures. As every piece is made single-handedly, details may change depending on the availability of materials.",
  "Once your order has been dispatched, the contract between Shahpara and you is complete.",
  "We cannot fulfil an order if the product is out of stock, if payment cannot be cleared, or if a pricing or description error is found.",
];

export function whatsappLink(text?: string) {
  const base = `https://wa.me/${site.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function formatPrice(amount: number) {
  return `Rs. ${Math.round(amount).toLocaleString("en-PK")}`;
}
