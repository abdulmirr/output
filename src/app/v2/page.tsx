import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LandingNav } from "@/components/landing/landing-nav";
import { Footer } from "@/components/landing/footer";
import { BackgroundGrid } from "@/components/ui/background-snippets";
import { V2HeroSection } from "@/components/landing/v2-hero";

export default async function V2Landing() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/output");
  }

  return (
    <div className="relative min-h-screen selection:bg-primary/30">
      <BackgroundGrid />
      <LandingNav />
      
      <main className="flex-1 flex flex-col items-center">
        <V2HeroSection />
      </main>
      
      <Footer />
    </div>
  );
}
