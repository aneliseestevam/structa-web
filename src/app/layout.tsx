import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { PermissionsProvider } from "@/contexts/PermissionsContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
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
  title: "Structa - Sistema de Gestão de Obras",
  description: "Plataforma completa para gestão e acompanhamento de obras, com controle de etapas, materiais e custos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <PermissionsProvider>
            <DataProvider>
              <NotificationsProvider>
                {children}
              </NotificationsProvider>
            </DataProvider>
          </PermissionsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
