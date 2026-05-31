import { useRef, useState } from "react";
import { motion } from "framer-motion";

export default function PriceRangeSlider({ min, max, minVal, maxVal, onChange }: { min: number; max: number; minVal: number; maxVal: number; onChange: (min: number, max: number) => void }) {
  const rangeRef = useRef<HTMLDivElement>(null);
  const [activeThumb, setActiveThumb] = useState<"min" | "max" | null>(null);

  const minPercent = Math.round(((minVal - min) / (max - min)) * 100);
  const maxPercent = Math.round(((maxVal - min) / (max - min)) * 100);

  function handleMinChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = Math.min(Number(e.target.value), maxVal - 1000);
    onChange(value, maxVal);
  }

  function handleMaxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = Math.max(Number(e.target.value), minVal + 1000);
    onChange(minVal, value);
  }

  const formatPrice = (val: number) => (val >= 1000 ? `Rs ${(val / 1000).toFixed(0)}k` : `Rs ${val}`);

  return (
    <div className="w-full select-none">
      {/* PRICE DISPLAY */}
      <div className="mb-5 flex items-center justify-between">
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800/60">
          <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Min</p>
          <p className="text-sm font-black text-secondary">Rs {minVal.toLocaleString()}</p>
        </div>

        <div className="flex items-center gap-1">
          <div className="h-px w-4 bg-neutral-300 dark:bg-neutral-600" />
          <div className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
          <div className="h-px w-4 bg-neutral-300 dark:bg-neutral-600" />
        </div>

        <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-right dark:border-neutral-700 dark:bg-neutral-800/60">
          <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Max</p>
          <p className="text-sm font-black text-secondary">Rs {maxVal.toLocaleString()}</p>
        </div>
      </div>

      {/* SLIDER TRACK */}
      <div ref={rangeRef} className="relative h-8 w-full">
        {/* BACKGROUND TRACK */}
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700" />

        {/* ACTIVE FILL */}
        <motion.div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-secondary"
          animate={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 40 }}
        />

        {/* MIN INPUT (invisible, on top) */}
        <input type="range" min={min} max={max} step={500} value={minVal} onChange={handleMinChange} onMouseDown={() => setActiveThumb("min")} onTouchStart={() => setActiveThumb("min")} onMouseUp={() => setActiveThumb(null)} onTouchEnd={() => setActiveThumb(null)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" style={{ zIndex: minVal > max - 1000 ? 5 : 3 }} />

        {/* MAX INPUT (invisible, on top) */}
        <input type="range" min={min} max={max} step={500} value={maxVal} onChange={handleMaxChange} onMouseDown={() => setActiveThumb("max")} onTouchStart={() => setActiveThumb("max")} onMouseUp={() => setActiveThumb(null)} onTouchEnd={() => setActiveThumb(null)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" style={{ zIndex: 4 }} />

        {/* MIN THUMB */}
        <div className="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${minPercent}%` }}>
          <motion.div
            animate={{
              scale: activeThumb === "min" ? 1.25 : 1,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-secondary shadow-lg"
          >
            <div className="h-1.5 w-1.5 rounded-full bg-white/80" />
          </motion.div>

          {/* MIN TOOLTIP */}
          {activeThumb === "min" && (
            <motion.div initial={{ opacity: 0, y: 4, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-secondary px-2 py-1 text-[10px] font-black text-white shadow-md">
              {formatPrice(minVal)}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-secondary" />
            </motion.div>
          )}
        </div>

        {/* MAX THUMB */}
        <div className="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${maxPercent}%` }}>
          <motion.div
            animate={{
              scale: activeThumb === "max" ? 1.25 : 1,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-secondary shadow-lg"
          >
            <div className="h-1.5 w-1.5 rounded-full bg-white/80" />
          </motion.div>

          {/* MAX TOOLTIP */}
          {activeThumb === "max" && (
            <motion.div initial={{ opacity: 0, y: 4, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-secondary px-2 py-1 text-[10px] font-black text-white shadow-md">
              {formatPrice(maxVal)}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-secondary" />
            </motion.div>
          )}
        </div>
      </div>

      {/* TICK MARKS */}
      <div className="mt-2 flex justify-between">
        {[0, 25, 50, 75, 100].map((pct) => {
          const val = Math.round(min + ((max - min) * pct) / 100);
          const inRange = val >= minVal && val <= maxVal;
          return (
            <button
              key={pct}
              onClick={() => {
                if (val <= minVal + (maxVal - minVal) / 2) {
                  onChange(val, maxVal);
                } else {
                  onChange(minVal, val);
                }
              }}
              className={`text-[9px] font-semibold transition ${inRange ? "text-secondary" : "text-neutral-400"}`}
            >
              {formatPrice(val)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
