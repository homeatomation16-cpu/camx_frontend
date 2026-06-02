"use client";

import { useParams } from "next/navigation";
import { Camera, ShieldCheck, MonitorSmartphone, Building2, Wrench, Cpu, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { LucideIcon } from "lucide-react"; // අලුතින් එකතු කළා

// 1. Interface එකක් නිර්මාණය කිරීම (any දෝෂය ඉවත් කිරීමට)
interface ServiceDetail {
  title: string;
  description: string;
  features: string[];
  icon: LucideIcon;
}

// Record එකෙහි any වෙනුවට ServiceDetail භාවිතා කිරීම
const SERVICE_DETAILS: Record<string, ServiceDetail> = {
  "cctv-installation": {
    title: "CCTV Camera Installation",
    description: "Professional HD and AI-powered CCTV camera installations for homes, offices, shops, and warehouses.",
    features: ["4K Ultra HD Resolution", "Advanced Night Vision", "Remote Mobile Access", "Motion Detection Alerts", "Professional Cabling & Setup"],
    icon: Camera,
  },
  "remote-monitoring": {
    title: "Remote Monitoring Solutions",
    description: "Monitor your property remotely using mobile apps and smart cloud-enabled surveillance systems.",
    features: ["Global Access via App", "Cloud Storage Integration", "Multi-user Permissions", "Instant Push Notifications", "Encrypted Data Transfer"],
    icon: MonitorSmartphone,
  },
  "smart-security": {
    title: "Smart Security Systems",
    description: "Integrated alarm systems, motion detection, smart sensors, and real-time security alerts.",
    features: ["Smart Siren Alerts", "Intrusion Detection", "Smart Sensor Integration", "Home Automation Links", "Real-time Status Updates"],
    icon: ShieldCheck,
  },
  "enterprise-security": {
    title: "Enterprise Security",
    description: "Customized enterprise-grade surveillance and access control systems for industrial environments.",
    features: ["Centralized Control Center", "Scalable System Architecture", "High-Security Encryption", "Industrial Grade Hardware", "24/7 Technical Monitoring"],
    icon: Building2,
  },
  "maintenance-support": {
    title: "Maintenance & Support",
    description: "We provide routine maintenance, troubleshooting, software updates, and rapid technical assistance.",
    features: ["Hardware Health Checks", "Firmware & Software Updates", "Priority Support Access", "Rapid Repair Service", "Annual Maintenance Contracts"],
    icon: Wrench,
  },
  "access-control": {
    title: "Access Control & Automation",
    description: "Secure your entrances with biometric access systems, smart door locks, and professional attendance tracking solutions.",
    features: ["Biometric Fingerprint Access", "RFID Card Systems", "Mobile Entry Control", "Automated Attendance Logs", "Remote Door Locking"],
    icon: Cpu,
  },
};

export default function ServiceDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const service = SERVICE_DETAILS[id];

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Service Not Found</h1>
        <Link href="/services" className="mt-4 text-secondary hover:underline">
          Back to Services
        </Link>
      </div>
    );
  }

  const Icon = service.icon;

  return (
    <main className="min-h-screen bg-white dark:bg-[#050816] py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#0f172a] p-8 md:p-12 rounded-3xl border border-neutral-200 dark:border-border shadow-xl">
          <div className="flex items-center gap-5 mb-8">
            <div className="p-4 rounded-2xl bg-secondary/10 text-secondary">
              <Icon size={40} />
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-neutral-900 dark:text-white">{service.title}</h1>
          </div>

          <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed mb-10">{service.description}</p>

          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-8">
            {/* 2. ' ශිෂ්ණය අකුර වෙනුවට &apos; භාවිතා කිරීම */}
            <h2 className="text-xl font-bold mb-6 text-neutral-900 dark:text-white">What&apos;s included:</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {service.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-[#1e293b]">
                  <div className="h-2 w-2 rounded-full bg-secondary" />
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 flex gap-4">
            <Link href="/contact" className="flex items-center gap-2 px-8 py-3 bg-secondary text-white font-bold rounded-xl hover:opacity-90 transition shadow-lg shadow-secondary/20">
              Get a Quotation <ArrowRight size={18} />
            </Link>
            <Link href="/services" className="px-8 py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700 transition">
              Back
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
