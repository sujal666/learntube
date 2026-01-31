'use client';

import { motion } from 'framer-motion';
import { Brain, Map, Star, BarChart3, Lock, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils'; // Use our new utility

export function BentoGrid() {
  return (
    <section className="py-32 px-6 max-w-7xl mx-auto">
      <div className="mb-20 text-center max-w-3xl mx-auto">
        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-slate-900 leading-tight">
          Everything you need to <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">master any topic</span>
        </h2>
        <p className="mt-6 text-xl text-slate-600 leading-relaxed">
          We replace the chaos of YouTube with the structure of a university degree. 
          Get a curriculum, not just a feed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[180px]">
        
        {/* Large Card: Structured Learning */}
        <motion.div 
            whileHover={{ scale: 1.01 }}
            className="md:col-span-2 md:row-span-2 rounded-3xl bg-slate-50 border border-slate-200 p-8 flex flex-col justify-between overflow-hidden relative group hover:shadow-xl transition-all duration-300"
        >
            <div className="absolute top-0 right-0 w-96 h-96 bg-violet-100/50 rounded-full blur-3xl -z-10 transition-all group-hover:bg-violet-200/50" />
            
            <div className="space-y-4 relative z-10">
                <div className="h-12 w-12 bg-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-violet-200">
                    <Map size={24} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Structured Learning Paths</h3>
                <p className="text-slate-600 text-base leading-relaxed max-w-sm">
                    Don&apos;t just watch videos. Follow a curated roadmap that takes you from beginner to expert, step by step.
                </p>
            </div>

            <div className="mt-8 relative h-48 w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-5 flex flex-col gap-3">
                {/* Mock Roadmap UI */}
                {[
                  { title: "React Fundamentals", status: "completed" },
                  { title: "Advanced Hooks", status: "current" },
                  { title: "Server Components", status: "locked" }
                ].map((step, i) => (
                    <div key={i} className="flex items-center gap-4 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-offset-2",
                          step.status === 'completed' ? "bg-green-100 text-green-700 ring-green-100" :
                          step.status === 'current' ? "bg-violet-100 text-violet-700 ring-violet-100" :
                          "bg-slate-100 text-slate-400 ring-slate-100"
                        )}>
                            {i + 1}
                        </div>
                        <div className="flex-1">
                          <div className={cn("text-sm font-semibold", step.status === 'locked' ? "text-slate-400" : "text-slate-800")}>{step.title}</div>
                          <div className="h-1.5 w-24 bg-slate-100 rounded-full mt-1 overflow-hidden">
                             <div className={cn("h-full rounded-full", step.status === 'completed' ? "bg-green-500 w-full" : step.status === 'current' ? "bg-violet-500 w-1/3" : "w-0")} />
                          </div>
                        </div>
                        {step.status === 'locked' && <Lock size={14} className="text-slate-300" />}
                    </div>
                ))}
            </div>
        </motion.div>

        {/* Medium Card: AI Explainability */}
        <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-1 md:row-span-2 rounded-3xl bg-slate-900 text-white p-6 flex flex-col justify-between overflow-hidden relative shadow-xl"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" />
            <div className="relative z-10 space-y-4">
                 <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-sm border border-white/10">
                    <Brain size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">AI Tutor</h3>
                  <p className="text-slate-400 text-sm mt-1">
                      Instant answers from video transcripts.
                  </p>
                </div>
            </div>
             <div className="relative z-10 mt-4 p-4 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-300 font-mono leading-relaxed">
                &gt; Query: Explain &quot;useEffect&quot;<br/><br/>
                <span className="text-violet-300">AI:</span> useEffect handles side effects in functional components. It runs after render...
             </div>
        </motion.div>

        {/* Small Card: User Rating */}
        <motion.div 
             whileHover={{ scale: 1.05 }}
             className="md:col-span-1 md:row-span-1 rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-500 p-6 flex flex-col justify-center items-center text-center text-white relative overflow-hidden shadow-lg"
        >
             <Star className="text-white/80 mb-2" size={32} fill="currentColor" />
             <h3 className="text-4xl font-extrabold">4.9/5</h3>
             <p className="text-white/90 font-medium text-sm">Average Rating</p>
        </motion.div>

        {/* Small Card: Active Learners */}
        <motion.div 
             whileHover={{ scale: 1.05 }}
             className="md:col-span-1 md:row-span-1 rounded-3xl bg-white border border-slate-200 p-6 flex flex-col justify-center items-center text-center relative overflow-hidden shadow-sm group hover:border-violet-200 transition-colors"
        >
             <div className="flex -space-x-3 mb-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-8 w-8 rounded-full bg-slate-200 border-2 border-white" />
                ))}
             </div>
             <h3 className="text-xl font-bold text-slate-900">10k+</h3>
             <p className="text-slate-500 text-sm">Active Learners</p>
        </motion.div>

        {/* Medium Horizontal: Adaptive Engine */}
        <motion.div 
             whileHover={{ scale: 1.02 }}
             className="md:col-span-2 md:row-span-1 rounded-3xl bg-white border border-slate-200 p-6 flex items-center justify-between overflow-hidden relative shadow-sm hover:shadow-md transition-all"
        >
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <BarChart3 size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Adaptive Pace</h3>
                  <p className="text-slate-500 text-sm">Adjusts to your learning speed.</p>
                </div>
            </div>
            <div className="hidden md:flex items-end gap-1 h-12">
                {[40, 70, 50, 90, 60, 80, 45].map((h, i) => (
                    <div key={i} className="w-3 bg-blue-100 rounded-t-sm relative group-hover:bg-blue-500 transition-colors duration-500 delay-[${i * 50}ms]">
                        <div style={{ height: `${h}%` }} className="absolute bottom-0 w-full bg-blue-500 rounded-t-sm opacity-20 group-hover:opacity-100 transition-opacity" />
                    </div>
                ))}
            </div>
        </motion.div>

         {/* Medium Horizontal: Share */}
         <motion.div 
             whileHover={{ scale: 1.02 }}
             className="md:col-span-2 md:row-span-1 rounded-3xl bg-violet-50 border border-violet-100 p-6 flex items-center gap-6 overflow-hidden relative shadow-sm"
        >
             <div className="h-12 w-12 bg-violet-600 rounded-full flex items-center justify-center text-white shrink-0">
                <Share2 size={24} />
             </div>
             <div>
                <h3 className="text-lg font-bold text-slate-900">Shareable Certificates</h3>
                <p className="text-slate-600 text-sm">Showcase your progress on LinkedIn with verified certificates.</p>
             </div>
        </motion.div>

      </div>
    </section>
  );
}
