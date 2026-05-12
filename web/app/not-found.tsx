import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl font-bold text-muted-foreground/50 mb-4 font-mono">404</div>
        <h1 className="text-lg font-semibold text-foreground mb-2">Page not found</h1>
        <p className="text-sm text-muted-foreground mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 text-sm font-medium text-white bg-[#7F56D9] hover:bg-[#6941C6] rounded-lg transition-colors"
        >
          Back Home
        </Link>
      </div>
    </div>
  );
}
