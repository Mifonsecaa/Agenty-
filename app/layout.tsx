import { Toaster } from "sonner";
import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Providers from "@/components/Providers"; // Asegurémonos de que Providers se importe

export const metadata: Metadata = {
    title: "Agenty | IA para tu Negocio",
    description: "Crea tu agente de automatización describiendo tu negocio con IA.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
        <body>
        <Toaster position="bottom-right" richColors theme="dark" />
          <Providers>
            <Header />
            {children}
          </Providers>
        </body>
        </html>
    );
}
