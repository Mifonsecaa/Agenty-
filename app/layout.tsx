import type { Metadata } from "next";
import { Inter } from "next/font/google"; // 1. Import Inter Font
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import { Toaster } from "sonner";
import dynamic from 'next/dynamic';
import { BrainiaProvider } from '@/context/BrainiaContext';

const PlaygroundClient = dynamic(() => import('@/components/PlaygroundClient'));

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
      <html lang="es" className="overscroll-none">
      {/* 3. Combinamos la fuente con las clases para evitar el rebote */}
      <body className={`${inter.className} overscroll-none bg-black`}>
      <Providers>
        <BrainiaProvider>
          <Header />
          <main className="min-h-screen">
              {children}
          </main>
          <Footer />
          <PlaygroundClient />
          <Toaster theme="dark" position="top-center" richColors />
        </BrainiaProvider>
      </Providers>
      </body>
      </html>
  );
}
