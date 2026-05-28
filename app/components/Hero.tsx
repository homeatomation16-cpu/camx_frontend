"use client";

import Image from "next/image";
import Link from "next/link";
import SeoTagText from "./seoTagText";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 lg:pt-20">
      {/* LIGHT MODE IMAGE */}
      <Image
        src="/hero-light.png"
        alt="CAMX CCTV"
        fill
        priority
        quality={75}
        sizes="100vw"
        className="object-cover object-center dark:hidden lg:object-right"
      />

      {/* DARK MODE IMAGE */}
      <Image
        src="/hero-dark.png"
        alt="CAMX CCTV"
        fill
        priority
        quality={75}
        sizes="100vw"
        className="hidden object-cover object-center dark:block lg:object-right"
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-white/40 transition-all duration-500 dark:bg-black/70" />

      {/* GRADIENT */}
      <div className="absolute inset-0 bg-linear-to-r from-white via-white/90 to-white/30 dark:from-black dark:via-black/80 dark:to-black/20" />

      {/* CONTENT */}
      <div className="relative flex min-h-screen items-center">
        <div className="mx-auto w-full max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            {/* BADGE */}
            <div className="mb-6 inline-flex w-full max-w-[320px] justify-center rounded-full border border-secondary/20 bg-green/90 px-4 py-2 shadow-lg backdrop-blur-xl dark:bg-secondary/10 lg:w-auto lg:max-w-none lg:px-5">
              <span className="text-[10px] font-black uppercase tracking-[0.28em] text-secondary lg:text-sm">
                Smart Security Solutions
              </span>
            </div>

            {/* TITLE */}
            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-gray-900 dark:text-white lg:text-7xl">
              Smart CCTV
              <span className="text-secondary"> Security</span>
            </h1>

            {/* DESCRIPTION */}
            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-700 dark:text-gray-300 lg:mt-6 lg:text-xl lg:leading-8">
              Professional surveillance systems for homes, offices, and
              enterprise environments across Sri Lanka.
            </p>

            {/* BUTTONS */}
            <div className="mt-10 flex w-full flex-col gap-4 lg:w-auto lg:flex-row lg:items-center">
              {/* PRIMARY */}
              <Link
                href="/products"
                className="flex h-12 items-center justify-center rounded-2xl bg-secondary px-8 text-sm font-bold text-white shadow-[0_10px_60px_rgba(37,99,235,0.25)] transition-all duration-300 hover:scale-105 hover:opacity-90 lg:h-14 lg:px-10 lg:text-base"
              >
                Browse Products
              </Link>

              {/* SECONDARY */}
              <Link
                href="/contact"
                className="flex h-12 items-center justify-center rounded-2xl border border-black/10 bg-white/70 px-8 text-sm font-semibold text-gray-900 backdrop-blur-2xl transition-all duration-300 hover:bg-white dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 lg:h-14 lg:px-10 lg:text-base"
              >
                Contact Us
              </Link>
            </div>

            {/* FEATURES */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-5 lg:mt-14 lg:justify-start lg:gap-8">
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="h-3 w-3 rounded-full bg-green-500" />

                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 lg:text-base">
                  Reliable Systems
                </span>
              </div>

              <div className="flex items-center gap-2 lg:gap-3">
                <div className="h-3 w-3 rounded-full bg-blue-500" />

                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 lg:text-base">
                  HD Surveillance
                </span>
              </div>

              <div className="flex items-center gap-2 lg:gap-3">
                <div className="h-3 w-3 rounded-full bg-secondary" />

                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 lg:text-base">
                  24/7 Protection
                </span>
              </div>
            </div>
          </div>

          {/* SEO TEXT */}
          <div className="mt-16 text-center text-2xl font-bold text-gray-900 dark:text-white lg:mt-20 lg:text-3xl">
            <SeoTagText />
          </div>
        </div>
      </div>
    </section>
  );
}
