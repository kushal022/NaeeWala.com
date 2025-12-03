import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import ThemeProvider from "@/components/ThemeProvider";
import ReduxProvider from "@/components/ReduxProvider";

export const metadata = {
  title: "NaeeWala",
  description: "Don't waste your time NaeeWala is here to save it",
};

export default function RootLayout({ children }) {
  return (
    <ReduxProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="bg-white dark:bg-gray-950 transition">
          <ToastContainer position="top-right" autoClose={3000} />
          <ThemeProvider>{children}</ThemeProvider>
        </body>
      </html>
    </ReduxProvider>
  );
}
