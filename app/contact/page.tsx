"use client";

import Head from "next/head";

import { motion } from "framer-motion";

import { Mail, MapPin, Phone, Clock3, ShieldCheck } from "lucide-react";

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
            rotateX(${-y / 18}deg)
            rotateY(${x / 18}deg)
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

export default function ContactPage() {
  return (
    <>
      <Head>
        <title>Contact Us | CAMX.lk</title>

        <meta name="description" content="Contact CAMX.lk for CCTV installation, surveillance systems and smart security solutions across Sri Lanka." />
      </Head>

      <div className="relative min-h-screen overflow-hidden bg-background text-foreground pt-20">
        {/* GLOW EFFECTS */}

        <div className="absolute top-0 left-1/4 w-125 h-125 bg-secondary/20 blur-[140px] rounded-full" />

        <div className="absolute bottom-0 right-1/4 w-125 h-125 bg-green/20 blur-[140px] rounded-full" />

        {/* GRID EFFECT */}

        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-size-[70px_70px]" />

        <main className="relative z-10">
          {/* HERO SECTION */}

          <motion.section variants={fadeUp} initial="hidden" animate="show" className="max-w-7xl mx-auto px-6 py-24 text-center">
            {/* BADGE */}

            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-secondary/30 bg-secondary/10 backdrop-blur-xl mb-8">
              <ShieldCheck className="text-secondary" size={18} />

              <span className="text-secondary uppercase tracking-[0.3em] text-xs font-black">Contact CAMX.lk</span>
            </div>

            {/* TITLE */}

            <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
              Smart Security
              <span className="text-secondary"> Solutions</span>
            </h1>

            {/* DESCRIPTION */}

            <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-neutral-600 dark:text-gray-400 leading-8">Contact CAMX.lk for professional CCTV installation, smart surveillance systems, security cameras and enterprise-grade protection services across Sri Lanka.</p>
          </motion.section>

          {/* MAIN CONTENT */}

          <motion.section variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="max-w-7xl mx-auto px-6 pb-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* LEFT SIDE */}

              <motion.div variants={fadeUp}>
                <TiltCard>
                  <div
                    className="relative h-full rounded-3xl border border-border bg-card/70 backdrop-blur-2xl p-8 shadow-2xl overflow-hidden"
                    style={{
                      transform: "translateZ(20px)",
                    }}
                  >
                    {/* INNER GLOW */}

                    <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/10 blur-3xl rounded-full" />

                    <div className="relative z-10">
                      <h2 className="text-3xl font-black mb-4">Get In Touch</h2>

                      <p className="text-neutral-600 dark:text-gray-400 leading-7 mb-10">Have questions about CCTV systems, surveillance cameras or installation services? Our team is ready to help.</p>

                      {/* CONTACT ITEMS */}

                      <div className="space-y-6">
                        {/* ADDRESS */}

                        <div className="flex items-start gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                            <MapPin className="text-secondary" size={22} />
                          </div>

                          <div>
                            <h3 className="font-bold text-lg">Address</h3>

                            <p className="text-neutral-600 dark:text-gray-400">Colombo, Sri Lanka</p>
                          </div>
                        </div>

                        {/* PHONE */}

                        <div className="flex items-start gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                            <Phone className="text-secondary" size={22} />
                          </div>

                          <div>
                            <h3 className="font-bold text-lg">Phone</h3>

                            <a href="tel:+94772400123" className="text-neutral-600 dark:text-gray-400 hover:text-secondary transition">
                              +94 77 240 0123
                            </a>
                          </div>
                        </div>

                        {/* EMAIL */}

                        <div className="flex items-start gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                            <Mail className="text-secondary" size={22} />
                          </div>

                          <div>
                            <h3 className="font-bold text-lg">Email</h3>

                            <a href="mailto:info@camx.lk" className="text-neutral-600 dark:text-gray-400 hover:text-secondary transition">
                              info@camx.lk
                            </a>
                          </div>
                        </div>

                        {/* WORKING HOURS */}

                        <div className="flex items-start gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
                            <Clock3 className="text-secondary" size={22} />
                          </div>

                          <div>
                            <h3 className="font-bold text-lg">Working Hours</h3>

                            <p className="text-neutral-600 dark:text-gray-400">Monday - Saturday : 8.00 AM - 8.00 PM</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>

              {/* RIGHT SIDE */}

              <motion.div variants={fadeUp}>
                <TiltCard>
                  <div
                    className="relative rounded-3xl border border-border bg-card/70 backdrop-blur-2xl p-8 shadow-2xl overflow-hidden"
                    style={{
                      transform: "translateZ(20px)",
                    }}
                  >
                    {/* INNER GLOW */}

                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-green/10 blur-3xl rounded-full" />

                    <div className="relative z-10">
                      <h2 className="text-3xl font-black mb-4">Send Message</h2>

                      <p className="text-neutral-600 dark:text-gray-400 mb-8">Fill out the form below and our team will contact you shortly.</p>

                      {/* FORM */}

                      <form className="space-y-5">
                        {/* NAME */}

                        <input type="text" placeholder="Full Name" className="w-full px-5 py-4 rounded-2xl bg-background/70 border border-border outline-none focus:border-secondary transition" />

                        {/* EMAIL */}

                        <input type="email" placeholder="Email Address" className="w-full px-5 py-4 rounded-2xl bg-background/70 border border-border outline-none focus:border-secondary transition" />

                        {/* PHONE */}

                        <input type="tel" placeholder="Phone Number" className="w-full px-5 py-4 rounded-2xl bg-background/70 border border-border outline-none focus:border-secondary transition" />

                        {/* MESSAGE */}

                        <textarea rows={6} placeholder="Your Message" className="w-full px-5 py-4 rounded-2xl bg-background/70 border border-border outline-none focus:border-secondary transition resize-none" />

                        {/* BUTTON */}

                        <button type="submit" className="w-full py-4 rounded-2xl bg-secondary text-white font-bold shadow-xl hover:scale-[1.02] hover:bg-secondary/90 transition-all duration-300">
                          Send Message
                        </button>
                      </form>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            </div>
          </motion.section>
        </main>
      </div>
    </>
  );
}
