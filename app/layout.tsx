import type { Metadata } from "next";
import "./globals.css";

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
        {/* El body renderizará el fondo oscuro y cualquier página que creemos */}
        <body>{children}</body>
        </html>
    );
}