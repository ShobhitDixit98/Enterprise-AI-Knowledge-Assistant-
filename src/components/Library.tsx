import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Search, Filter, Database, BookMarked, Layers, BarChart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Book } from '../types';

export default function Library() {
  const [books, setBooks] = React.useState<Book[]>([]);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    fetch('/api/library')
      .then(res => res.json())
      .then(data => setBooks(data));
  }, []);

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(search.toLowerCase()) ||
    book.topics.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full bg-background transition-colors duration-300 relative">
      <header className="h-20 border-b border-border flex items-center justify-between px-10 shrink-0 glass z-30">
        <div className="flex items-center gap-3">
          <Database className="size-5 text-blue-500" />
          <h2 className="text-lg font-heading font-semibold tracking-tight text-foreground">Knowledge Repository</h2>
        </div>
        <div className="flex items-center gap-8">
            <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
                    <Layers className="size-3.5 text-blue-500" />
                    <span>Indexed Entities</span>
                </div>
                <span className="text-sm font-bold text-foreground">{books.length} Sources</span>
            </div>
            <div className="h-8 w-[1px] bg-border/50" />
            <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
                    <BarChart className="size-3.5 text-emerald-500" />
                    <span>Total Nodes</span>
                </div>
                <span className="text-sm font-bold text-foreground">12,482 Chunks</span>
            </div>
        </div>
      </header>

      <div className="flex-1 p-10 space-y-10 flex flex-col bg-background/50 min-h-0">
        <div className="flex flex-col md:flex-row items-center gap-6 max-w-4xl mx-auto w-full">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
            <Input 
              placeholder="Search semantic knowledge clusters..." 
              className="pl-12 h-14 bg-card border-border/50 rounded-2xl shadow-xl focus:ring-2 focus:ring-blue-500/20 text-base font-medium placeholder:text-muted-foreground/40"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="border-border/50 h-14 px-8 bg-card shadow-xl hover:bg-muted dark:hover:bg-muted/50 text-muted-foreground font-bold text-xs uppercase tracking-widest rounded-2xl">
            <Filter className="size-4 mr-3" />
            Refine Topology
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <div className="max-w-7xl mx-auto pb-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredBooks.map((book, i) => (
                        <motion.div
                          key={book.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                            <Card className="border-border/50 shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 group bg-card border rounded-[2.5rem] flex flex-col overflow-hidden h-full">
                                <CardHeader className="p-8 pb-4">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="size-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 border border-blue-500/20 shadow-inner ring-4 ring-blue-500/5">
                                            <BookMarked className="size-7" />
                                        </div>
                                        <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest text-muted-foreground border-border/50 px-3 py-1 bg-muted/20">
                                            V-REF: {book.id.slice(0, 8)}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-2xl font-heading font-bold tracking-tight text-foreground group-hover:text-blue-500 transition-colors leading-tight mb-1">{book.title}</CardTitle>
                                    <div className="flex items-center gap-2">
                                        <div className="size-5 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground">JS</div>
                                        <CardDescription className="text-muted-foreground font-semibold text-xs tracking-tight">{book.author}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 py-4 space-y-6 flex-1">
                                    <p className="text-sm text-foreground/70 line-clamp-4 leading-relaxed font-medium">
                                        {book.content}
                                    </p>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {book.topics.map((topic, i) => (
                                            <Badge key={i} variant="secondary" className="bg-muted text-muted-foreground/60 border border-border/50 hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/20 text-[9px] py-1 px-3 font-black uppercase tracking-widest transition-all duration-300 rounded-lg">
                                                {topic}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                                <CardFooter className="p-8 pt-6 border-t border-border bg-muted/20">
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center text-[9px] text-muted-foreground gap-2 font-black uppercase tracking-[0.15em] opacity-60">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-xl shadow-emerald-500/30" />
                                            Indexed • AWS S3
                                        </div>
                                        <Button variant="link" className="h-auto p-0 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:no-underline group-hover:translate-x-1 transition-transform duration-300">
                                            Explore Nodes
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function Button({ children, className, variant, ...props }: any) {
    const variants: any = {
        outline: "border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900",
        link: "text-blue-500 hover:underline"
    }

    return (
        <button className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 ${variants[variant] || ''} ${className}`} {...props}>
            {children}
        </button>
    )
}
