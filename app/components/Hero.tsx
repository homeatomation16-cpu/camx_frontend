"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Camera, Wifi, ChevronRight, Play } from "lucide-react";
import SeoTagText from "./seoTagText";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.65,
    ease: [0.22, 1, 0.36, 1] as const,
    delay,
  },
});

const STATS = [
  { value: "10K+", label: "Systems Installed" },
  { value: "4K", label: "Ultra HD Quality" },
  { value: "24/7", label: "Live Monitoring" },
];

const FEATURES = [
  { icon: Shield, label: "Reliable Systems" },
  { icon: Camera, label: "HD Surveillance" },
  { icon: Wifi, label: "24/7 Protection" },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-16 lg:pt-20">
      {/* BACKGROUND IMAGES */}
      <Image src="/hero-light.png" alt="CAMX CCTV" fill priority quality={80} sizes="50vw" className="object-cover object-center dark:hidden lg:object-right" />

      <Image src="/hero-dark.png" alt="CAMX CCTV" fill priority quality={80} sizes="50vw" className="hidden object-cover object-center dark:block lg:object-right" />

      {/* OVERLAYS */}
      <div className="absolute inset-0 bg-white/50 dark:bg-black/75" />

      <div className="absolute inset-0 bg-linear-to-r from-white via-white/95 to-white/10 dark:from-black dark:via-black/85 dark:to-black/5" />

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-linear-to-t from-white dark:from-background to-transparent" />

      {/* DECORATIVE GRID */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage: "linear-gradient(0deg, transparent 24%, #000 25%, #000 26%, transparent 27%), linear-gradient(90deg, transparent 24%, #000 25%, #000 26%, transparent 27%)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* CONTENT */}
      <div className="relative flex min-h-screen items-center">
        <div className="mx-auto w-full max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            {/* BADGE */}
            <motion.div {...fadeUp(0.05)} className="mb-7">
              <span className="inline-flex items-center gap-2.5 rounded-full border border-secondary/25 bg-secondary/8 px-4 py-2 backdrop-blur-md dark:bg-secondary/10">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
                </span>

                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-secondary">Smart Security Solutions</span>
              </span>
            </motion.div>

            {/* TITLE */}
            <motion.h1 {...fadeUp(0.12)} className="max-w-3xl text-5xl font-black leading-[1.07] tracking-tight text-neutral-900 dark:text-white lg:text-7xl xl:text-8xl">
              Smart CCTV
              <br />
              <span className="text-secondary">Security</span>
              <span className="text-neutral-300 dark:text-neutral-700">.</span>
            </motion.h1>

            {/* DESCRIPTION */}
            <motion.p {...fadeUp(0.2)} className="mt-6 max-w-xl text-base leading-7 text-neutral-600 dark:text-neutral-400 lg:text-lg lg:leading-8">
              Professional surveillance systems for homes, offices, and enterprise environments across Sri Lanka.
            </motion.p>

            {/* BUTTONS */}
            <motion.div {...fadeUp(0.28)} className="mt-10 flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <Link href="/products" className="group flex h-13 items-center justify-center gap-2.5 rounded-2xl bg-secondary px-8 text-sm font-bold text-white shadow-[0_8px_48px_rgba(37,99,235,0.3)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_12px_56px_rgba(37,99,235,0.4)] lg:h-14 lg:px-10 lg:text-[15px]">
                Browse Products
                <ChevronRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>

              <Link href="/contact" className="flex h-13 items-center justify-center gap-2.5 rounded-2xl border border-neutral-200 bg-white/80 px-8 text-sm font-semibold text-neutral-800 backdrop-blur-xl transition-all duration-300 hover:bg-white dark:border-white/15 dark:bg-white/8 dark:text-white dark:hover:bg-white/15 lg:h-14 lg:px-10 lg:text-[15px]">
                <Play size={13} className="fill-current" />
                Contact Us
              </Link>
            </motion.div>

            {/* STATS */}
            <motion.div {...fadeUp(0.36)} className="mt-12 flex flex-wrap items-center justify-center gap-px overflow-hidden rounded-2xl border border-neutral-200/70 bg-neutral-200/70 dark:border-white/10 dark:bg-white/10 lg:justify-start">
              {STATS.map(({ value, label }, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5 bg-white/90 px-6 py-4 backdrop-blur-md dark:bg-neutral-900/80 lg:items-start">
                  <span className="text-xl font-black text-secondary lg:text-2xl">{value}</span>

                  <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">{label}</span>
                </div>
              ))}
            </motion.div>

            {/* FEATURES */}
            <motion.div {...fadeUp(0.44)} className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start lg:gap-6">
              {FEATURES.map(({ icon: Icon, label }, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-secondary/10">
                    <Icon size={13} className="text-secondary" />
                  </div>

                  <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* SEO TEXT */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: 0.7,
              duration: 0.6,
            }}
            className="mt-20 text-center text-2xl font-bold text-neutral-900 dark:text-white lg:mt-24 lg:text-3xl"
          >
            <SeoTagText />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
