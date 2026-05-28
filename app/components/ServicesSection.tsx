"use client";

import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

/* ---------------- TYPES ---------------- */

export type Service = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

type SectionProps = {
  title: string;
  subtitle: string;
  services: Service[];
};

type ServiceCardProps = {
  service: Service;
};

type TiltCardProps = {
  children: ReactNode;
};

/* ---------------- ANIMATIONS ---------------- */

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
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
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

/* ---------------- MAIN SECTION ---------------- */

export default function ServicesSection({
  SECURITY_SERVICES,
  IT_SERVICES,
  MOBILE_SERVICES,
}: {
  SECURITY_SERVICES: Service[];
  IT_SERVICES: Service[];
  MOBILE_SERVICES: Service[];
}) {
  return (
    <section className="relative overflow-hidden py-28 px-6 bg-background">
      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/3 h-105 w-105 rounded-full bg-secondary/10 blur-3xl" />

        <div className="absolute bottom-0 right-0 h-75 w-75 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        {/* 🔐 SECURITY SECTION */}
        <Section
          title="Security & CCTV Installation Services in Sri Lanka"
          subtitle="Professional surveillance and protection solutions"
          services={SECURITY_SERVICES}
        />

        {/* INTERNAL LINKS */}
        <div className="mb-24 text-center text-sm text-foreground/60 leading-8">
          CCTV installation areas we serve:&nbsp;
          {[
            {
              name: "Colombo",
              href: "/services/cctv-installation-colombo",
            },
            {
              name: "Piliyandala",
              href: "/services/cctv-installation-piliyandala",
            },
            {
              name: "Kesbewa",
              href: "/services/cctv-installation-kesbewa",
            },
            {
              name: "Boralesgamuwa",
              href: "/services/cctv-installation-boralesgamuwa",
            },
            {
              name: "Horana",
              href: "/services/cctv-installation-horana",
            },
            {
              name: "Bandaragama",
              href: "/services/cctv-installation-bandaragama",
            },
          ].map((city, index) => (
            <span key={city.name}>
              <a
                href={city.href}
                className="text-secondary hover:text-accent transition-colors duration-300 hover:underline"
              >
                {city.name}
              </a>

              {index !== 5 && ", "}
            </span>
          ))}
        </div>

        {/* 💻 IT SECTION */}
        <Section
          title="IT & Computer Repair Services"
          subtitle="Reliable computer and software support"
          services={IT_SERVICES}
        />

        {/* 📱 MOBILE SECTION */}
        <Section
          title="Mobile Repair Services"
          subtitle="Smartphone display and touch repairs"
          services={MOBILE_SERVICES}
        />

        <p className="mt-20 text-center text-sm text-amber-500">
          Mobile services currently include display replacement only.
        </p>
      </motion.div>
    </section>
  );
}

/* ---------------- SECTION COMPONENT ---------------- */

function Section({ title, subtitle, services }: SectionProps) {
  return (
    <div className="mb-28">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{
          duration: 0.6,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        className="mb-14 text-center"
      >
        <div className="inline-flex items-center rounded-full border border-secondary/20 bg-secondary/5 px-5 py-2 mb-5">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">
            CAMX Secure
          </span>
        </div>

        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
          {title}
        </h2>

        <p className="mt-4 max-w-2xl mx-auto text-foreground/65 text-base md:text-lg leading-relaxed">
          {subtitle}
        </p>
      </motion.div>

      {/* GRID */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
      >
        {services.map((service) => (
          <ServiceCard key={service.title} service={service} />
        ))}
      </motion.div>
    </div>
  );
}

/* ---------------- SERVICE CARD ---------------- */

function ServiceCard({ service }: ServiceCardProps) {
  const Icon = service.icon;

  return (
    <TiltCard>
      <motion.div
        variants={cardVariants}
        className="
          group
          relative
          overflow-hidden
          rounded-3xl
          border
          border-border
          bg-card/80
          backdrop-blur-xl
          p-8
          transition-all
          duration-500
          hover:-translate-y-1
          hover:border-secondary/40
          hover:shadow-[0_20px_60px_-15px_rgba(21,66,245,0.25)]
        "
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* TOP GLOW */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute top-0 left-0 h-40 w-40 rounded-full bg-secondary/10 blur-3xl" />
        </div>

        {/* ICON */}
        <motion.div
          style={{
            transform: "translateZ(40px)",
          }}
          className="
            relative
            z-10
            mb-6
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            bg-secondary/10
            text-secondary
            border
            border-secondary/20
          "
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: [0.42, 0, 0.58, 1],
          }}
        >
          <Icon className="h-8 w-8" />
        </motion.div>

        {/* TITLE */}
        <h3
          className="
            relative
            z-10
            mb-4
            text-2xl
            font-bold
            tracking-tight
            text-foreground
            group-hover:text-secondary
            transition-colors
            duration-300
          "
          style={{
            transform: "translateZ(30px)",
          }}
        >
          {service.title}
        </h3>

        {/* DESCRIPTION */}
        <p
          className="
            relative
            z-10
            leading-relaxed
            text-sm
            md:text-base
            text-foreground/70
          "
          style={{
            transform: "translateZ(20px)",
          }}
        >
          {service.description}
        </p>
      </motion.div>
    </TiltCard>
  );
}

/* ---------------- TILT CARD ---------------- */

function TiltCard({ children }: TiltCardProps) {
  return (
    <div
      className="
        transform-gpu
        transition-transform
        duration-300
        hover:-translate-y-2
      "
      style={{
        perspective: "1200px",
      }}
    >
      {children}
    </div>
  );
}
