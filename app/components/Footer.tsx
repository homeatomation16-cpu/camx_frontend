"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Facebook, Instagram, Linkedin, MapPin, Phone, Youtube } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Services", href: "/services" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const supportLinks = [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms & Conditions", href: "/terms-and-conditions" },
    { name: "Refund Policy", href: "/refund-policy" },
    { name: "FAQ", href: "/faq" },
  ];

  return (
    <footer className="relative bg-white dark:bg-[#050816] border-t border-neutral-200 dark:border-border/30 overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-secondary/10 blur-3xl rounded-full z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Grid layout එක භාවිතා කිරීම වඩාත් responsive වේ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* BRAND - lg:col-span-2 නිසා මෙය විශාල ඉඩක් ගනී */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4">
              <Image src="/logo.png" alt="CAMX Logo" width={80} height={80} priority className="w-auto h-auto object-contain" />
              <div>
                <h2 className="text-2xl font-black text-neutral-900 dark:text-white">CAMX.lk</h2>
                <p className="font-extrabold text-[12px] tracking-[0.2em] uppercase text-secondary">Security Solutions</p>
              </div>
            </div>
            <p className="mt-6 text-neutral-600 dark:text-gray-400 leading-relaxed max-w-md">Smart CCTV surveillance and enterprise-grade security solutions for homes, offices, shops, and industrial environments across Sri Lanka.</p>
            <div className="flex items-center gap-4 mt-6">
              {[Facebook, Instagram, Youtube, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl border border-neutral-200 dark:border-gray-800 bg-neutral-50 dark:bg-[#111827] flex items-center justify-center hover:border-secondary hover:bg-secondary/10 hover:scale-110 transition duration-300">
                  <Icon size={18} className="text-neutral-700 dark:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* LINKS කොටස් */}
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-neutral-600 dark:text-gray-400 hover:text-secondary text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">Support</h3>
            <ul className="space-y-3">
              {supportLinks.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-neutral-600 dark:text-gray-400 hover:text-secondary text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT & MAP */}
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">Contact Us</h3>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-secondary shrink-0 mt-1" />
                <p className="text-neutral-600 dark:text-gray-400 text-sm">Colombo, Sri Lanka</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-secondary shrink-0" />
                <a href="tel:+94771234567" className="text-neutral-600 dark:text-gray-400 text-sm hover:text-secondary">
                  +94 77 123 4567
                </a>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-gray-800 shadow-md">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.60945225262!2d79.91571117499555!3d6.817263993180429!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae25b8410a125f3%3A0xae041b5d6455618d!2sCamX%20Secure!5e0!3m2!1sen!2slk!4v1780045532733!5m2!1sen!2slk" className="w-full h-48" allowFullScreen loading="lazy" title="CAMX Location"></iframe>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-neutral-200 dark:border-border/30 text-center">
          <p className="text-xs text-neutral-500">© {new Date().getFullYear()} CAMX.lk. All rights reserved.</p>
          <p className="text-xs text-neutral-500">
            Powered by{" "}
            <a href="https://camx.lk" className="text-secondary hover:underline">
              camx.lk
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
