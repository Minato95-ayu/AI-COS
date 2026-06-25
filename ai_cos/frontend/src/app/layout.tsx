import React from "react";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "AI Company OS (AI-COS)",
  description: "Enterprise operating command dashboard managing hundreds of virtual employees.",
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased text-slate-100 bg-zinc-950 min-h-screen">
        <div className="flex flex-col min-h-screen">
          <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md px-6 py-4 flex items-center justify-between">
            <span className="font-mono text-sm uppercase text-cyan-400">AI-COS CORE v1.0</span>
          </header>
          <main className="flex-1 max-w-7xl w-full mx-auto p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}