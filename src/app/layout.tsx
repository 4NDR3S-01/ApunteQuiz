import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AccessibilityProvider } from "@/components/AccessibilityProvider";
import { LanguageProvider } from '@/components/LanguageProvider';
import AccessibilitySettings from "@/components/AccessibilitySettings";
import SkipToContentLink from '@/components/SkipToContentLink';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import SessionManager from '@/components/SessionManager';
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
        <ErrorBoundary>
          <LanguageProvider>
            <AccessibilityProvider>
              <SkipToContentLink />
              <SessionManager inactivityTimeout={30} />
              {children}
              <AccessibilitySettings />
            </AccessibilityProvider>
          </LanguageProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
