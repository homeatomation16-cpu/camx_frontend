"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const brands = [
  {
    name: "Hikvision",
    logo: "https://static.cdnlogo.com/logos/h/87/hikvision.svg",
  },

  {
    name: "Dahua",
    logo: "/dahua.svg",
  },

  {
    name: "EZVIZ",
    logo: "/ezviz.svg",
  },

  {
    name: "TP-Link",
    logo: "/tplink.svg",
  },

  {
    name: "Ubiquiti",
    logo: "/ubiquiti.svg",
  },

  {
    name: "Uniview",
    logo: "/uniview.svg",
  },
];

export default function Providers() {
  return (
    <section className="relative overflow-hidden bg-background py-24 lg:py-32">
      {/* BG EFFECT */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />

        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 lg:px-8">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          {/* BADGE */}
          <div className="mb-5 inline-flex rounded-full border border-secondary/20 bg-secondary/5 px-5 py-2">
            <span className="text-xs font-bold uppercase tracking-[0.28em] text-secondary">
              Trusted Brands
            </span>
          </div>

          {/* TITLE */}
          <h2 className="text-4xl font-black tracking-tight text-foreground lg:text-5xl">
            Our Trusted Providers
          </h2>

          {/* SUBTITLE */}
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-foreground/60 lg:text-lg">
            Authorized security and networking brands we install and support
            across Sri Lanka.
          </p>
        </motion.div>

        {/* GRID */}
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {brands.map((brand, index) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{
                y: -6,
                scale: 1.03,
              }}
              transition={{
                duration: 0.4,
                delay: index * 0.05,
              }}
              className="
                group
                relative
                overflow-hidden
                rounded-3xl
                border
                border-neutral-200
                bg-card
                p-6
                transition-all
                duration-500
                hover:border-secondary/30
                hover:shadow-[0_20px_80px_-20px_rgba(21,66,245,0.22)]
                dark:border-border
              "
            >
              {/* GLOW */}
              <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/10 blur-3xl" />
              </div>

              {/* LOGO */}
              <div className="relative z-10 flex h-24 items-center justify-center">
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={140}
                  height={60}
                  className="max-h-12 w-auto object-contain transition duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* BRAND NAME */}
              <div className="relative z-10 mt-4 text-center">
                <h3 className="text-sm font-semibold tracking-wide text-foreground transition duration-300 group-hover:text-secondary">
                  {brand.name}
                </h3>
              </div>

              {/* BOTTOM LINE */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-secondary transition-all duration-500 group-hover:w-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
