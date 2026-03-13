import type { Metadata } from "next";

import { JsonLd } from "@/components/layout/json-ld";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { siteConfig } from "@/lib/config/site";
import { getLocations } from "@/lib/data/repository";
import { buildAutoDealerJsonLd, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Cars for Sale in Mombasa",
  description: siteConfig.description,
});

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locations = await getLocations();
  const autoDealerJsonLd = buildAutoDealerJsonLd(locations);

  return (
    <>
      <JsonLd data={autoDealerJsonLd} />
      <div className="public-site-shell flex min-h-screen flex-col text-text-primary">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </>
  );
}
