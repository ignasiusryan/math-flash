"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const hasClerk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== "pk_test_placeholder";

export default function Navbar() {
  const pathname = usePathname();

  // Don't show navbar during gameplay
  if (pathname === "/play") return null;

  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur shadow-sm">
      <Link href="/" className="text-xl font-bold text-primary">
        ✖️ Math Flash
      </Link>
      <div className="flex items-center gap-4">
        <Link
          href="/play"
          className={`font-medium ${pathname === "/play" ? "text-primary" : "text-gray-500 hover:text-primary"}`}
        >
          Play
        </Link>
        <Link
          href="/parent"
          className={`font-medium ${pathname === "/parent" ? "text-primary" : "text-gray-500 hover:text-primary"}`}
        >
          Dashboard
        </Link>
        {hasClerk && <UserButton />}
      </div>
    </nav>
  );
}
