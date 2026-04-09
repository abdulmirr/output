import Link from 'next/link';

export default function NotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-background text-foreground font-sans">
        <div className="text-center space-y-4">
          <p className="text-5xl font-bold">404</p>
          <h1 className="text-xl font-semibold">Page not found</h1>
          <p className="text-muted-foreground text-sm">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/"
            className="inline-block mt-2 text-sm underline underline-offset-4 hover:opacity-70 transition-opacity"
          >
            Go home
          </Link>
        </div>
      </body>
    </html>
  );
}
