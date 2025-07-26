import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

// Import fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ Metadata (used by Next.js for SEO and <head> tags)
export const metadata = {
  title: "Pascel By IDM – Only for IDM Members!",
  description: "Exclusive platform for IDM team members to manage, verify, and collaborate.",
  icons: {
    icon: "/logo.png", // Automatically looks in public/
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <Navbar/>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
