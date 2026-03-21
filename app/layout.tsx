import type { Metadata } from "next";
import { Inter } from "next/font/google"; // 1. Import Inter Font
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import { Toaster } from "sonner";
import { LiveChatWidget } from "@/components/LiveChatWidget";

// 2. Configure font subset
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "brainia | IA para tu Negocio",
  description: "Crea tu agente de automatización describiendo tu negocio con IA.",
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="es" className="overscroll-none dark" style={{ colorScheme: 'dark' }}>
      {/* 3. Combinamos la fuente con las clases para evitar el rebote */}
      <body className={`${inter.className} overscroll-none bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300`}>
      <Providers>
        <Header />
        <main className="min-h-screen">
            {children}
        </main>
        <LiveChatWidget />
        <Footer />
        <Toaster theme="system" position="top-center" richColors />
      </Providers>
      </body>
      </html>
  );
}
