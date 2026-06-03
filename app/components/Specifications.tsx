"use client";

import Image from "next/image";

type Feature = {
  title: string;
  value: string;
  image?: string;
};

type Props = {
  specifications?: {
    featureData?: string;
  };
};

export default function Specifications({ specifications }: Props) {
  let features: Feature[] = [];
  let isHtml = false;

  try {
    if (specifications?.featureData) {
      if (specifications.featureData.includes("<table") || specifications.featureData.includes("<p") || specifications.featureData.includes("<div")) {
        isHtml = true;
      } else {
        features = JSON.parse(specifications.featureData);
      }
    }
  } catch (error) {
    console.log(error);
  }

  if (!isHtml && !features.length) return null;

  return (
    <section className="mt-12">
      {/* HEADER */}
      <div className="mb-6 flex items-center gap-3">
        <div className="h-5 w-1 rounded-full bg-secondary" />
        <h2 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">Technical Specifications</h2>
      </div>

      {/* HTML MODE */}
      {isHtml ? (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white p-5 dark:border-border dark:bg-card">
          <div
            className="
              prose prose-sm max-w-none dark:prose-invert
              [&_table]:w-full [&_table]:border-collapse
              [&_td]:border [&_td]:border-neutral-200 [&_td]:p-2.5 [&_td]:text-sm
              dark:[&_td]:border-border
              [&_th]:border [&_th]:border-neutral-200 [&_th]:bg-neutral-100 [&_th]:p-2.5 [&_th]:text-sm
              dark:[&_th]:border-border dark:[&_th]:bg-white/5
              [&_tr:nth-child(odd)]:bg-neutral-50 dark:[&_tr:nth-child(odd)]:bg-white/2
              [&_img]:max-w-full [&_img]:rounded-xl
            "
            dangerouslySetInnerHTML={{ __html: specifications?.featureData || "" }}
          />
        </div>
      ) : (
        /* JSON FEATURES — 2-column grid, image cards span full width */
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {features.map((feature, index) =>
            feature.image ? (
              /* Full-width image card */
              <div key={index} className="group relative sm:col-span-2 overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-border dark:bg-card">
                <div className="relative h-48 w-full overflow-hidden">
                  <Image src={feature.image} alt={feature.title} fill unoptimized loading="lazy" sizes="100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  {/* Gradient overlay for text legibility */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">{feature.title}</p>
                    <p className="mt-0.5 text-sm font-semibold leading-snug text-white">{feature.value}</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Compact text card */
              <div key={index} className="flex flex-col gap-1 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-border dark:bg-card">
                <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">{feature.title}</p>
                <p className="text-sm font-semibold leading-snug text-neutral-800 dark:text-neutral-100">{feature.value}</p>
              </div>
            ),
          )}
        </div>
      )}
    </section>
  );
}
