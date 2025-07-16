import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "NVDA TradeBot",
  description:
    "NVDA hisse senedi için gerçek zamanlı ticaret sinyalleri ve haber analizi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className="font-sans">
        <div className="min-h-screen flex flex-col">
          <header className="bg-primary text-primary-foreground py-4 shadow-md fixed top-0 left-0 right-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
              <Link href="/" className="text-xl font-bold">
                NVDA TradeBot
              </Link>
              <nav className="flex space-x-4">
                <Link href="/" className="hover:underline">
                  Dashboard
                </Link>
                <Link href="/signals" className="hover:underline">
                  Sinyaller
                </Link>
                <Link href="/news" className="hover:underline">
                  Haberler
                </Link>
                <Link href="/data-explorer" className="hover:underline">
                  Veri Gezgini
                </Link>
              </nav>
            </div>
          </header>
          <main className="pt-20 container mx-auto py-8 flex-grow">
            {children}
          </main>
          <footer className="bg-muted py-4 text-center text-sm text-muted-foreground">
            <div className="container mx-auto">
              &copy; {new Date().getFullYear()} NVDA TradeBot
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
