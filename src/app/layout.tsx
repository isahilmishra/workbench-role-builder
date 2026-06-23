import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import layoutStyles from "./layout.module.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Workbench Admin",
  description: "Role and Permissions Builder for Workbench",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className={layoutStyles.appContainer}>
          <Sidebar />
          <main className={layoutStyles.mainContent}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
