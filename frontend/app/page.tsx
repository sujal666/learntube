'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from './providers'; // Keep this for future auth logic if needed
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { BentoGrid } from '@/components/BentoGrid';
import { Testimonials } from '@/components/Testimonials';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8f9fc] overflow-x-hidden">
      <Navbar /> 
      <Hero />
      <BentoGrid />
      <Testimonials />
      <Footer />
    </main>
  );
}


