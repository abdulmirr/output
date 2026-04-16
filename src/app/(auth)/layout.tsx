import { BackgroundGrid } from "@/components/ui/background-snippets";
import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      <div className="fixed inset-0 z-0">
        <BackgroundGrid />
      </div>
      
      <div className="absolute top-8 left-8 z-20">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <Image src="/output-logo.svg" alt="Output" width={26} height={28} className="h-7 w-auto" />
          <span className="text-2xl font-semibold tracking-tight">Output</span>
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-[400px]">
        {children}
      </div>
    </div>
  );
}
