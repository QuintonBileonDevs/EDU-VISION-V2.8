import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata = {
  title: "EduVision - System Maintenance Mode Control Center",
  description: "Advanced administration and system configurations console",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased bg-[#F8F9FA] text-[#212529] dark:bg-[#070D1F] dark:text-slate-100 min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
