"use client";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center text-white dark:text-black bg-zinc-900 font-sans dark:bg-zinc-100">
      <p>hello world</p>
      <div>
      <ThemeToggle/>
      </div>
    </div>
  );
}
