"use client";

import { useEffect, useState } from "react";

import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";

type FloatingWhatsAppButtonProps = {
  whatsappUrl: string;
  label?: string;
};

export function FloatingWhatsAppButton({
  whatsappUrl,
  label = "Chat on WhatsApp",
}: FloatingWhatsAppButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const revealOffset = 360;

    const syncVisibility = () => {
      setIsVisible(window.scrollY >= revealOffset);
    };

    syncVisibility();
    window.addEventListener("scroll", syncVisibility, { passive: true });

    return () => window.removeEventListener("scroll", syncVisibility);
  }, []);

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className={`fixed bottom-6 right-6 z-50 inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/70 bg-[#25D366] px-3.5 text-[0.78rem] font-semibold text-white shadow-[0_12px_24px_rgba(37,211,102,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1fb85a] ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <WhatsAppIcon className="size-4.5 shrink-0" />
      <span className="hidden sm:inline">{label}</span>
    </a>
  );
}
