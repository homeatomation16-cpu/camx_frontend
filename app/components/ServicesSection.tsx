"use client";

import { motion, Variants } from "framer-motion";

import {
  Shield,
  Camera,
  Wrench,
  Monitor,
  Smartphone,
  Lock,
} from "lucide-react";

/* ---------------- TYPES ---------------- */

type Service = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

/* ---------------- SERVICES ---------------- */

const SECURITY_SERVICES: Service[] = [
  {
    title: "CCTV Installation",
    description:
      "Professional CCTV camera installation for homes, offices and shops.",
    icon: Camera,
  },

  {
    title: "Access Control",
    description:
      "Smart door access systems with fingerprint and card technology.",
    icon: Lock,
  },

  {
    title: "Security Consultation",
    description: "Advanced security planning and surveillance solutions.",
    icon: Shield,
  },
];

const IT_SERVICES: Service[] = [
  {
    title: "PC Repair",
    description: "Computer troubleshooting, hardware repair and upgrades.",
    icon: Monitor,
  },

  {
    title: "System Maintenance",
    description: "Regular maintenance services for better performance.",
    icon: Wrench,
  },
];

const MOBILE_SERVICES: Service[] = [
  {
    title: "Display Replacement",
    description: "Broken screen and touch replacement for smartphones.",
    icon: Smartphone,
  },
];

/* ---------------- ANIMATION ---------------- */

const containerVariants: Variants = {
  hidden: {},

  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
  },

  show: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* ---------------- MAIN ---------------- */

export default function ServicesSection() {
  return (
    <section className="relative overflow-hidden bg-background py-24 lg:py-32">
      {/* BG */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-0 h-87.5 w-87.5 rounded-full bg-secondary/10 blur-3xl" />

        <div className="absolute bottom-0 right-0 h-87.5 w-87.5 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 lg:px-8">
        {/* SECURITY */}
        <Section
          title="Security & CCTV Installation Services"
          subtitle="Professional surveillance and protection solutions."
          services={SECURITY_SERVICES}
        />

        {/* INTERNAL LINKS */}
        <div className="mb-28 text-center text-sm text-foreground/60">
          CCTV installation areas we serve:&nbsp;
          {[
            "Colombo",
            "Piliyandala",
            "Kesbewa",
            "Boralesgamuwa",
            "Horana",
            "Bandaragama",
          ].map((city, index) => (
            <span key={city}>
              <a
                href={`/services/${city.toLowerCase()}`}
                className="font-medium text-secondary hover:text-accent transition"
              >
                {city}
              </a>

              {index !== 5 && ", "}
            </span>
          ))}
        </div>

        {/* IT */}
        <Section
          title="IT & Computer Repair Services"
          subtitle="Reliable computer repair and support."
          services={IT_SERVICES}
        />

        {/* MOBILE */}
        <Section
          title="Mobile Repair Services"
          subtitle="Professional smartphone repair services."
          services={MOBILE_SERVICES}
        />
      </div>
    </section>
  );
}

/* ---------------- SECTION ---------------- */

function Section({
  title,
  subtitle,
  services,
}: {
  title: string;
  subtitle: string;
  services: Service[];
}) {
  return (
    <div className="mb-32">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-16 text-center"
      >
        <div className="mb-5 inline-flex rounded-full border border-secondary/20 bg-secondary/5 px-5 py-2">
          <span className="text-xs font-bold uppercase tracking-[0.28em] text-secondary">
            CAMX Secure
          </span>
        </div>

        <h2 className="text-4xl font-black tracking-tight text-foreground lg:text-5xl">
          {title}
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-foreground/60 lg:text-lg">
          {subtitle}
        </p>
      </motion.div>

      {/* GRID */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid gap-7 md:grid-cols-2 xl:grid-cols-3"
      >
        {services.map((service) => (
          <ServiceCard key={service.title} service={service} />
        ))}
      </motion.div>
    </div>
  );
}

/* ---------------- CARD ---------------- */

function ServiceCard({ service }: { service: Service }) {
  const Icon = service.icon;

  return (
    <motion.div
      variants={cardVariants}
      className="
        group
        relative
        overflow-hidden
        rounded-3xl
        border
        border-neutral-200
        dark:border-border
        bg-card
        p-8
        transition-all
        duration-500
        hover:-translate-y-2
        hover:border-secondary/30
        hover:shadow-[0_20px_80px_-20px_rgba(21,66,245,0.25)]
      "
    >
      {/* GLOW */}
      <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
        <div className="absolute left-0 top-0 h-40 w-40 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      {/* ICON */}
      <div className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
        <Icon className="h-8 w-8" />
      </div>

      {/* TITLE */}
      <h3 className="relative z-10 mb-4 text-2xl font-bold text-foreground transition group-hover:text-secondary">
        {service.title}
      </h3>

      {/* DESC */}
      <p className="relative z-10 leading-7 text-foreground/65">
        {service.description}
      </p>

      {/* BAR */}
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-secondary transition-all duration-500 group-hover:w-full" />
    </motion.div>
  );
}
