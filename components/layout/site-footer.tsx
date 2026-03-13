import Link from "next/link";

import { navigationLinks, siteConfig } from "@/lib/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-surface text-text-secondary">
      <div className="container-shell grid gap-10 py-14 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div className="space-y-4">
          <p className="text-2xl font-semibold tracking-tight text-text-primary">
            {siteConfig.name}
          </p>
          <p className="max-w-lg text-sm leading-7 text-text-secondary">
            Used, imported, and traded-in vehicles with clearer listings, faster
            response times, and a practical buying process.
          </p>
          <div className="space-y-1 text-sm text-text-secondary">
            <p>{siteConfig.address}</p>
            {siteConfig.contactNumbers.map((contact) => (
              <p key={contact.href}>
                <a href={contact.href} className="transition-colors hover:text-text-primary">
                  {contact.display}
                </a>
              </p>
            ))}
            <p>
              <a
                href={`mailto:${siteConfig.salesEmail}`}
                className="transition-colors hover:text-text-primary"
              >
                {siteConfig.salesEmail}
              </a>
            </p>
          </div>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-accent">
            Explore
          </p>
          <div className="grid gap-3 text-sm text-text-secondary">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-accent">
            Hours
          </p>
          <div className="space-y-2 text-sm text-text-secondary">
            <p>{siteConfig.hoursLabel}</p>
            <p>Sunday by appointment</p>
            <p>WhatsApp and phone support available throughout the day.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
