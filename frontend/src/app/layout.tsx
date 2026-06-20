import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { Topbar } from "@/components/layout/Topbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Player } from "@/components/player/Player";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { GoogleOAuthProvider } from '@react-oauth/google';

import { Suspense } from 'react';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jamify - Collaborative Music Streaming",
  description: "Listen to music together in real-time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#121212] text-white overflow-hidden h-screen flex flex-col`}>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
          <AuthGuard>
            <div className="flex-1 flex overflow-hidden pb-[140px] md:pb-24">
            <div className="hidden md:block">
              <Sidebar />
            </div>
            <main className="flex-1 overflow-y-auto bg-[#121212] relative md:rounded-lg md:mt-2 mb-2 md:mr-2">
              <Suspense fallback={<div className="h-16 bg-[#121212]"></div>}>
                <Topbar />
              </Suspense>
              {children}
            </main>
            <div className="hidden lg:block">
              <RightSidebar />
            </div>
          </div>
          <BottomNav />
          <Player />
          </AuthGuard>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
