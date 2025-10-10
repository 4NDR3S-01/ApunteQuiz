import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AccessibilityProvider } from "@/components/AccessibilityProvider";
import AccessibilitySettings from "@/components/AccessibilitySettings";
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
  title: "ApunteQuiz",
  description:
    "Convierte tus apuntes en quizzes inteligentes alimentados con IA y listos para practicar.",
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
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AccessibilityProvider>
          <a href="#contenido-principal" className="skip-to-content">
            Saltar al contenido principal
          </a>
          {children}
          <AccessibilitySettings />
        </AccessibilityProvider>
      </body>
    </html>
  );
}
