"use client";

import Link from "next/link";
import { FileCheck, ShieldCheck, AlertTriangle, CreditCard, Wrench, Lock, Mail, Phone } from "lucide-react";

export default function TermsAndConditionsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-linear-to-b from-white to-neutral-50 dark:from-[#050816] dark:to-[#0b1120]">
      {/* Background Glow */}
      <div className="absolute left-1/2 top-20 h-96 w-96 -translate-x-1/2 rounded-full bg-secondary/10 blur-3xl" />

      <section className="relative z-10 mx-auto max-w-5xl px-5 py-20 sm:px-8">
        {/* HEADER */}
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-18 w-18 items-center justify-center rounded-3xl bg-secondary/10">
            <FileCheck className="text-secondary" size={38} />
          </div>

          <h1 className="text-4xl font-black tracking-tight text-neutral-900 dark:text-white sm:text-5xl">Terms & Conditions</h1>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-neutral-600 dark:text-gray-400 sm:text-lg">Please read these Terms & Conditions carefully before using CAMX.lk services, products, and website platforms.</p>

          <p className="mt-4 text-sm text-neutral-500 dark:text-gray-500">Last Updated: June 2026</p>
        </div>

        {/* CONTENT */}
        <div className="mt-16 space-y-8">
          {/* SECTION */}
          <div className="rounded-3xl border border-neutral-200 bg-white/80 p-8 shadow-sm backdrop-blur-xl dark:border-gray-800 dark:bg-[#0f172a]/70">
            <div className="mb-5 flex items-center gap-4">
              <div className="rounded-2xl bg-secondary/10 p-3">
                <ShieldCheck className="text-secondary" size={24} />
              </div>

              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Acceptance of Terms</h2>
            </div>

            <p className="leading-relaxed text-neutral-600 dark:text-gray-400">By accessing or using CAMX.lk services, you agree to comply with and be bound by these Terms & Conditions. If you do not agree with any part of these terms, please refrain from using our services.</p>
          </div>

          {/* SECTION */}
          <div className="rounded-3xl border border-neutral-200 bg-white/80 p-8 shadow-sm backdrop-blur-xl dark:border-gray-800 dark:bg-[#0f172a]/70">
            <div className="mb-5 flex items-center gap-4">
              <div className="rounded-2xl bg-secondary/10 p-3">
                <Wrench className="text-secondary" size={24} />
              </div>

              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Services & Installations</h2>
            </div>

            <div className="space-y-4 text-neutral-600 dark:text-gray-400">
              <p>CAMX.lk provides CCTV surveillance systems, smart security solutions, maintenance services, and related technical support.</p>

              <ul className="list-disc space-y-3 pl-6">
                <li>Installation schedules are subject to availability.</li>
                <li>Customers must provide safe access to installation locations.</li>
                <li>Delays caused by external conditions may affect delivery timelines.</li>
                <li>Unauthorized modifications to installed systems may void service warranties.</li>
              </ul>
            </div>
          </div>

          {/* SECTION */}
          <div className="rounded-3xl border border-neutral-200 bg-white/80 p-8 shadow-sm backdrop-blur-xl dark:border-gray-800 dark:bg-[#0f172a]/70">
            <div className="mb-5 flex items-center gap-4">
              <div className="rounded-2xl bg-secondary/10 p-3">
                <CreditCard className="text-secondary" size={24} />
              </div>

              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Payments & Billing</h2>
            </div>

            <div className="space-y-4 text-neutral-600 dark:text-gray-400">
              <ul className="list-disc space-y-3 pl-6">
                <li>Payments must be completed according to agreed quotations or invoices.</li>
                <li>Deposits may be required before installations or custom orders.</li>
                <li>Late payments may result in temporary suspension of services.</li>
                <li>Prices and service charges are subject to change without prior notice.</li>
              </ul>
            </div>
          </div>

          {/* SECTION */}
          <div className="rounded-3xl border border-neutral-200 bg-white/80 p-8 shadow-sm backdrop-blur-xl dark:border-gray-800 dark:bg-[#0f172a]/70">
            <div className="mb-5 flex items-center gap-4">
              <div className="rounded-2xl bg-secondary/10 p-3">
                <Lock className="text-secondary" size={24} />
              </div>

              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Privacy & Security</h2>
            </div>

            <p className="leading-relaxed text-neutral-600 dark:text-gray-400">CAMX.lk respects customer privacy and applies industry-standard security measures to protect user data. Please review our Privacy Policy for detailed information regarding data collection and protection practices.</p>
          </div>

          {/* SECTION */}
          <div className="rounded-3xl border border-neutral-200 bg-white/80 p-8 shadow-sm backdrop-blur-xl dark:border-gray-800 dark:bg-[#0f172a]/70">
            <div className="mb-5 flex items-center gap-4">
              <div className="rounded-2xl bg-secondary/10 p-3">
                <AlertTriangle className="text-secondary" size={24} />
              </div>

              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Limitation of Liability</h2>
            </div>

            <div className="space-y-4 text-neutral-600 dark:text-gray-400">
              <p>CAMX.lk shall not be held responsible for damages, losses, or interruptions caused by:</p>

              <ul className="list-disc space-y-3 pl-6">
                <li>Internet or electricity failures</li>
                <li>Unauthorized third-party access</li>
                <li>Natural disasters or external incidents</li>
                <li>Improper handling of equipment by customers</li>
              </ul>
            </div>
          </div>

          {/* SECTION */}
          <div className="rounded-3xl border border-neutral-200 bg-white/80 p-8 shadow-sm backdrop-blur-xl dark:border-gray-800 dark:bg-[#0f172a]/70">
            <div className="mb-5 flex items-center gap-4">
              <div className="rounded-2xl bg-secondary/10 p-3">
                <FileCheck className="text-secondary" size={24} />
              </div>

              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Changes to Terms</h2>
            </div>

            <p className="leading-relaxed text-neutral-600 dark:text-gray-400">CAMX.lk reserves the right to update or modify these Terms & Conditions at any time without prior notice. Continued use of our services after changes indicates acceptance of the updated terms.</p>
          </div>

          {/* CONTACT */}
          <div className="rounded-3xl border border-secondary/20 bg-secondary/5 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Contact Information</h2>

            <p className="mt-4 leading-relaxed text-neutral-600 dark:text-gray-400">For questions regarding these Terms & Conditions, please contact our support team.</p>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="text-secondary" size={20} />

                <a href="mailto:info@camx.lk" className="text-neutral-700 hover:text-secondary dark:text-gray-300">
                  info@camx.lk
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="text-secondary" size={20} />

                <a href="tel:+94722400123" className="text-neutral-700 hover:text-secondary dark:text-gray-300">
                  +94 72 240 0123
                </a>
              </div>
            </div>
          </div>

          {/* BACK BUTTON */}
          <div className="pt-4 text-center">
            <Link href="/" className="inline-flex items-center justify-center rounded-2xl bg-secondary px-6 py-3 font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg">
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
