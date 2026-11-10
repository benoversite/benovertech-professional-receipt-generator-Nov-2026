export const BUSINESS = {
  name: "BENOVERTECH GADGETS",
  short: "BNV",
  tagline: "Premium Gadgets · Lagos",
  address: "Awka, Anambra & Lagos Nigeria",
  phone: "08107271610",
  whatsapp: "08107271610",
  whatsappIntl: "2348107271610",
  email: "benovertech@gmail.com",
  defaultWarranty: "7-day service warranty",
};

export const formatNGN = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

const DEFAULT_OPEN_SITE_USER_ID = "11111111-1111-1111-1111-111111111111";
export const OPEN_SITE_USER_ID = import.meta.env.VITE_SUPABASE_OPEN_USER_ID ?? DEFAULT_OPEN_SITE_USER_ID;

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const whatsappLinkForCustomer = (phone: string, message: string) => {
  // Normalise NG numbers: 0XXXXXXXXXX -> 234XXXXXXXXXX
  const cleaned = phone.replace(/\D/g, "");
  let intl = cleaned;
  if (cleaned.startsWith("0")) intl = "234" + cleaned.slice(1);
  else if (cleaned.startsWith("234")) intl = cleaned;
  else if (cleaned.length === 10) intl = "234" + cleaned;
  return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
};

export const whatsappLinkForBusiness = (message = "Hello BENOVERTECH GADGETS") =>
  `https://wa.me/${BUSINESS.whatsappIntl}?text=${encodeURIComponent(message)}`;
