"use client";

export default function Services() {
  return (
    <section className="py-24 px-6 bg-neutral-50 dark:bg-card border-t border-neutral-200 dark:border-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* SECTION HEADER */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white">Our Services</h2>
          <p className="mt-5 text-neutral-600 dark:text-gray-400 max-w-3xl mx-auto">Advanced security solutions tailored for modern homes and businesses across Sri Lanka.</p>
        </div>

        {/* SERVICES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* CARD 1 */}
          <div className="p-8 rounded-2xl bg-white dark:bg-background border border-neutral-200 dark:border-border shadow-sm transition-colors duration-300">
            <h3 className="text-xl font-bold mb-3 text-neutral-900 dark:text-white">CCTV Installation</h3>
            <p className="text-neutral-600 dark:text-gray-400">Professional setup with high-definition camera links and secure cloud storage configurations.</p>
          </div>

          {/* CARD 2 */}
          <div className="p-8 rounded-2xl bg-white dark:bg-background border border-neutral-200 dark:border-border shadow-sm transition-colors duration-300">
            <h3 className="text-xl font-bold mb-3 text-neutral-900 dark:text-white">Smart Home Security</h3>
            <p className="text-neutral-600 dark:text-gray-400">Integrated smart biometric locks, motion sensors, and automated response control metrics.</p>
          </div>

          {/* CARD 3 */}
          <div className="p-8 rounded-2xl bg-white dark:bg-background border border-neutral-200 dark:border-border shadow-sm transition-colors duration-300">
            <h3 className="text-xl font-bold mb-3 text-neutral-900 dark:text-white">Enterprise Maintenance</h3>
            <p className="text-neutral-600 dark:text-gray-400">24/7 dedicated device health diagnostics, priority on-site support, and system hardware tuning.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
