import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Output - Track Your Deep Work",
  description:
    "A minimal productivity app for tracking focused work sessions, managing tasks, and reflecting on your daily output.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `try{var s=localStorage.getItem('output-theme');if(s){var d=JSON.parse(s);var t=d&&d.state&&d.state.theme;if(t==='dark')document.documentElement.classList.add('dark');if(t==='light-grid')document.documentElement.classList.add('grid-bg')}}catch(e){}`,
          }}
        />
        {children}
        <Toaster position="bottom-right" />
        <div id="portal-root" />
      </body>
    </html>
  );
}
