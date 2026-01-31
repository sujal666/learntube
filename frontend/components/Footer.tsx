export function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-violet-600 flex items-center justify-center text-white font-bold">L</div>
            <span className="font-bold text-slate-900 tracking-tight">LearnTube</span>
        </div>
        
        <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-900 text-slate-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-900 text-slate-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-900 text-slate-600 transition-colors">Twitter</a>
        </div>
        
        <div className="text-sm text-slate-400">
            © 2024 LearnTube AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
