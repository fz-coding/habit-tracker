import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { HabitProvider } from "@/contexts/HabitContext";
import BottomNav from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "习惯追踪器 - 把想坚持变成能坚持",
  description:
    "用弹性计划、可视化反馈和极简操作，帮助你养成好习惯，把想坚持变成能坚持。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <HabitProvider>
          <main className="flex-1 pb-20 max-w-lg mx-auto w-full">
            {children}
          </main>
          <BottomNav />
        </HabitProvider>
      </body>
    </html>
  );
}
