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

  try {
    features = specifications?.featureData
      ? JSON.parse(specifications.featureData)
      : [];
  } catch (error) {
    console.log(error);
  }

  if (!features.length) {
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

      {/* FEATURES */}
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
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  unoptimized
                  loading="lazy"
                  sizes="100vw"
                  className="object-cover"
                />
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
    </section>
  );
}
