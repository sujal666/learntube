'use client';

import { motion } from 'framer-motion';

const testimonials = [
  {
    name: "Alex Johnson",
    role: "Frontend Developer",
    text: "LearnTube completely changed how I approach learning. No more tutorial purgatory.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
  },
  {
    name: "Sarah Williams",
    role: "Data Scientist",
    text: "The structured paths are a game changer. I saved weeks of wasted time.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
  },
  {
    name: "Michael Chen",
    role: "UX Designer",
    text: "Finally, a way to use YouTube for serious learning without the distractions.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael"
  },
  {
    name: "Emily Davis",
    role: "Student",
    text: "The AI explanations help me understand *why* a video is relevant.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily"
  },
];

export function Testimonials() {
  return (
    <section className="py-20 overflow-hidden bg-slate-50 border-y border-slate-200">
      <div className="mb-12 text-center px-6">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Trusted by <span className="text-violet-600">lifelong learners</span>
        </h2>
      </div>

      <div className="flex overflow-hidden">
        <motion.div 
            className="flex gap-8 px-8"
            animate={{ x: "-50%" }}
            transition={{ 
                duration: 20, 
                repeat: Infinity, 
                ease: "linear" 
            }}
            style={{ width: "max-content" }}
        >
            {[...testimonials, ...testimonials, ...testimonials].map((t, i) => (
                <div 
                    key={i} 
                    className="w-[350px] flex-shrink-0 rounded-2xl bg-white p-6 shadow-sm border border-slate-100"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <img 
                            src={t.image} 
                            alt={t.name}
                            className="h-12 w-12 rounded-full bg-slate-100" 
                        />
                        <div>
                            <div className="font-bold text-slate-900">{t.name}</div>
                            <div className="text-sm text-slate-500">{t.role}</div>
                        </div>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                        &quot;{t.text}&quot;
                    </p>
                </div>
            ))}
        </motion.div>
      </div>
    </section>
  );
}
