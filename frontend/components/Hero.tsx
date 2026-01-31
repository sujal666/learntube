'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 pt-24 text-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-100 via-white to-white">
      
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 h-full w-full">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-violet-200/30 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 max-w-5xl space-y-8"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-violet-700 shadow-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-600"></span>
            </span>
            v2.0 is now live: AI-Powered Roadmaps
        </div>

        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl md:text-8xl leading-[1.1]">
          Master any skill with
          <br />
          <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
             Structured Intelligence
          </span>
        </h1>

        <p className="mx-auto max-w-2xl text-lg text-slate-600 sm:text-x md:leading-relaxed">
          Transform scattered YouTube videos into comprehensive, university-grade courses. 
          Our AI organizes, explains, and tracks your progress.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row pt-4">
            <Link 
                href="/register"
                className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-slate-900 px-10 text-base font-semibold text-white transition-all duration-300 hover:bg-slate-800 hover:shadow-2xl hover:-translate-y-0.5 hover:ring-4 hover:ring-slate-100"
            >
                Start Learning Free
                <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
            </Link>
            <Link 
                href="/demo"
                className="inline-flex h-14 items-center justify-center rounded-full border border-slate-200 bg-white px-10 text-base font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900"
            >
                View Demo
            </Link>
        </div>
      </motion.div>

      {/* Hero Image / Dashboard Preview */}
      <motion.div 
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2, type: "spring", bounce: 0.2 }}
        className="mt-20 w-full max-w-6xl -mb-32 relative z-0 pl-4 pr-4"
      >
        <div className="relative rounded-2xl bg-slate-900 p-2 shadow-2xl ring-1 ring-slate-900/10">
            <div className="rounded-xl bg-slate-950 overflow-hidden border border-slate-800/50 aspect-[16/9] relative">
               {/* Abstract Dashboard UI */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">
                   <div className="text-center space-y-4">
                      <div className="h-16 w-16 bg-violet-600/20 rounded-2xl mx-auto flex items-center justify-center border border-violet-500/30">
                        <svg className="h-8 w-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-slate-500 text-sm font-medium tracking-wide">AI GENERATING COURSE STRUCTURE...</p>
                      
                      {/* Loading Bar */}
                      <div className="w-64 h-1.5 bg-slate-800 rounded-full mx-auto overflow-hidden">
                        <motion.div 
                             initial={{ width: "0%" }}
                             animate={{ width: "100%" }}
                             transition={{ duration: 2, repeat: Infinity }}
                             className="h-full bg-violet-500 rounded-full"
                        />
                      </div>
                   </div>
                </div>
            </div>
        </div>
      </motion.div>
    </section>
  );
}
