import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LandingNav } from "@/components/landing/landing-nav";
import { HeroSection } from "@/components/landing/hero-section";
import { ShowcaseSection } from "@/components/landing/showcase-section";
import { PlatformBanner } from "@/components/landing/platform-banner";
import { Footer } from "@/components/landing/footer";
import { BackgroundGrid } from "@/components/ui/background-snippets";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/output");
  }

  return (
    <div className="relative min-h-screen">
      <BackgroundGrid />
      <LandingNav />
      <HeroSection />
      <ShowcaseSection />
      <PlatformBanner />
      <Footer />
    </div>
  );
}
