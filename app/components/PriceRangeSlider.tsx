import { useRef } from "react";

export default function PriceRangeSlider({
  min,
  max,
  minVal,
  maxVal,
  onChange,
}: {
  min: number;
  max: number;
  minVal: number;
  maxVal: number;
  onChange: (min: number, max: number) => void;
}) {
  const rangeRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="w-full">
      {/* VALUES */}
      <div
        className="
          mb-4
          flex
          items-center
          gap-2
        "
      >
        <div className="flex-1">
          <label
            className="
              mb-1
              block
              text-[10px]
              font-semibold
              uppercase
              tracking-wide
              text-neutral-500
            "
          >
            Min
          </label>

          <input
            type="number"
            value={minVal}
            min={min}
            max={max}
            onChange={(e) => onChange(Number(e.target.value), maxVal)}
            className="
              h-10
              w-full
              rounded-xl
              border
              border-neutral-200
              dark:border-border
              bg-neutral-50
              dark:bg-[#101624]
              px-3
              text-sm
              outline-none
            "
          />
        </div>

        <div className="mt-5 text-neutral-400">—</div>

        <div className="flex-1">
          <label
            className="
              mb-1
              block
              text-[10px]
              font-semibold
              uppercase
              tracking-wide
              text-neutral-500
            "
          >
            Max
          </label>

          <input
            type="number"
            value={maxVal}
            min={min}
            max={max}
            onChange={(e) => onChange(minVal, Number(e.target.value))}
            className="
              h-10
              w-full
              rounded-xl
              border
              border-neutral-200
              dark:border-border
              bg-neutral-50
              dark:bg-[#101624]
              px-3
              text-sm
              outline-none
            "
          />
        </div>
      </div>

      {/* RANGE */}
      <div
        ref={rangeRef}
        className="
          relative
          h-6
          w-full
        "
      >
        {/* TRACK */}
        <div
          className="
            absolute
            top-1/2
            h-1.5
            w-full
            -translate-y-1/2
            rounded-full
            bg-neutral-200
            dark:bg-neutral-700
          "
        />

        {/* ACTIVE */}
        <div
          className="
            absolute
            top-1/2
            h-1.5
            -translate-y-1/2
            rounded-full
            bg-secondary
          "
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />

        {/* MIN RANGE */}
        <input
          type="range"
          min={min}
          max={max}
          value={minVal}
          onChange={handleMinChange}
          className="
            absolute
            inset-0
            h-full
            w-full
            cursor-pointer
            opacity-0
          "
        />

        {/* MAX RANGE */}
        <input
          type="range"
          min={min}
          max={max}
          value={maxVal}
          onChange={handleMaxChange}
          className="
            absolute
            inset-0
            h-full
            w-full
            cursor-pointer
            opacity-0
          "
        />

        {/* LEFT THUMB */}
        <div
          className="
            pointer-events-none
            absolute
            top-1/2
            h-5
            w-5
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            border-2
            border-white
            bg-secondary
            shadow-md
          "
          style={{
            left: `${minPercent}%`,
          }}
        />

        {/* RIGHT THUMB */}
        <div
          className="
            pointer-events-none
            absolute
            top-1/2
            h-5
            w-5
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            border-2
            border-white
            bg-secondary
            shadow-md
          "
          style={{
            left: `${maxPercent}%`,
          }}
        />
      </div>
    </div>
  );
}
