import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { WhatsappFloat } from "@/components/whatsapp-float";
import { STORE_NAME, STORE_TAGLINE } from "@/lib/constants";
import { clerkLocalization } from "@/lib/clerk-localization";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: `${STORE_NAME} | ${STORE_TAGLINE}`,
    template: `%s | ${STORE_NAME}`,
  },
  description:
    "Tienda argentina especializada en consolas, controles y juegos.",
  openGraph: {
    title: STORE_NAME,
    description: STORE_TAGLINE,
    siteName: STORE_NAME,
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: STORE_NAME,
    description: STORE_TAGLINE,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      localization={clerkLocalization}
      signInUrl="/login"
      signUpUrl="/registro"
    >
      <html
        lang="es-AR"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="flex min-h-full flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsappFloat />
        </body>
      </html>
    </ClerkProvider>
  );
}
