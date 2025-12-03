import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import { ToastContainer } from "react-toastify";
// import Providers from "@/lib/Providers";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata = {
  title: "NaeeWala",
  description: "Don't waste your time NaeeWala is here to save it",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-950 transition">
        <ToastContainer position="top-right" autoClose={3000} />
        <ThemeProvider>
          {/* <Providers>{children}</Providers> */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
