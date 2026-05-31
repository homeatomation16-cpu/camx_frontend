"use client";

import Link from "next/link";
import { Boxes, PackagePlus, ShoppingCart, Users } from "lucide-react";

export default function AdminPage() {
  const cards = [
    {
      title: "Add Product",
      description: "Create and manage CCTV products.",
      href: "/admin/productAdd",
      icon: <PackagePlus size={36} />,
    },
    {
      title: "Products",
      description: "Manage all products and inventory.",
      href: "/products",
      icon: <Boxes size={36} />,
    },
    {
      title: "Orders",
      description: "Track customer orders and payments.",
      href: "/admin/orders",
      icon: <ShoppingCart size={36} />,
    },
    {
      title: "Customers",
      description: "Manage registered customer accounts.",
      href: "/admin/customers",
      icon: <Users size={36} />,
    },
  ];

  return (
    <div className="p-6 sm:p-8 md:p-12 max-w-7xl mx-auto w-full">
      {/* HEADER SECTION */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 dark:text-white">
          Admin
          <span className="text-secondary"> Overview</span>
        </h1>
        <p className="text-sm text-neutral-500 dark:text-gray-400 mt-2">Select a node metric to monitor inventory assets or client invoice logs.</p>
      </div>

      {/* DASHBOARD ACTION GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <Link key={index} href={card.href} className="bg-white dark:bg-card border border-neutral-200 dark:border-border rounded-3xl p-6 hover:border-secondary dark:hover:border-secondary hover:-translate-y-1 transition duration-300 shadow-sm flex flex-col">
            <div className="text-secondary mb-4">{card.icon}</div>

            <h2 className="text-xl font-bold mb-2 text-neutral-900 dark:text-white">{card.title}</h2>

            <p className="text-sm text-neutral-500 dark:text-gray-400 leading-relaxed">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
