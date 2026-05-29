"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { usePathname, useRouter } from "next/navigation";

import {
  LayoutDashboard,
  PackagePlus,
  Boxes,
  ShoppingCart,
  Users,
  Menu,
  X,
  LogOut,
  BoxSelectIcon,
} from "lucide-react";

import ThemeToggle from "../components/ThemeToggle";

import UserData from "../components/userData";
import { FcComboChart } from "react-icons/fc";

// ======================================
// COMPONENT
// ======================================

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);

  // ======================================
  // AUTH CHECK
  // ======================================

  useEffect(() => {
    const token = localStorage.getItem("CAMX_TOKEN");

    const user = localStorage.getItem("CAMX_USER");

    if (!token || !user) {
      router.push("/login");
    }
  }, [router]);

  // ======================================
  // LOCK BODY SCROLL
  // ======================================

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // ======================================
  // MENU ITEMS
  // ======================================

  const menuItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard size={20} />,
    },

    {
      name: "Add Product",
      href: "/admin/productAdd",
      icon: <PackagePlus size={20} />,
    },

    {
      name: "Products",
      href: "/admin/products",
      icon: <Boxes size={20} />,
    },

    {
      name: "Inventory",
      href: "/admin/inventory",
      icon: <BoxSelectIcon size={20} />,
    },

    {
      name: "Orders",
      href: "/admin/orders",
      icon: <ShoppingCart size={20} />,
    },

    {
      name: "Users",
      href: "/admin/customers",
      icon: <Users size={20} />,
    },

    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: <FcComboChart size={20} />,
    },
    {
      name: "POS",
      href: "/admin/pos",
      icon: <ShoppingCart size={20} />,
    },
  ];

  // ======================================
  // LOGOUT
  // ======================================

  const handleLogout = () => {
    localStorage.removeItem("CAMX_TOKEN");

    localStorage.removeItem("CAMX_USER");

    router.push("/");
  };

  // ======================================
  // UI
  // ======================================

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-background text-neutral-900 dark:text-white flex overflow-hidden">
      {/* ====================================== */}
      {/* MOBILE TOPBAR */}
      {/* ====================================== */}

      <div className="lg:hidden fixed top-0 left-0 w-full h-16 bg-white/90 dark:bg-card/90 backdrop-blur-xl border-b border-border flex items-center justify-between px-5 z-50">
        <span className="font-black tracking-wider text-secondary text-sm">
          CAMX ADMIN
        </span>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-xl border border-border bg-neutral-50 dark:bg-background flex items-center justify-center"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ====================================== */}
      {/* SIDEBAR */}
      {/* ====================================== */}

      <aside
        className={`fixed top-0 left-0 z-40 w-72 h-screen bg-white dark:bg-card border-r border-border flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* CONTENT */}
        <div className="flex flex-col h-full overflow-y-auto">
          {/* LOGO */}
          <div className="px-6 pt-24 lg:pt-8 pb-8 border-b border-border">
            <h2 className="text-2xl font-black tracking-wider">
              CAMX.
              <span className="text-secondary">lk</span>
            </h2>

            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-400 mt-2">
              Management Hub
            </p>
          </div>

          {/* NAVIGATION */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item, index) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));

              return (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                    isActive
                      ? "bg-secondary text-white shadow-lg shadow-secondary/20"
                      : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  {item.icon}

                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* FOOTER */}
          <div className="p-4 border-t border-border space-y-4">
            {/* USER + THEME */}
            <div className="flex items-center justify-between">
              <UserData compact />

              <ThemeToggle />
            </div>

            {/* LOGOUT */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
            >
              <LogOut size={18} />
              Exit Panel
            </button>
          </div>
        </div>
      </aside>

      {/* ====================================== */}
      {/* BACKDROP */}
      {/* ====================================== */}

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* ====================================== */}
      {/* MAIN CONTENT */}
      {/* ====================================== */}

      <div className="flex-1 lg:ml-72 min-w-0">
        <main className="min-h-screen pt-16 lg:pt-0 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
