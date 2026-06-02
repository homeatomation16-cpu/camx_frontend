"use client";

import Link from "next/link";
import { motion, type Transition } from "framer-motion";
import { Camera, ShieldCheck, MonitorSmartphone, Building2, Wrench, Cpu, ArrowRight } from "lucide-react";

const transition: Transition = {
  duration: 0.55,
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: {
    ...transition,
    delay,
  },
});

const SERVICES = [
  {
    slug: "cctv-installation",
    icon: Camera,
    title: "CCTV Camera Installation",
    description: "Professional HD and AI-powered CCTV camera installations for homes, offices, shops, and warehouses.",
    accent: "#3b82f6",
  },
  {
    slug: "remote-monitoring",
    icon: MonitorSmartphone,
    title: "Remote Monitoring Solutions",
    description: "Monitor your property remotely using mobile apps and smart cloud-enabled surveillance systems.",
    accent: "#8b5cf6",
  },
  {
    slug: "smart-security",
    icon: ShieldCheck,
    title: "Smart Security Systems",
    description: "Integrated alarm systems, motion detection, smart sensors, and real-time security alerts.",
    accent: "#22c55e",
  },
  {
    slug: "enterprise-security",
    icon: Building2,
    title: "Enterprise Security",
    description: "Customized enterprise-grade surveillance and access control systems for industrial environments.",
    accent: "#f97316",
  },
  {
    slug: "maintenance-support",
    icon: Wrench,
    title: "Maintenance & Support",
    description: "Routine maintenance, troubleshooting, software updates, and technical assistance for security systems.",
    accent: "#ec4899",
  },
  {
    slug: "access-control",
    icon: Cpu,
    title: "Access Control & Automation",
    description: "Biometric access systems, smart door locks, attendance systems, and security automation solutions.",
    accent: "#06b6d4",
  },
];

export default function ServicesPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white dark:bg-background">
      {/* BG BLOBS */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-150 w-150 -translate-x-1/2 rounded-full bg-secondary/6 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-80 w-80 rounded-full bg-blue-400/5 blur-3xl" />
        <div className="absolute -left-40 bottom-1/4 h-80 w-80 rounded-full bg-purple-400/5 blur-3xl" />
      </div>

      <section className="relative isolate z-10 mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:py-32">
        {/* HERO */}
        <div className="mb-20 text-center">
          <motion.div {...fadeUp(0)}>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/10 ring-1 ring-secondary/20">
              <ShieldCheck className="text-secondary" size={32} />
            </div>
          </motion.div>
          <motion.h1 {...fadeUp(0.14)} className="mt-4 text-4xl font-black text-neutral-900 dark:text-white sm:text-5xl lg:text-6xl">
            Our Services
          </motion.h1>
        </div>

        {/* SERVICES GRID */}
        <div className="mb-24 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {SERVICES.map((service, i) => {
            const Icon = service.icon;
            return (
              <Link href={`/services/${service.slug}`} key={i} className="group h-full">
                <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ delay: i * 0.07, duration: 0.5 }} className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white p-7 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-secondary/40 hover:shadow-xl dark:border-border dark:bg-[#0f172a]/80">
                  {/* TOP LIGHT */}
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-white/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  {/* GLOW */}
                  <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" style={{ background: service.accent }} />

                  {/* ICON */}
                  <div
                    className="relative mb-5 flex h-13 w-13 items-center justify-center rounded-2xl border transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: `${service.accent}15`,
                      color: service.accent,
                      borderColor: `${service.accent}30`,
                    }}
                  >
                    <Icon size={24} />
                  </div>

                  <h2 className="relative mb-3 text-lg font-black text-neutral-900 group-hover:text-secondary dark:text-white">{service.title}</h2>
                  <p className="relative text-sm leading-7 text-neutral-500 dark:text-neutral-400">{service.description}</p>

                  <div className="mt-auto flex items-center gap-1.5 pt-6 text-xs font-bold text-secondary opacity-0 transition-all duration-300 group-hover:opacity-100">
                    Learn more <ArrowRight size={12} />
                  </div>

                  {/* BOTTOM ACCENT */}
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full" style={{ background: service.accent }} />
                </motion.div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
