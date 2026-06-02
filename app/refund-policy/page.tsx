"use client";

import Link from "next/link";
import { RotateCcw, CreditCard, ShieldCheck, AlertTriangle, PackageCheck, Mail, Phone } from "lucide-react";

export default function RefundPolicyPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-linear-to-b from-white to-neutral-50 dark:from-[#050816] dark:to-[#0b1120]">
      {/* Background Glow */}
      <div className="absolute left-1/2 top-20 h-96 w-96 -translate-x-1/2 rounded-full bg-secondary/10 blur-3xl" />

      <section className="relative z-10 mx-auto max-w-5xl px-5 py-20 sm:px-8">
        {/* HEADER */}
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-18 w-18 items-center justify-center rounded-3xl bg-secondary/10">
            <RotateCcw className="text-secondary" size={38} />
          </div>

          <h1 className="text-4xl font-black tracking-tight text-neutral-900 dark:text-white sm:text-5xl">Refund Policy</h1>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-neutral-600 dark:text-gray-400 sm:text-lg">At CAMX.lk, customer satisfaction is important to us. This Refund Policy explains the conditions under which refunds, cancellations, and returns may be processed.</p>

          <p className="mt-4 text-sm text-neutral-500 dark:text-gray-500">Last Updated: June 2026</p>
        </div>

        {/* CONTENT */}
        <div className="mt-16 space-y-8">
          {/* SECTION */}
          <div className="rounded-3xl border border-neutral-200 bg-white/80 p-8 shadow-sm backdrop-blur-xl dark:border-gray-800 dark:bg-[#0f172a]/70">
            <div className="mb-5 flex items-center gap-4">
              <div className="rounded-2xl bg-secondary/10 p-3">
                <PackageCheck className="text-secondary" size={24} />
              </div>

              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Product Returns</h2>
            </div>

            <div className="space-y-4 text-neutral-600 dark:text-gray-400">
              <p>Customers may request returns for eligible products within 7 days of delivery, subject to the following conditions:</p>

              <ul className="list-disc space-y-3 pl-6">
                <li>The product must be unused and in original condition.</li>
                <li>Original packaging, accessories, and invoices must be provided.</li>
                <li>Physically damaged or modified products are not eligible for refunds.</li>
                <li>Certain custom-installed or special-order products may not be returnable.</li>
              </ul>
            </div>
          </div>

          {/* SECTION */}
          <div className="rounded-3xl border border-neutral-200 bg-white/80 p-8 shadow-sm backdrop-blur-xl dark:border-gray-800 dark:bg-[#0f172a]/70">
            <div className="mb-5 flex items-center gap-4">
              <div className="rounded-2xl bg-secondary/10 p-3">
                <CreditCard className="text-secondary" size={24} />
              </div>

              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Refund Processing</h2>
            </div>

            <div className="space-y-4 text-neutral-600 dark:text-gray-400">
              <p>Approved refunds will be processed using the original payment method whenever possible.</p>

              <ul className="list-disc space-y-3 pl-6">
                <li>Refund processing may take 5–14 business days depending on the payment provider.</li>
                <li>Installation or transportation charges may be non-refundable.</li>
                <li>Partial refunds may apply in certain service-related cases.</li>
              </ul>
            </div>
          </div>

          {/* SECTION */}
          <div className="rounded-3xl border border-neutral-200 bg-white/80 p-8 shadow-sm backdrop-blur-xl dark:border-gray-800 dark:bg-[#0f172a]/70">
            <div className="mb-5 flex items-center gap-4">
              <div className="rounded-2xl bg-secondary/10 p-3">
                <ShieldCheck className="text-secondary" size={24} />
              </div>

              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Service Cancellations</h2>
            </div>

            <div className="space-y-4 text-neutral-600 dark:text-gray-400">
              <p>Customers may cancel service bookings before installation or project commencement.</p>

              <ul className="list-disc space-y-3 pl-6">
                <li>Cancellation requests must be submitted in advance.</li>
                <li>Deposits may be partially refundable depending on project preparation status.</li>
                <li>Completed installations and finalized services are generally non-refundable.</li>
              </ul>
            </div>
          </div>

          {/* SECTION */}
          <div className="rounded-3xl border border-neutral-200 bg-white/80 p-8 shadow-sm backdrop-blur-xl dark:border-gray-800 dark:bg-[#0f172a]/70">
            <div className="mb-5 flex items-center gap-4">
              <div className="rounded-2xl bg-secondary/10 p-3">
                <AlertTriangle className="text-secondary" size={24} />
              </div>

              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Non-Refundable Items</h2>
            </div>

            <div className="space-y-4 text-neutral-600 dark:text-gray-400">
              <p>The following items and services are generally non-refundable:</p>

              <ul className="list-disc space-y-3 pl-6">
                <li>Completed installation services</li>
                <li>Customized or special-order products</li>
                <li>Software licenses and activated subscriptions</li>
                <li>Products damaged due to misuse or negligence</li>
              </ul>
            </div>
          </div>

          {/* CONTACT */}
          <div className="rounded-3xl border border-secondary/20 bg-secondary/5 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Need Assistance?</h2>

            <p className="mt-4 leading-relaxed text-neutral-600 dark:text-gray-400">If you have questions regarding refunds, returns, or cancellations, please contact our support team.</p>

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
