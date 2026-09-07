import { BUSINESS } from "@/lib/constants";
import { WhatsApp } from "./icons";

export function WhatsAppButton() {
  const text = encodeURIComponent(
    "Hi Giftedhands! I'd like to ask about booking a braiding appointment.",
  );
  return (
    <a
      href={`${BUSINESS.whatsappUrl}?text=${text}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-full bg-whatsapp py-3 pl-3 pr-4 text-espresso shadow-[0_16px_40px_-12px_rgba(37,211,102,0.7)] transition hover:-translate-y-0.5 hover:brightness-105"
    >
      <WhatsApp className="h-7 w-7" />
      <span className="hidden text-sm font-bold sm:inline">Chat on WhatsApp</span>
    </a>
  );
}
