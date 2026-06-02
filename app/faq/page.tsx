"use client";

import Link from "next/link";
import { HelpCircle, ShieldCheck, Camera, Wrench, CreditCard, Clock, Mail, Phone } from "lucide-react";

export default function FAQPage() {
  const faqs = [
    {
      icon: Camera,
      question: "What services does CAMX.lk provide?",
      answer: "We provide CCTV camera installations, smart surveillance systems, access control solutions, security maintenance services, and enterprise-grade monitoring systems across Sri Lanka.",
    },
    {
      icon: ShieldCheck,
      question: "Do your CCTV systems support remote viewing?",
      answer: "Yes. Most of our CCTV systems support remote access through mobile apps and desktop platforms, allowing you to monitor your property from anywhere.",
    },
    {
      icon: Wrench,
      question: "Do you provide installation services?",
      answer: "Yes. Our professional technical team handles complete installations, system setup, testing, and customer guidance for all supported products.",
    },
    {
      icon: Clock,
      question: "How long does installation take?",
      answer: "Installation time depends on the project size and complexity. Standard home installations are usually completed within one day.",
    },
    {
      icon: CreditCard,
      question: "What payment methods do you accept?",
      answer: "We accept bank transfers, cash payments, and selected digital payment methods depending on the service or project requirements.",
    },
    {
      icon: ShieldCheck,
      question: "Do your products include warranties?",
      answer: "Yes. Most products and installations include warranty coverage. Warranty periods may vary depending on the product manufacturer and service agreement.",
    },
    {
      icon: HelpCircle,
      question: "Can I request technical support after installation?",
      answer: "Absolutely. We provide technical support, troubleshooting assistance, and maintenance services for installed systems.",
    },
    {
      icon: Camera,
      question: "Do you provide custom security solutions for businesses?",
      answer: "Yes. We design and implement customized surveillance and security solutions for offices, warehouses, factories, shops, and industrial environments.",
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-linear-to-b from-white to-neutral-50 dark:from-[#050816] dark:to-[#0b1120]">
      {/* Background Glow */}
      <div className="absolute left-1/2 top-20 h-96 w-96 -translate-x-1/2 rounded-full bg-secondary/10 blur-3xl" />

      <section className="relative z-10 mx-auto max-w-5xl px-5 py-20 sm:px-8">
        {/* HEADER */}
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-18 w-18 items-center justify-center rounded-3xl bg-secondary/10">
            <HelpCircle className="text-secondary" size={38} />
          </div>

          <h1 className="text-4xl font-black tracking-tight text-neutral-900 dark:text-white sm:text-5xl">Frequently Asked Questions</h1>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-neutral-600 dark:text-gray-400 sm:text-lg">Find answers to common questions about CAMX.lk products, installations, support services, and security solutions.</p>
        </div>

        {/* FAQ LIST */}
        <div className="mt-16 grid gap-6">
          {faqs.map((faq, index) => {
            const Icon = faq.icon;

            return (
              <div key={index} className="rounded-3xl border border-neutral-200 bg-white/80 p-8 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-[#0f172a]/70">
                <div className="flex items-start gap-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary/10">
                    <Icon className="text-secondary" size={24} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{faq.question}</h2>

                    <p className="mt-4 leading-relaxed text-neutral-600 dark:text-gray-400">{faq.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CONTACT SECTION */}
        <div className="mt-14 rounded-3xl border border-secondary/20 bg-secondary/5 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Still Need Help?</h2>

          <p className="mt-4 leading-relaxed text-neutral-600 dark:text-gray-400">Our support team is ready to assist you with product inquiries, installations, troubleshooting, and custom security solutions.</p>

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
        <div className="pt-10 text-center">
          <Link href="/" className="inline-flex items-center justify-center rounded-2xl bg-secondary px-6 py-3 font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg">
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}
