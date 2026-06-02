"use client";

import Link from "next/link";
import { ShieldCheck, Lock, Eye, Database, Mail, Phone, FileText } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-linear-to-b from-white to-neutral-50 dark:from-[#050816] dark:to-[#0b1120]">
      {/* Background Glow */}
      <div className="absolute left-1/2 top-20 h-96 w-96 -translate-x-1/2 rounded-full bg-secondary/10 blur-3xl" />

      <section className="relative z-10 mx-auto max-w-5xl px-5 py-20 sm:px-8">
        {/* HEADER */}
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-18 w-18 items-center justify-center rounded-3xl bg-secondary/10">
            <ShieldCheck className="text-secondary" size={38} />
          </div>

          <h1 className="text-4xl font-black tracking-tight text-neutral-900 dark:text-white sm:text-5xl">Privacy Policy</h1>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-neutral-600 dark:text-gray-400 sm:text-lg">CAMX.lk is committed to protecting your personal information and ensuring transparency in how your data is collected, used, and protected across our security and surveillance services.</p>

          <p className="mt-4 text-sm text-neutral-500 dark:text-gray-500">Last Updated: June 2026</p>
        </div>

        {/* CONTENT */}
        <div className="mt-16 space-y-8">
          {/* SECTION */}
          <div className="rounded-3xl border border-neutral-200 bg-white/80 p-8 shadow-sm backdrop-blur-xl dark:border-gray-800 dark:bg-[#0f172a]/70">
            <div className="mb-5 flex items-center gap-4">
              <div className="rounded-2xl bg-secondary/10 p-3">
                <Database className="text-secondary" size={24} />
              </div>

              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Information We Collect</h2>
            </div>

            <div className="space-y-4 text-neutral-600 dark:text-gray-400">
              <p>We may collect personal and technical information when you use our website, contact our team, or purchase our products and services.</p>

              <ul className="list-disc space-y-3 pl-6">
                <li>Full name and company information</li>
                <li>Email address and phone number</li>
                <li>Installation addresses and project details</li>
                <li>Device usage and browsing information</li>
                <li>Payment and transaction information</li>
              </ul>
            </div>
          </div>

          {/* SECTION */}
          <div className="rounded-3xl border border-neutral-200 bg-white/80 p-8 shadow-sm backdrop-blur-xl dark:border-gray-800 dark:bg-[#0f172a]/70">
            <div className="mb-5 flex items-center gap-4">
              <div className="rounded-2xl bg-secondary/10 p-3">
                <Eye className="text-secondary" size={24} />
              </div>

              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">How We Use Your Information</h2>
            </div>

            <div className="space-y-4 text-neutral-600 dark:text-gray-400">
              <p>Your information is used to:</p>

              <ul className="list-disc space-y-3 pl-6">
                <li>Provide CCTV and security solutions</li>
                <li>Process orders and service requests</li>
                <li>Improve customer support experience</li>
                <li>Send updates regarding installations and maintenance</li>
                <li>Enhance website performance and security</li>
              </ul>
            </div>
          </div>

          {/* SECTION */}
          <div className="rounded-3xl border border-neutral-200 bg-white/80 p-8 shadow-sm backdrop-blur-xl dark:border-gray-800 dark:bg-[#0f172a]/70">
            <div className="mb-5 flex items-center gap-4">
              <div className="rounded-2xl bg-secondary/10 p-3">
                <Lock className="text-secondary" size={24} />
              </div>

              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Data Protection & Security</h2>
            </div>

            <div className="space-y-4 text-neutral-600 dark:text-gray-400">
              <p>We implement industry-standard security measures to protect your personal information from unauthorized access, misuse, or data breaches.</p>

              <ul className="list-disc space-y-3 pl-6">
                <li>Secure encrypted communication channels</li>
                <li>Protected cloud storage and backups</li>
                <li>Limited staff access to sensitive information</li>
                <li>Regular security monitoring and updates</li>
              </ul>
            </div>
          </div>

          {/* SECTION */}
          <div className="rounded-3xl border border-neutral-200 bg-white/80 p-8 shadow-sm backdrop-blur-xl dark:border-gray-800 dark:bg-[#0f172a]/70">
            <div className="mb-5 flex items-center gap-4">
              <div className="rounded-2xl bg-secondary/10 p-3">
                <FileText className="text-secondary" size={24} />
              </div>

              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Third-Party Services</h2>
            </div>

            <div className="space-y-4 text-neutral-600 dark:text-gray-400">
              <p>CAMX.lk may use trusted third-party services such as payment gateways, analytics providers, and cloud platforms to improve our services.</p>

              <p>These providers only receive the minimum information necessary to perform their services securely and responsibly.</p>
            </div>
          </div>

          {/* SECTION */}
          <div className="rounded-3xl border border-neutral-200 bg-white/80 p-8 shadow-sm backdrop-blur-xl dark:border-gray-800 dark:bg-[#0f172a]/70">
            <div className="mb-5 flex items-center gap-4">
              <div className="rounded-2xl bg-secondary/10 p-3">
                <ShieldCheck className="text-secondary" size={24} />
              </div>

              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Your Rights</h2>
            </div>

            <div className="space-y-4 text-neutral-600 dark:text-gray-400">
              <p>You have the right to:</p>

              <ul className="list-disc space-y-3 pl-6">
                <li>Request access to your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Withdraw marketing communication consent</li>
              </ul>
            </div>
          </div>

          {/* CONTACT */}
          <div className="rounded-3xl border border-secondary/20 bg-secondary/5 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Contact Us</h2>

            <p className="mt-4 leading-relaxed text-neutral-600 dark:text-gray-400">If you have questions regarding this Privacy Policy or your data, please contact our support team.</p>

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
