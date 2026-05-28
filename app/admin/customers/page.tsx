'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Search, ShieldCheck, ShieldX } from 'lucide-react';
import toast from 'react-hot-toast';

// ======================================
// API
// ======================================

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

// ======================================
// TYPES
// ======================================

type User = {
  _id: string;
  image?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  isBlocked?: boolean;
  isEmailVerified?: boolean;
};

// ======================================
// IMAGE URL HELPER
// ======================================

const safeImage = (image?: string) => {
  if (image && (image.startsWith('http') || image.startsWith('/'))) {
    return image;
  }
  return '/default-avatar.png';
};

// ======================================
// COMPONENT
// ======================================

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState('');

  // ======================================
  // FETCH USERS
  // ======================================

  const fetchUsers = async (signal?: AbortSignal) => {
    try {
      const token = localStorage.getItem('CAMX_TOKEN');

      const response = await axios.get(`${API}/api/users/all`, {
        signal,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(response.data || []);
      setLoaded(true);
    } catch (error) {
      if (axios.isCancel(error)) {
        return;
      }
      console.error(error);
    }
  };

  // ======================================
  // TOGGLE BLOCK
  // ======================================

  const toggleBlock = async (email: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('CAMX_TOKEN');

      await axios.put(
        `${API}/api/users/status/${email}`,
        {
          isBlocked: !currentStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(currentStatus ? 'User unblocked' : 'User blocked');

      setUsers((prev) =>
        prev.map((user) =>
          user.email === email
            ? { ...user, isBlocked: !currentStatus }
            : user
        )
      );
    } catch (error) {
      console.error(error);
      toast.error('Failed to update user');
    }
  };

  // ======================================
  // EFFECT
  // ======================================

  useEffect(() => {
    const controller = new AbortController();

    queueMicrotask(() => {
      fetchUsers(controller.signal);
    });

    return () => {
      controller.abort();
    };
  }, []);

  // ======================================
  // FILTER USERS
  // ======================================

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`;

    return (
      fullName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  // ======================================
  // LOADING
  // ======================================

  if (!loaded) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Loading...
      </main>
    );
  }

  // ======================================
  // UI
  // ======================================

  return (
    <main
      className="w-full flex justify-center p-6 lg:p-10
      bg-linear-to-b from-neutral-100 to-white
      dark:from-background dark:to-background
      text-neutral-900 dark:text-white"
    >
      <div className="w-full max-w-7xl">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-8">
          <div>
            <h1 className="text-4xl font-black">Customers</h1>
            <p className="text-neutral-500 mt-1">Manage registered users</p>
          </div>

          {/* SEARCH */}
          <div className="relative w-full lg:w-80">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 w-full pl-11 pr-4 rounded-2xl border border-border bg-white dark:bg-card outline-none"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-3xl shadow-xl bg-white dark:bg-card border border-border">
          <table className="w-full min-w-200 table-auto border-separate border-spacing-0">
            <thead>
              <tr className="bg-secondary text-white">
                <th className="px-4 py-4 text-left text-xs uppercase tracking-wider">
                  Image
                </th>
                <th className="px-4 py-4 text-left text-xs uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-4 text-left text-xs uppercase tracking-wider">
                  First Name
                </th>
                <th className="px-4 py-4 text-left text-xs uppercase tracking-wider">
                  Last Name
                </th>
                <th className="px-4 py-4 text-left text-xs uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-4 text-left text-xs uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-4 text-left text-xs uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-border hover:bg-neutral-50 dark:hover:bg-white/5 transition"
                >
                  {/* IMAGE */}
                  <td className="px-4 py-4">
                    <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-border bg-neutral-100">
                      <Image
                        src={safeImage(item.image)}
                        alt="User"
                        fill
                        unoptimized
                        referrerPolicy="no-referrer"
                        className="object-cover"
                      />
                    </div>
                  </td>

                  {/* EMAIL */}
                  <td className="px-4 py-4 text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <span>{item.email}</span>
                      {item.isEmailVerified && (
                        <ShieldCheck size={16} className="text-blue-500" />
                      )}
                    </div>
                  </td>

                  {/* FIRST NAME */}
                  <td className="px-4 py-4 text-sm">{item.firstName}</td>

                  {/* LAST NAME */}
                  <td className="px-4 py-4 text-sm font-semibold">
                    {item.lastName}
                  </td>

                  {/* ROLE */}
                  <td className="px-4 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.role === 'admin'
                          ? 'bg-red-500/10 text-red-600'
                          : 'bg-blue-500/10 text-blue-600'
                      }`}
                    >
                      {item.role}
                    </span>
                  </td>

                  {/* STATUS */}
                  <td className="px-4 py-4 text-sm font-semibold">
                    <span
                      className={
                        item.isBlocked ? 'text-red-600' : 'text-green-600'
                      }
                    >
                      {item.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>

                  {/* ACTION */}
                  <td className="px-4 py-4">
                    <button
                      onClick={() =>
                        toggleBlock(item.email, item.isBlocked || false)
                      }
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                        item.isBlocked
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                    >
                      {item.isBlocked ? (
                        <span className="flex items-center gap-2">
                          <ShieldCheck size={16} />
                          Unblock
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <ShieldX size={16} />
                          Block
                        </span>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}