import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { FAQSection } from "@/components/landing/faq-section-fixed";
import { LandingHero } from "@/components/landing/landing-hero";
import dynamic from "next/dynamic";

// Critical components stay static for SEO and LCP
// Non-critical components below the fold are lazy loaded
const SectionStats = dynamic(() => import("@/components/landing/section-stats").then(mod => mod.SectionStats));
const AboutSection = dynamic(() => import("@/components/landing/section-about").then(mod => mod.AboutSection));
const SocialProof = dynamic(() => import("@/components/landing/section-social-proof").then(mod => mod.SocialProof));
const Comparison = dynamic(() => import("@/components/landing/section-comparison").then(mod => mod.Comparison));
const SectionSolutions = dynamic(() => import("@/components/landing/section-solutions").then(mod => mod.SectionSolutions));
const FinancialLogic = dynamic(() => import("@/components/landing/section-financial").then(mod => mod.FinancialLogic));
const Workflow = dynamic(() => import("@/components/landing/section-workflow").then(mod => mod.Workflow));
const Testimonials = dynamic(() => import("@/components/landing/section-testimonials").then(mod => mod.Testimonials));
const SectionGuarantee = dynamic(() => import("@/components/landing/section-guarantee").then(mod => mod.SectionGuarantee));
const ConsultBuildSupport = dynamic(() => import("@/components/landing/section-cbo").then(mod => mod.ConsultBuildSupport));
const DigitalSystemAudit = dynamic(() => import("@/components/landing/section-audit").then(mod => mod.DigitalSystemAudit));
const PartnersSection = dynamic(() => import("@/components/landing/section-partners").then(mod => mod.PartnersSection));

const ScrollAnimationWrapper = dynamic(() => import("@/components/ui/scroll-animation-wrapper").then(mod => mod.ScrollAnimationWrapper));
import { JsonLd } from "@/components/seo/json-ld";
import { Organization } from "schema-dts";
import { Metadata } from "next";
import { SystemSetting } from "@prisma/client";
import { getLocale } from "next-intl/server";
import { getSystemSettings } from "@/lib/server/settings";
import { getPageSeo } from "@/lib/server/seo";

import { ResolvingMetadata } from "next";

export async function generateMetadata(
  _props: { params: Promise<Record<string, string>> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const locale = await getLocale();
  const pageSeo = await getPageSeo("/");

  if (!pageSeo || (!pageSeo.title && !pageSeo.description)) {
    return {};
  }

  const isId = locale === 'id';
  const title = (isId ? pageSeo.title_id : null) || pageSeo.title || undefined;
  const description = (isId ? pageSeo.description_id : null) || pageSeo.description || undefined;

  const previousImages = (await parent).openGraph?.images || [];
  const ogImage = (isId ? pageSeo.ogImage_id : null) || pageSeo.ogImage;
  const ogImages = ogImage ? [ogImage] : previousImages;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImages,
      type: "website",
      locale: isId ? 'id_ID' : 'en_US',
      alternateLocale: isId ? ['en_US'] : ['id_ID'],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages,
    },
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        'en': `${baseUrl}/en`,
        'id': `${baseUrl}/id`,
        'x-default': `${baseUrl}/en`,
      }
    }
  };
}

export default async function Home() {
  // ⚡ Bolt: Use cached getSystemSettings instead of direct DB query
  const settings = await getSystemSettings(["AGENCY_NAME", "AGENCY_LOGO", "CONTACT_PHONE"]);
  const agencyName = settings.find((s: SystemSetting) => s.key === "AGENCY_NAME")?.value || "Crediblemark";

  return (
    <main className="relative min-h-screen bg-black selection:bg-blue-500/30">
      <JsonLd<Organization>
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: agencyName,
          url: process.env.NEXT_PUBLIC_APP_URL || "",
          logo: settings.find((s: SystemSetting) => s.key === "AGENCY_LOGO")?.value || "",
          contactPoint: {
            "@type": "ContactPoint",
            telephone: settings.find((s: SystemSetting) => s.key === "CONTACT_PHONE")?.value || "",
            contactType: "customer service"
          }
        }}
      />
      <SiteHeader />
      <LandingHero />

      <ScrollAnimationWrapper>
        <SectionStats />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper>
        <AboutSection />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper delay={0.1}>
        <SocialProof />
      </ScrollAnimationWrapper>

      <FinancialLogic />
      <ConsultBuildSupport />
      <SectionSolutions />
      <DigitalSystemAudit />
      
      <ScrollAnimationWrapper>
        <Testimonials />
      </ScrollAnimationWrapper>

      <Comparison />

      <ScrollAnimationWrapper>
        <Workflow />
      </ScrollAnimationWrapper>

      <PartnersSection />

      <ScrollAnimationWrapper>
        <SectionGuarantee />
      </ScrollAnimationWrapper>

      <FAQSection />

      <SiteFooter />
    </main>
  );
}

