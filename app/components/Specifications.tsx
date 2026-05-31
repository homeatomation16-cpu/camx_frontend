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

  if (!isHtml && !features.length) {
    return null;
  }

  return (
    <section className="mt-20">
      {/* HEADER */}
      <div className="mb-10">
        <h2
          className="
            text-3xl
            font-black
            text-neutral-900
            dark:text-white
          "
        >
          Technical Specifications
        </h2>
      </div>

      {/* HTML TEMPLATE */}
      {isHtml ? (
        <div
          className="
            overflow-x-auto
            rounded-3xl
            border
            border-neutral-200
            dark:border-border
            bg-white
            dark:bg-card
            p-6
          "
        >
          <div
            className="
              prose
              prose-sm
              dark:prose-invert
              max-w-none

              [&_table]:w-full
              [&_table]:border-collapse

              [&_td]:border
              [&_td]:border-neutral-200
              dark:[&_td]:border-border
              [&_td]:p-3

              [&_th]:border
              [&_th]:border-neutral-200
              dark:[&_th]:border-border
              [&_th]:p-3
              [&_th]:bg-neutral-100
              dark:[&_th]:bg-white/5

              [&_tr:nth-child(odd)]:bg-neutral-50
              dark:[&_tr:nth-child(odd)]:bg-white/2

              [&_img]:rounded-xl
              [&_img]:max-w-full
            "
            dangerouslySetInnerHTML={{
              __html: specifications?.featureData || "",
            }}
          />
        </div>
      ) : (
        /* JSON FEATURES */
        <div className="space-y-5">
          {features.map((feature, index) => (
            <div
              key={index}
              className="
                  p-5
                  rounded-3xl
                  border
                  border-neutral-200
                  dark:border-border
                  bg-white
                  dark:bg-card
                "
            >
              {feature.image && (
                <div
                  className="
                      relative
                      w-full
                      h-56
                      rounded-2xl
                      overflow-hidden
                      mb-5
                    "
                >
                  <Image src={feature.image} alt={feature.title} fill unoptimized loading="lazy" sizes="100vw" className="object-cover" />
                </div>
              )}

              <h3
                className="
                    text-lg
                    font-black
                    text-neutral-900
                    dark:text-white
                  "
              >
                {feature.title}
              </h3>

              <p
                className="
                    mt-2
                    text-neutral-600
                    dark:text-gray-300
                    leading-relaxed
                  "
              >
                {feature.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
