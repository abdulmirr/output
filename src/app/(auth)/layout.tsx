import { BackgroundGrid } from "@/components/ui/background-snippets";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      <div className="fixed inset-0 z-0">
        <BackgroundGrid />
      </div>
      
      <div className="absolute top-8 left-8 z-20">
        <Link href="/" className="text-xl font-bold tracking-tighter hover:opacity-80 transition-opacity flex items-center gap-2">
          <div className="w-5 h-5 bg-foreground rounded-sm flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-background rounded-full" />
          </div>
          Output
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-[400px]">
        {children}
      </div>
    </div>
  );
}
