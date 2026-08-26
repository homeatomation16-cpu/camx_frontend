"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaBoxOpen, FaSignOutAlt, FaUserCircle } from "react-icons/fa";

type UserType = {
  name: string;
  email: string;
  role: string;
  image?: string;
};

type Props = {
  compact?: boolean;
};

export default function UserData({ compact = false }: Props) {
  const router = useRouter();

  // Lazy Initialization: මූලික අවස්ථාවේම දත්ත ලබාගැනීම
  const [user, setUser] = useState<UserType | null>(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("CAMX_USER");
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  });

  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);

  // Hydration අවසානය තහවුරු කිරීම (ESLint error එක මඟහරිමින්)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  // =========================
  // PREVENT HYDRATION ERROR
  // =========================
  if (!hydrated) {
    return <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />;
  }

  // =========================
  // NO USER
  // =========================
  if (!user) {
    return (
      <Link href="/login" className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary text-white hover:scale-105 transition">
        <FaUserCircle size={20} />
      </Link>
    );
  }

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    localStorage.removeItem("CAMX_TOKEN");
    localStorage.removeItem("CAMX_USER");
    setUser(null);
    router.push("/login");
  };

  // =========================
  // SAFE IMAGE
  // =========================
  const imageSrc = user.image && typeof user.image === "string" && user.image.trim() !== "" && (user.image.startsWith("http://") || user.image.startsWith("https://") || user.image.startsWith("/")) ? user.image : "/default-avatar.png";

  // =========================
  // MOBILE VIEW
  // =========================
  if (compact) {
    return (
      <div className="w-full flex flex-col gap-4">
        {/* USER */}
        <div className="flex items-center gap-3">
          <Image src={imageSrc} alt={user.name || "User"} width={40} height={40} unoptimized priority className="rounded-full border border-gray-200 dark:border-gray-700" />
          <div>
            <p className="font-bold text-sm text-gray-800 dark:text-white">{user.name}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
        </div>

        {/* MENU */}
        <div className="flex flex-col gap-1 border-t border-gray-100 dark:border-gray-800 pt-3">
          {/* ORDERS */}
          <Link href="/orders" className="flex items-center gap-3 text-sm font-semibold py-2.5 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
            <FaBoxOpen className="text-cyan-400" /> My Orders
          </Link>

          {/* ADMIN */}
          {user.role === "admin" && (
            <Link href="/admin" className="flex items-center gap-3 text-sm font-semibold py-2.5 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
              <FaUserCircle className="text-cyan-400" /> Admin Panel
            </Link>
          )}

          {/* LOGOUT */}
          <button onClick={handleLogout} className="flex items-center gap-3 text-sm font-semibold py-2.5 px-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // DESKTOP VIEW
  // =========================
  return (
    <div className="relative">
      {/* BUTTON */}
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 transition-transform duration-200 hover:scale-105">
        <Image src={imageSrc} alt={user.name || "User"} width={40} height={40} unoptimized className="rounded-full border-2 border-cyan-400 shadow-sm" />
        <span className="hidden lg:block text-sm font-bold text-gray-800 dark:text-white">{user.name}</span>
      </button>

      {/* DROPDOWN */}
      {open && (
        <>
          {/* BACKDROP */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* MENU */}
          <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.2)] z-50 p-2">
            {/* USER INFO */}
            <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 mb-1">
              <p className="font-black text-xs text-gray-400 uppercase tracking-wider">Account</p>
              <p className="font-bold text-sm text-gray-800 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            </div>

            {/* ORDERS */}
            <Link href="/orders" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition">
              <FaBoxOpen size={16} className="text-cyan-400" /> My Orders
            </Link>

            {/* ADMIN */}
            {user.role === "admin" && (
              <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition">
                <FaUserCircle size={16} className="text-cyan-400" /> Admin Panel
              </Link>
            )}

            {/* DIVIDER */}
            <div className="my-1 border-t border-gray-100 dark:border-gray-800" />

            {/* LOGOUT */}
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition">
              <FaSignOutAlt size={16} /> Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
