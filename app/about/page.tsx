"use client";

import Head from "next/head";
import Link from "next/link";

import { motion } from "framer-motion";

import { ShieldCheck, BadgeCheck, LockKeyhole, Cpu, Headphones, Building2 } from "lucide-react";

/* ---------------- ANIMATIONS ---------------- */

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 40,
  },

  show: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

const stagger = {
  hidden: {},

  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

/* ---------------- 3D TILT CARD ---------------- */

function TiltCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ perspective: 1200 }}>
      <motion.div
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();

          const x = e.clientX - rect.left - rect.width / 2;

          const y = e.clientY - rect.top - rect.height / 2;

          e.currentTarget.style.transform = `
            rotateX(${-y / 20}deg)
            rotateY(${x / 20}deg)
          `;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "rotateX(0deg) rotateY(0deg)";
        }}
        className="transition-transform duration-300"
        style={{ transformStyle: "preserve-3d" }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ---------------- PAGE ---------------- */

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About Us | CAMX.lk</title>

        <meta name="description" content="Learn more about CAMX.lk, Sri Lanka’s trusted provider of smart CCTV surveillance and professional security solutions." />
      </Head>

      <main className="relative min-h-screen overflow-hidden bg-background text-foreground pt-20">
        {/* GLOW EFFECTS */}

        <div className="absolute top-0 left-1/4 w-125 h-125 bg-secondary/20 blur-[140px] rounded-full" />

        <div className="absolute bottom-0 right-1/4 w-125 h-125 bg-green/20 blur-[140px] rounded-full" />

        {/* GRID EFFECT */}

        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-size-[70px_70px]" />

        <div className="relative z-10">
          {/* HERO */}

          <motion.section variants={fadeUp} initial="hidden" animate="show" className="max-w-7xl mx-auto px-6 py-24 text-center">
            {/* BADGE */}

            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-secondary/30 bg-secondary/10 backdrop-blur-xl mb-8">
              <ShieldCheck className="text-secondary" size={18} />

              <span className="text-secondary uppercase tracking-[0.3em] text-xs font-black">About CAMX.lk</span>
            </div>

            {/* TITLE */}

            <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
              Smart Security
              <span className="text-secondary"> Experts</span>
            </h1>

            {/* DESCRIPTION */}

            <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-neutral-600 dark:text-gray-400 leading-8">CAMX.lk is a trusted provider of professional CCTV, surveillance and smart security solutions designed for homes, offices, shops and enterprise environments across Sri Lanka.</p>
          </motion.section>

          {/* CONTENT */}

          <motion.section variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="max-w-7xl mx-auto px-6 pb-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* WHO WE ARE */}

              <motion.div variants={fadeUp}>
                <TiltCard>
                  <div
                    className="relative h-full rounded-3xl border border-border bg-card/70 backdrop-blur-2xl p-8 shadow-2xl overflow-hidden"
                    style={{
                      transform: "translateZ(20px)",
                    }}
                  >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/10 blur-3xl rounded-full" />

                    <div className="relative z-10">
                      <div className="w-16 h-16 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mb-6">
                        <Building2 className="text-secondary" size={28} />
                      </div>

                      <h2 className="text-3xl font-black mb-6">Who We Are</h2>

                      <p className="text-neutral-600 dark:text-gray-400 leading-8 text-lg">CAMX.lk specializes in advanced CCTV surveillance systems, smart security technologies and enterprise-grade protection solutions.</p>

                      <p className="mt-5 text-neutral-600 dark:text-gray-400 leading-8 text-lg">With years of industry experience, our mission is to deliver reliable, modern and affordable security systems backed by professional installation and long-term technical support.</p>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>

              {/* OUR MISSION */}

              <motion.div variants={fadeUp}>
                <TiltCard>
                  <div
                    className="relative h-full rounded-3xl border border-border bg-card/70 backdrop-blur-2xl p-8 shadow-2xl overflow-hidden"
                    style={{
                      transform: "translateZ(20px)",
                    }}
                  >
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-green/10 blur-3xl rounded-full" />

                    <div className="relative z-10">
                      <div className="w-16 h-16 rounded-2xl bg-green/10 border border-green/20 flex items-center justify-center mb-6">
                        <LockKeyhole className="text-green" size={28} />
                      </div>

                      <h2 className="text-3xl font-black mb-6">Our Mission</h2>

                      <p className="text-neutral-600 dark:text-gray-400 leading-8 text-lg">Our mission is to make homes, businesses and workplaces safer through intelligent security technologies and innovative surveillance systems.</p>

                      <p className="mt-5 text-neutral-600 dark:text-gray-400 leading-8 text-lg">We focus on delivering quality, reliability and customer satisfaction through modern technology and expert service.</p>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            </div>

            {/* FEATURES */}

            <motion.div variants={fadeUp} className="mt-12">
              <TiltCard>
                <div
                  className="relative rounded-3xl border border-border bg-card/70 backdrop-blur-2xl p-8 shadow-2xl overflow-hidden"
                  style={{
                    transform: "translateZ(20px)",
                  }}
                >
                  <div className="absolute top-1/2 left-1/2 w-80 h-80 -translate-x-1/2 -translate-y-1/2 bg-secondary/10 blur-[120px] rounded-full" />

                  <div className="relative z-10">
                    <h2 className="text-3xl font-black mb-10 text-center">Why Choose CAMX.lk</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FeatureCard icon={<BadgeCheck size={26} />} title="Professional Installation" desc="Experienced technicians ensure clean and reliable installations." />

                      <FeatureCard icon={<Cpu size={26} />} title="Latest Technology" desc="Modern CCTV systems with smart surveillance features." />

                      <FeatureCard icon={<ShieldCheck size={26} />} title="Reliable Security" desc="Stable and long-lasting security solutions for every environment." />

                      <FeatureCard icon={<Headphones size={26} />} title="Customer Support" desc="Friendly technical support and after-sales service." />
                    </div>
                  </div>
                </div>
              </TiltCard>
            </motion.div>

            {/* CTA */}

            <motion.div variants={fadeUp} className="mt-16">
              <div className="relative overflow-hidden rounded-4xl border border-border bg-card/70 backdrop-blur-2xl p-12 text-center shadow-2xl">
                <div className="absolute inset-0 bg-linear-to-r from-secondary/10 to-green/10" />

                <div className="relative z-10">
                  <h2 className="text-4xl font-black">Ready To Secure Your Property?</h2>

                  <p className="mt-5 max-w-2xl mx-auto text-lg text-neutral-600 dark:text-gray-400 leading-8">Contact CAMX.lk today and discover professional surveillance systems built for modern security needs.</p>

                  <Link href="/contact" className="inline-flex items-center justify-center mt-10 px-10 py-4 rounded-2xl bg-secondary text-white text-lg font-bold shadow-xl hover:scale-105 hover:bg-secondary/90 transition-all duration-300">
                    Contact Us
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.section>
        </div>
      </main>
    </>
  );
}

/* ---------------- FEATURE CARD ---------------- */

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-border bg-background/50 p-6 hover:border-secondary/40 transition-all duration-300">
      <div className="w-14 h-14 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary mb-5">{icon}</div>

      <h3 className="text-xl font-bold mb-3">{title}</h3>

      <p className="text-neutral-600 dark:text-gray-400 leading-7">{desc}</p>
    </div>
  );
}
