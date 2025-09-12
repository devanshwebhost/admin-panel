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
      <head>
        {/* SEO meta tags */}
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content={metadata.description} />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Indocs Media" />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:url" content="https://yourwebsite.com" />
        <meta name="twitter:card" content="summary_large_image" />
        
        {/* Google site verification */}
        <meta
          name="google-site-verification"
          content="bmKNUPDQQDedvtwaI9MwDsLVBwHQFcS9Q6gFmy26lTY"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} scroll-smooth antialiased`}
      >
        <Providers>
          <ToastContainer position="top-right" className={"z-[999]"} autoClose={3000} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
