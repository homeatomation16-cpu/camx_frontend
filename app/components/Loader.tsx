'use client';

import {
  motion,
} from 'framer-motion';

// ======================================
// COMPONENT
// ======================================

export default function Loader() {

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">

      <div className="flex flex-col items-center gap-6">

        {/* SPINNER */}
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="w-16 h-16 rounded-full border-4 border-secondary/20 border-t-secondary"
        />

        {/* TEXT */}
        <motion.p
          initial={{
            opacity: 0.4,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="text-lg font-bold text-secondary tracking-wide"
        >
          Loading...
        </motion.p>
      </div>
    </div>
  );
}