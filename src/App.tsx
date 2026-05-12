/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/src/components/AppSidebar';
import ChatInterface from '@/src/components/ChatInterface';
import Library from '@/src/components/Library';
import UploadCenter from '@/src/components/UploadCenter';
import { Toaster } from '@/components/ui/sonner';
import { Database } from 'lucide-react';
import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function App() {
  const [activeTab, setActiveTab] = React.useState('assistant');
  const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    }
    return 'light';
  });

  React.useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <SidebarProvider>
      <div className={`flex h-screen w-full overflow-hidden font-sans antialiased transition-all duration-500 ${
        theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}>
        <AppSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          theme={theme}
          onThemeToggle={toggleTheme}
        />
        <SidebarInset className="flex flex-col flex-1 overflow-hidden bg-transparent relative">
          {/* Subtle Background Effects */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />

          {/* Main Content Area */}
          <main className="flex-1 overflow-hidden flex flex-col relative z-10">
            {activeTab === 'assistant' && <ChatInterface />}
            {activeTab === 'library' && <Library />}
            {activeTab === 'upload' && <UploadCenter />}
            {activeTab === 'metrics' && (
                <div className="flex-1 p-10 space-y-10 overflow-auto custom-scrollbar bg-background/50">
                    <div className="flex flex-col">
                        <h2 className="text-3xl font-heading font-bold text-gradient">Infrastructure Hub</h2>
                        <p className="text-muted-foreground mt-1">Real-time telemetry from the Nexus neural cluster.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: "Neural Nodes", value: "24", sub: "Active Segments" },
                            { label: "Total Vectors", value: "1.24M", sub: "+12k today" },
                            { label: "Avg Latency", value: "28ms", sub: "us-east-1", color: "text-emerald-500" },
                            { label: "Compute Logic", value: "98.2%", sub: "High Resilience" }
                        ].map((stat, i) => (
                            <motion.div 
                              key={i} 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="bg-card p-6 rounded-3xl border border-border/50 shadow-xl shadow-black/5 hover:shadow-2xl transition-all group"
                            >
                                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mb-2">{stat.label}</div>
                                <div className={`text-3xl font-heading font-bold ${stat.color || 'text-foreground'}`}>{stat.value}</div>
                                <div className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-widest mt-1 group-hover:text-blue-500 transition-colors">{stat.sub}</div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 h-full pb-10">
                        <div className="lg:col-span-2 bg-card rounded-3xl border border-border/50 shadow-2xl overflow-hidden flex flex-col glass group">
                            <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/20">
                                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                    <div className="size-2 rounded-full bg-blue-500" />
                                    Persistence Layer
                                </h3>
                                <Badge variant="outline" className="text-[9px] border-blue-500/30 text-blue-500 bg-blue-500/5 font-bold uppercase tracking-widest">Healthy</Badge>
                            </div>
                            <div className="p-12 flex flex-col items-center justify-center text-center flex-1">
                                <motion.div 
                                  animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
                                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                  className="size-24 rounded-[2.5rem] bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 flex items-center justify-center mb-8 shadow-2xl ring-4 ring-blue-500/5 group-hover:ring-blue-500/10 transition-all"
                                >
                                    <Database className="size-12 text-blue-500" />
                                </motion.div>
                                <h4 className="text-2xl font-heading font-bold text-foreground">Global Vector Mesh</h4>
                                <p className="text-muted-foreground max-w-sm mt-3 leading-relaxed text-sm">
                                    Our high-availability shard architecture ensures sub-50ms retrieval times across multiple geolocations.
                                </p>
                                <Button variant="outline" size="sm" className="mt-8 rounded-xl border-border px-8 font-bold text-[10px] uppercase tracking-[0.15em] h-9">View Node Distribution</Button>
                            </div>
                        </div>

                        <div className="bg-slate-950 rounded-3xl border border-white/5 flex flex-col overflow-hidden shadow-2xl relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] rounded-full pointer-events-none" />
                            <div className="p-4 bg-white/5 flex items-center gap-3">
                                <div className="flex gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/40"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40"></div>
                                </div>
                                <span className="text-[10px] text-white/40 font-mono tracking-tighter">nexus_rag_core.cpp</span>
                            </div>
                            <div className="p-6 flex-1 font-mono text-[11px] leading-relaxed overflow-auto custom-scrollbar">
                                <div className="text-emerald-500/60 mb-3">// Initializing Tensor-Parallel Interface</div>
                                <div className="flex gap-2 mb-4">
                                    <span className="text-blue-400 font-bold shrink-0">main()</span>
                                    <span className="text-white/80 ring-1 ring-white/10 px-2 rounded-lg bg-white/5 shadow-inner">nexus_init_vector_shards(8);</span>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl mb-6 text-white/90 border border-white/5 shadow-inner leading-relaxed">
                                    const auto query = request.get_query();<br/>
                                    auto results = await semantic_search(query);<br/>
                                    return generate_neural_context(results);
                                </div>
                                <div className="text-blue-500 font-bold mb-2">OUTPUT LOGS [2024.05.07]</div>
                                <div className="text-emerald-400 italic p-4 bg-emerald-500/5 shadow-inner rounded-xl border border-emerald-500/10 text-[10px]">
                                    SHAP values computed in 84ms. Interpetability logic synchronized with master branch.
                                </div>
                                <div className="mt-6 border-t border-white/5 pt-6 flex justify-between text-[9px] text-white/30 font-bold uppercase tracking-widest">
                                    <span>T-Latency: 12ms</span>
                                    <span>Mem-U: 1.2GB</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
          </main>

          {/* Status Bar */}
          <footer className="h-8 bg-card border-t border-border px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-6 text-[10px] font-medium">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-muted-foreground uppercase tracking-tight">Docker: Running</span>
              </div>
              <div className="text-muted-foreground/30">•</div>
              <div className="flex items-center gap-2">
                <Database className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground uppercase tracking-tight">Region: AWS US-EAST-1</span>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground/50 font-mono tracking-tighter uppercase">
              Build v1.0.42-STABLE
            </div>
          </footer>
        </SidebarInset>
      </div>
      <Toaster position="top-right" />
    </SidebarProvider>
  );
}

