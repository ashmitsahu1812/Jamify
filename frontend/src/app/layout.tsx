import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Player } from "@/components/player/Player";
import { AuthGuard } from "@/components/auth/AuthGuard";

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
        <AuthGuard>
          <div className="flex-1 flex overflow-hidden pb-24">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-[#121212] relative rounded-lg mt-2 mb-2 mr-2">
              <Topbar />
              {children}
            </main>
            <RightSidebar />
          </div>
          <Player />
        </AuthGuard>
      </body>
    </html>
  );
}
