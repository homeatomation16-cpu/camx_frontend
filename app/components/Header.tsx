"use client";

import { useEffect, useState } from "react";

import dynamic from "next/dynamic";

import Link from "next/link";

import Image from "next/image";

import { usePathname } from "next/navigation";

import {
  RiPlayList2Fill,
  RiShoppingBag3Fill,
  RiInformationFill,
  RiContactsBook2Fill,
} from "react-icons/ri";

import { FiShoppingCart } from "react-icons/fi";

import { HiHome } from "react-icons/hi";

import { X } from "lucide-react";

/* DYNAMIC IMPORTS */
const UserData = dynamic(() => import("./userData"), {
  ssr: false,
});

const ThemeToggle = dynamic(() => import("./ThemeToggle"), {
  ssr: false,
});

export default function Header() {
  const [sideBarOpen, setSideBarOpen] = useState(false);

  const [cartCount, setCartCount] = useState(0);

  const pathname = usePathname();

  // ======================================
  // LOAD CART COUNT
  // ======================================

  useEffect(() => {
    const updateCartCount = () => {
      const storedCart = localStorage.getItem("CAMX_CART");

      if (!storedCart) {
        setCartCount(0);

        return;
      }

      try {
        const cart = JSON.parse(storedCart);

        const total = cart.reduce(
          (
            acc: number,
            item: {
              quantity: number;
            },
          ) => acc + item.quantity,
          0,
        );

        setCartCount(total);
      } catch {
        setCartCount(0);
      }
    };

    updateCartCount();

    window.addEventListener("storage", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  // ======================================
  // HIDE HEADER ON ADMIN
  // ======================================

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // ======================================
  // UI
  // ======================================

  return (
    <>
      {/* HEADER */}
      <header className="fixed top-0 left-0 z-50 w-full h-20 flex items-center justify-between px-4 sm:px-6 bg-white/70 dark:bg-black/40 backdrop-blur-2xl border-b border-white/10 dark:border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.05)] transition-all duration-300">
        {/* MOBILE MENU */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={() => setSideBarOpen(true)}
            className="p-2 rounded-xl text-foreground hover:text-secondary hover:bg-secondary/10 transition-all duration-300"
            aria-label="Open Menu"
          >
            <RiPlayList2Fill size={24} />
          </button>
        </div>

        {/* LOGO */}
        <div className="flex items-center">
          <Link
            href="/"
            className="relative flex items-center justify-center h-16 w-16 lg:h-30 lg:w-40"
          >
            <Image
              src="/logo.png"
              alt="CAMX.lk Logo"
              width={150}
              height={150}
              priority
              className="object-contain w-auto scale-150 md:scale-100 left-5 hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </div>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden lg:flex items-center gap-10 text-base font-bold">
          {/* HOME */}
          <Link
            href="/"
            className={`relative transition-all duration-300 hover:text-secondary after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-secondary after:transition-all after:duration-300 hover:after:w-full ${
              pathname === "/"
                ? "text-secondary after:w-full"
                : "text-foreground"
            }`}
          >
            Home
          </Link>

          {/* PRODUCTS */}
          <Link
            href="/products"
            className={`relative transition-all duration-300 hover:text-secondary after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-secondary after:transition-all after:duration-300 hover:after:w-full ${
              pathname.startsWith("/products")
                ? "text-secondary after:w-full"
                : "text-foreground"
            }`}
          >
            Products
          </Link>

          {/* ABOUT */}
          <Link
            href="/about"
            className={`relative transition-all duration-300 hover:text-secondary after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-secondary after:transition-all after:duration-300 hover:after:w-full ${
              pathname === "/about"
                ? "text-secondary after:w-full"
                : "text-foreground"
            }`}
          >
            About
          </Link>

          {/* CONTACT */}
          <Link
            href="/contact"
            className={`relative transition-all duration-300 hover:text-secondary after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-secondary after:transition-all after:duration-300 hover:after:w-full ${
              pathname === "/contact"
                ? "text-secondary after:w-full"
                : "text-foreground"
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* USER */}
          <div className="hidden lg:block min-w-20">
            <UserData />
          </div>

          {/* CART */}
          <Link
            href="/cart"
            className="relative text-secondary hover:text-white text-2xl w-11 h-11 flex items-center justify-center rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-border shadow-lg hover:bg-secondary hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300"
          >
            <FiShoppingCart size={20} />

            {/* CART COUNT */}
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* THEME */}
          <div className="hidden lg:flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* MOBILE SIDEBAR */}
      {sideBarOpen && (
        <div className="fixed inset-0 z-55 bg-black/70 backdrop-blur-sm lg:hidden animate-in fade-in duration-300">
          {/* SIDEBAR */}
          <div className="relative z-60 w-[85%] max-w-[320px] h-full bg-white/95 dark:bg-black/95 backdrop-blur-3xl border-r border-white/10 dark:border-white/5 shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
            {/* HEADER */}
            <div className="h-15 flex items-center justify-between px-6 border-b border-white/10 dark:border-white/5 bg-white/40 dark:bg-black/20 backdrop-blur-xl">
              <div className="relative w-20 h-10 flex items-center">
                <Image
                  src="/logo.png"
                  alt="CAMX Logo"
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>

              <button
                onClick={() => setSideBarOpen(false)}
                className="p-2 rounded-xl hover:bg-secondary/10 hover:text-secondary transition-all duration-300"
              >
                <X size={22} />
              </button>
            </div>

            {/* NAVIGATION */}
            <div className="relative z-10 flex flex-col gap-6 px-6 mt-10">
              <Link
                href="/"
                onClick={() => setSideBarOpen(false)}
                className={`flex items-center gap-4 text-lg font-bold transition-all duration-300 hover:text-secondary ${
                  pathname === "/" ? "text-secondary" : "text-foreground"
                }`}
              >
                <HiHome className="text-2xl text-neutral-400" />
                Home
              </Link>

              <Link
                href="/products"
                onClick={() => setSideBarOpen(false)}
                className={`flex items-center gap-4 text-lg font-bold transition-all duration-300 hover:text-secondary ${
                  pathname.startsWith("/products")
                    ? "text-secondary"
                    : "text-foreground"
                }`}
              >
                <RiShoppingBag3Fill className="text-2xl text-neutral-400" />
                Products
              </Link>

              <Link
                href="/about"
                onClick={() => setSideBarOpen(false)}
                className={`flex items-center gap-4 text-lg font-bold transition-all duration-300 hover:text-secondary ${
                  pathname === "/about" ? "text-secondary" : "text-foreground"
                }`}
              >
                <RiInformationFill className="text-2xl text-neutral-400" />
                About
              </Link>

              <Link
                href="/contact"
                onClick={() => setSideBarOpen(false)}
                className={`flex items-center gap-4 text-lg font-bold transition-all duration-300 hover:text-secondary ${
                  pathname === "/contact" ? "text-secondary" : "text-foreground"
                }`}
              >
                <RiContactsBook2Fill className="text-2xl text-neutral-400" />
                Contact
              </Link>
            </div>

            {/* FOOTER */}
            <div className="mt-auto mb-8 mx-4 p-5 rounded-3xl bg-white/40 dark:bg-white/5 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-sm flex flex-col gap-5">
              {/* USER */}
              <div className="w-full">
                <UserData compact={true} />
              </div>

              {/* THEME */}
              <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-bold text-neutral-400">
                  Appearance
                </span>

                <ThemeToggle />
              </div>
            </div>
          </div>

          {/* BACKDROP */}
          <div
            onClick={() => setSideBarOpen(false)}
            className="absolute inset-0 -z-10"
          />
        </div>
      )}
    </>
  );
}
