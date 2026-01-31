'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
// import { clsx, type ClassValue } from 'clsx'; // Not needed here anymore
// import { twMerge } from 'tailwind-merge'; // Not needed here anymore


const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Onboarding', href: '/onboarding' },
  { label: 'Dashboard', href: '/dashboard' },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-6 left-1/2 z-50 -translate-x-1/2"
    >
      <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/60 p-2 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-black/60">
        <div className="flex items-center gap-4 px-4">
            <div className="h-8 w-8 bg-black rounded-full" /> {/* Logo placeholder */}
            <span className="font-bold tracking-tight text-foreground">LearnTube</span>
        </div>

        <div className="hidden sm:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-colors hover:text-black",
                  isActive ? "text-slate-900" : "text-slate-500 hover:text-violet-600"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 z-[-1] rounded-full bg-slate-100/80"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="pl-2 pr-2">
            <Link href="/login" className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:scale-105 active:scale-95">
                Get Started
            </Link>
        </div>
      </div>
    </motion.nav>
  );
}
