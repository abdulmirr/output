import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LandingNav } from "@/components/landing/landing-nav";
import { HeroSection } from "@/components/landing/hero-section";
import { ShowcaseSection } from "@/components/landing/showcase-section";
import { PlatformBanner } from "@/components/landing/platform-banner";
import { Footer } from "@/components/landing/footer";
import { BackgroundGrid } from "@/components/ui/background-snippets";

async function AuthRedirect() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/output");
  return null;
}

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <Suspense fallback={null}>
        <AuthRedirect />
      </Suspense>
      <BackgroundGrid />
      <LandingNav />
      <Suspense fallback={null}>
        <HeroSection />
      </Suspense>
      <PlatformBanner />
      <ShowcaseSection />
      <Footer />
    </div>
  );
}
