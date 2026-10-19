import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ritesh Prajapati | Cybersecurity Specialist",
  description:
    "Cybersecurity portfolio of Ritesh Prajapati. Specialized in Penetration Testing, Bug Hunting, IDS/IPS, and Secure Systems Architecture.",
  keywords: [
    "Cybersecurity",
    "Penetration Testing",
    "Bug Hunting",
    "IDS/IPS",
    "Information Security",
    "Ritesh Prajapati",
  ],
  authors: [{ name: "Ritesh Prajapati" }],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark scroll-smooth ${poppins.variable}`}>
      <body className={`${poppins.className} min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary font-sans`}>
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
