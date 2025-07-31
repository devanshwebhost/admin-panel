import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "./providers";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Pascel By IDM – Only for IDM Members!",
  description: "Exclusive platform for IDM team members to manage, verify, and collaborate.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} scroll-smooth  antialiased`}
      >
        <Providers>
          <ToastContainer position="top-right" className={'z-[999]'} autoClose={3000} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
