"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full bg-white border-b border-brown-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="text-2xl font-extrabold text-[#4b2e2e]">
          Helpdesk
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-brown-800 hover:text-[#4b2e2e] font-medium transition"
          >
            Dashboard
          </Link>

          {/* Signed Out → Show Login */}
          <SignedOut>
            <Button
              className="bg-[#4b2e2e] text-white hover:bg-[#3b2626]"
              asChild
            >
              <Link href="/sign-in">Login</Link>
            </Button>
          </SignedOut>

          {/* Signed In → Show Clerk User Menu */}
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-10 h-10",
                },
              }}
            />
          </SignedIn>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-[#4b2e2e]"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="md:hidden bg-white border-t border-brown-200 px-6 py-4 space-y-4">
          <Link
            href="/dashboard"
            className="block text-brown-800 hover:text-[#4b2e2e] font-medium"
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>

          <Link
            href="/about"
            className="block text-brown-800 hover:text-[#4b2e2e] font-medium"
            onClick={() => setOpen(false)}
          >
            About
          </Link>

          <SignedOut>
            <Button
              className="w-full bg-[#4b2e2e] text-white hover:bg-[#3b2626]"
              asChild
            >
              <Link href="/sign-in">Login</Link>
            </Button>
          </SignedOut>

          <SignedIn>
            <div className="pt-2">
              <UserButton />
            </div>
          </SignedIn>
        </div>
      )}
    </nav>
  );
}
