'use client';

import Link from 'next/link';
import Image from 'next/image';

import {
  useEffect,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

import {
  FaUserPlus,
  FaBoxOpen,
  FaSignOutAlt,
  FaUserCircle,
} from 'react-icons/fa';

// ======================================
// TYPES
// ======================================

type UserType = {
  name: string;
  email: string;
  role: string;
  image?: string;
};

type Props = {
  compact?: boolean;
};

// ======================================
// COMPONENT
// ======================================

export default function UserData({
  compact = false,
}: Props) {

  const [user, setUser] =
    useState<UserType | null>(
      null
    );

  const [open, setOpen] =
    useState(false);

  const router = useRouter();

  // ======================================
  // LOAD USER
  // ======================================

  useEffect(() => {

    queueMicrotask(() => {

      const token =
        localStorage.getItem(
          'CAMX_TOKEN'
        );

      const storedUser =
        localStorage.getItem(
          'CAMX_USER'
        );

      if (
        !token ||
        !storedUser
      ) {
        return;
      }

      try {

        const parsedUser =
          JSON.parse(
            storedUser
          );

        setUser(parsedUser);

      } catch (error) {

        console.error(error);

        setUser(null);
      }

    });

  }, []);

  // ======================================
  // LOGOUT
  // ======================================

  const handleLogout = () => {

    localStorage.removeItem(
      'CAMX_TOKEN'
    );

    localStorage.removeItem(
      'CAMX_USER'
    );

    setUser(null);

    setOpen(false);

    router.push('/login');
  };

  // ======================================
  // SAFE IMAGE
  // ======================================

  const safeImage = (
    image?: string
  ) => {

    if (
      image &&
      (
        image.startsWith(
          'http'
        ) ||
        image.startsWith('/')
      )
    ) {
      return image;
    }

    return '/default-avatar.png';
  };

  // ======================================
  // NOT LOGGED IN
  // ======================================

  if (!user) {

    return (
      <div className="relative">

        {/* USER ICON */}
        <FaUserPlus
          onClick={() =>
            setOpen(!open)
          }
          className="text-gold text-2xl cursor-pointer hover:scale-110 transition"
        />

        {/* DROPDOWN */}
        {open && (
          <>
            {/* BACKDROP */}
            <div
              className="fixed inset-0 z-40"
              onClick={() =>
                setOpen(false)
              }
            />

            <div className="absolute right-0 mt-3 w-44 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50">

              <Link
                href="/login"
                onClick={() =>
                  setOpen(false)
                }
                className="block px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Login
              </Link>

              <Link
                href="/register"
                onClick={() =>
                  setOpen(false)
                }
                className="block px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Register
              </Link>
            </div>
          </>
        )}
      </div>
    );
  }

  // ======================================
  // LOGGED IN
  // ======================================

  return (
    <div className="relative">

      {/* USER BUTTON */}
      <button
        onClick={() =>
          setOpen(!open)
        }
        className="flex items-center gap-2 cursor-pointer"
      >

        {/* IMAGE */}
        <div
          className={`relative overflow-hidden rounded-full border-2 border-cyan-400 shrink-0 ${
            compact
              ? 'w-8 h-8'
              : 'w-10 h-10'
          }`}
        >
          <Image
            src={safeImage(
              user.image
            )}
            alt={user.name}
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>

        {/* NAME */}
        {!compact && (
          <span className="hidden lg:block text-sm font-semibold text-white">
            {user.name}
          </span>
        )}
      </button>

      {/* DROPDOWN */}
      {open && (
        <>
          {/* BACKDROP */}
          <div
            className="fixed inset-0 z-40"
            onClick={() =>
              setOpen(false)
            }
          />

          <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50">

            {/* USER INFO */}
            <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">

              <div className="flex items-center gap-3">

                <FaUserCircle className="text-3xl text-cyan-400 shrink-0" />

                <div className="min-w-0">

                  <p className="font-bold text-gray-900 dark:text-white truncate">
                    {user.name}
                  </p>

                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* MY ORDERS */}
            <button
              onClick={() => {

                setOpen(false);

                router.push(
                  '/orders'
                );
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition font-semibold"
            >
              <FaBoxOpen className="text-cyan-400" />

              <span>
                My Orders
              </span>
            </button>

            {/* ADMIN PANEL */}
            {user.role ===
              'admin' && (
              <button
                onClick={() => {

                  setOpen(false);

                  router.push(
                    '/admin'
                  );
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition font-semibold"
              >
                <FaUserCircle className="text-cyan-400" />

                <span>
                  Admin Panel
                </span>
              </button>
            )}

            {/* LOGOUT */}
            <button
              onClick={
                handleLogout
              }
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition font-semibold"
            >
              <FaSignOutAlt />

              <span>
                Logout
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}