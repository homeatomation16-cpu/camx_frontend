"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import Hero from "@/app/components/Hero";
import FeaturedProducts from "@/app/components/FeaturedProducts"; // Import the new FeaturedProducts component
import Services from "@/app/components/Services";
import ServicesSection from "./components/ServicesSection";
import Providers from "./components/Providers";

const API = process.env.NEXT_PUBLIC_API_BASE;

type Product = {
  _id: string;
  productId?: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  description?: string;
  stock?: number;
  brand?: string;
};

export default function HomePage() {
  const [, setProducts] = useState<Product[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await axios.get(`${API}/products`);
        setProducts(response.data);
      } catch (error) {
        console.log("Product fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <main className="h-full bg-white dark:bg-background text-neutral-900 dark:text-foreground transition-colors duration-300">
      {/* 1. HERO COMPONENT */}
      <div className="pt-10">
        <Hero />
      </div>

      {/* 2. STANDALONE REUSABLE FEATURED PRODUCTS COMPONENT */}
      <div>
        <FeaturedProducts />
      </div>
      <div>
        <ServicesSection />
      </div>

      <div>
        <Providers />
      </div>

      {/* 3. SERVICES COMPONENT */}
      <Services />
    </main>
  );
}
