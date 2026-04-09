import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LandingNav } from "@/components/landing/landing-nav";
import { HeroSection } from "@/components/landing/hero-section";
import { ShowcaseSection } from "@/components/landing/showcase-section";
import { Footer } from "@/components/landing/footer";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/output");
  }

  return (
    <div className="min-h-screen">
      <LandingNav />
      <HeroSection />
      <ShowcaseSection />
      <Footer />
    </div>
  );
}
