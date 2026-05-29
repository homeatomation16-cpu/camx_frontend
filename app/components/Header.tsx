"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { RiPlayList2Fill } from "react-icons/ri";
import { FiShoppingCart } from "react-icons/fi";
import { X } from "lucide-react";

const UserData = dynamic(() => import("./userData"), { ssr: false });
const ThemeToggle = dynamic(() => import("./ThemeToggle"), { ssr: false });

export default function Header() {
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const pathname = usePathname();

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
          (acc: number, item: { quantity: number }) => acc + item.quantity,
          0,
        );
        setCartCount(total);
      } catch {
        setCartCount(0);
      }
    };
    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    return () => window.removeEventListener("storage", updateCartCount);
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <header className="fixed top-0 left-0 z-50 w-full h-20 flex items-center justify-between px-4 sm:px-6 bg-white/70 dark:bg-black/40 backdrop-blur-2xl border-b border-white/10 dark:border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.05)] transition-all duration-300">
        <div className="flex items-center lg:hidden">
          <button
            onClick={() => setSideBarOpen(true)}
            className="p-2 rounded-xl text-foreground hover:text-secondary hover:bg-secondary/10 transition-all duration-300"
          >
            <RiPlayList2Fill size={24} />
          </button>
        </div>

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
              className="object-contain w-auto scale-150 md:scale-100 left-5"
            />
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-10 text-base font-bold">
          <Link
            href="/"
            className={pathname === "/" ? "text-secondary" : "text-foreground"}
          >
            Home
          </Link>
          <Link
            href="/products"
            className={
              pathname.startsWith("/products")
                ? "text-secondary"
                : "text-foreground"
            }
          >
            Products
          </Link>
          <Link
            href="/about"
            className={
              pathname === "/about" ? "text-secondary" : "text-foreground"
            }
          >
            About
          </Link>
          <Link
            href="/contact"
            className={
              pathname === "/contact" ? "text-secondary" : "text-foreground"
            }
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden lg:block min-w-20">
            <UserData />
          </div>
          <Link
            href="/cart"
            className="relative text-secondary w-11 h-11 flex items-center justify-center rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-border shadow-lg"
          >
            <FiShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <div className="hidden lg:flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* MOBILE SIDEBAR */}
      {sideBarOpen && (
        <div className="fixed inset-0 z-100 bg-black/70 backdrop-blur-sm lg:hidden">
          <div className="relative w-[85%] max-w-[320px] h-full bg-white/95 dark:bg-black/95 border-r border-white/10 shadow-2xl flex flex-col">
            <div className="h-15 flex items-center justify-between px-6 border-b border-white/10">
              <Image
                src="/logo.png"
                alt="CAMX Logo"
                width={60}
                height={60}
                className="object-contain"
              />
              <button onClick={() => setSideBarOpen(false)} className="p-2">
                <X size={22} />
              </button>
            </div>

            <div className="flex flex-col gap-6 px-6 mt-10">
              <Link
                href="/"
                onClick={() => setSideBarOpen(false)}
                className="flex items-center gap-4 text-lg font-bold"
              >
                Home
              </Link>
              <Link
                href="/products"
                onClick={() => setSideBarOpen(false)}
                className="flex items-center gap-4 text-lg font-bold"
              >
                Products
              </Link>
              <Link
                href="/about"
                onClick={() => setSideBarOpen(false)}
                className="flex items-center gap-4 text-lg font-bold"
              >
                About
              </Link>
              <Link
                href="/contact"
                onClick={() => setSideBarOpen(false)}
                className="flex items-center gap-4 text-lg font-bold"
              >
                Contact
              </Link>
            </div>

            {/* FOOTER - මෙහි relative z-50 එකතු කළා */}
            <div className="mt-auto mb-8 mx-4 p-5 rounded-3xl bg-white/40 dark:bg-white/5 backdrop-blur-2xl border border-white/10 shadow-sm flex flex-col gap-5 relative z-30">
              <UserData compact={true} />
              <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-400">
                  Appearance
                </span>
                <ThemeToggle />
              </div>
            </div>
          </div>
          <div
            onClick={() => setSideBarOpen(false)}
            className="absolute inset-0 -z-10"
          />
        </div>
      )}
    </>
  );
}
