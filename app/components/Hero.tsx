"use client";

import Image from "next/image";
import Link from "next/link";
import SeoTagText from "./seoTagText";

export default function Hero() {
  return (
    <section className="relative h-full overflow-hidden">
      {/* LIGHT MODE IMAGE */}
      <Image
        src="/hero-light.png"
        alt="CAMX CCTV"
        fill
        priority
        quality={75}
        sizes="100vw"
        className="object-cover object-right scale-100 dark:hidden"
      />

      {/* DARK MODE IMAGE */}
      <Image
        src="/hero-dark.png"
        alt="CAMX CCTV"
        fill
        priority
        quality={75}
        sizes="(max-width: 768px) 100vw, 50vw"
        className="hidden dark:block object-cover object-right scale-100"
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-white/20 dark:bg-black/70 transition-all duration-500" />

      {/* GRADIENT */}
      <div className="absolute inset-0 bg-linear-to-r from-white via-white/80 to-transparent dark:from-black dark:via-black/70 dark:to-black/10" />

      {/* CONTENT */}
      <div className="relative flex items-center h-[calc(150vh-80px)] ">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-3xl py-10">
            {/* BADGE */}
            <div className="inline-flex bg-green/90 items-center px-5 py-2 rounded-full border border-secondary/30  dark:bg-secondary/10 backdrop-blur-xl mb-7 shadow-lg">
              <span className="text-secondary text-xs md:text-sm font-black uppercase tracking-[0.35em]">
                Smart Security Solutions
              </span>
            </div>

            {/* TITLE */}
            <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight text-gray-900 dark:text-white">
              Smart CCTV
              <span className="text-secondary"> Security</span>
            </h1>

            {/* DESCRIPTION */}
            <p className="mt-6 text-lg md:text-xl leading-8 max-w-xl text-gray-700 dark:text-gray-300">
              Professional surveillance systems for homes, offices, and
              enterprise environments across Sri Lanka.
            </p>

            {/* BUTTONS */}
            <div className="mt-12 flex flex-wrap gap-5">
              {/* PRIMARY BUTTON */}
              <Link
                href="/products"
                className="px-8 py-4 rounded-2xl bg-secondary text-white font-bold shadow-[0_10px_60px_rgba(37,99,235,0.25)] hover:scale-105 hover:opacity-90 transition-all duration-300"
              >
                Browse Products
              </Link>

              {/* SECONDARY BUTTON */}
              <Link
                href="/contact"
                className="px-8 py-4 rounded-2xl border border-black/10 dark:border-white/20 bg-white/60 dark:bg-white/10 backdrop-blur-2xl text-gray-900 dark:text-white hover:bg-white/80 dark:hover:bg-white/20 transition-all duration-300"
              >
                Contact Us
              </Link>
            </div>

            {/* FEATURES */}
            <div className="mt-14 flex flex-wrap gap-8">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Reliable Systems
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  HD Surveillance
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-secondary" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  24/7 Protection
                </span>
              </div>
            </div>
          </div>

          {/* SEO TEXT - HIDDEN ON SMALL SCREENS */}
          <div className="hidden md:block mt-20">
            <SeoTagText />
          </div>
        </div>
      </div>
    </section>
  );
}
