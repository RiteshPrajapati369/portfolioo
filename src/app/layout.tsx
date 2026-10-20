import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "sonner";
import { JsonLd } from "@/components/seo/json-ld";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const SITE_URL = "https://riteshprajapati.com.np";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F9F8F6" },
    { media: "(prefers-color-scheme: dark)", color: "#202940" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Ritesh Prajapati | Cybersecurity Specialist & Penetration Tester",
    template: "%s | Ritesh Prajapati",
  },
  description:
    "Official cybersecurity portfolio of Ritesh Prajapati. Specialized in Offensive Penetration Testing, Bug Hunting, Intrusion Detection Systems (Snort/Suricata), and Secure Systems Architecture.",
  applicationName: "Ritesh Prajapati Portfolio",
  authors: [{ name: "Ritesh Prajapati", url: SITE_URL }],
  creator: "Ritesh Prajapati",
  publisher: "Ritesh Prajapati",
  keywords: [
    "Ritesh Prajapati",
    "Ritesh Prajapati Cybersecurity",
    "Ritesh Prajapati Portfolio",
    "Ritesh Prajapati Penetration Tester",
    "Ritesh Prajapati Nepal",
    "Ritesh",
    "Cybersecurity Specialist Nepal",
    "Penetration Testing Nepal",
    "Ethical Hacker Nepal",
    "Bug Hunting",
    "IDS/IPS Architectures",
    "Snort Suricata",
    "Vulnerability Assessment",
    "panditritesh005",
    "panditritesh005@gmail.com",
    "Information Security Consultant Nepal",
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "profile",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Ritesh Prajapati Portfolio",
    title: "Ritesh Prajapati | Cybersecurity Specialist & Penetration Tester",
    description:
      "Official portfolio of Ritesh Prajapati. Specialized in Offensive Penetration Testing, Bug Hunting, IDS/IPS architectures, and Secure Systems Engineering.",
    images: [
      {
        url: `${SITE_URL}/images/profile.png`,
        width: 800,
        height: 800,
        alt: "Ritesh Prajapati - Cybersecurity Specialist & Penetration Tester",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ritesh Prajapati | Cybersecurity Specialist & Penetration Tester",
    description:
      "Official portfolio of Ritesh Prajapati. Specialized in Offensive Penetration Testing, Bug Hunting, and Secure Systems Architecture.",
    creator: "@RiteshPraj8063",
    site: "@RiteshPraj8063",
    images: [`${SITE_URL}/images/profile.png`],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark scroll-smooth ${poppins.variable}`}>
      <head>
        <JsonLd />
      </head>
      <body
        className={`${poppins.className} min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary font-sans`}
      >
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "hsl(var(--card))",
              color: "hsl(var(--card-foreground))",
              border: "1px solid hsl(var(--border))",
            },
          }}
        />
      </body>
    </html>
  );
}
