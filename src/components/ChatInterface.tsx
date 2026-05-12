import * as React from 'react';
import { Send, User, Bot, Loader2, BookMarked, ExternalLink, RefreshCw, ChevronRight, ArrowDown, BrainCircuit, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Message, Book } from '../types';
import { getAssistantResponse } from '../services/geminiService';
import { toast } from 'sonner';

export default function ChatInterface() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [indexing, setIndexing] = React.useState(false);
  const [model, setModel] = React.useState<'gemini' | 'claude' | 'openai'>('gemini');
  const [showScrollButton, setShowScrollButton] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 100;
    setShowScrollButton(!isAtBottom && messages.length > 0);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      let aiResponseContent = "";
      let contextDocs: Book[] = [];

      if (model === 'gemini') {
        const searchResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: input, model: 'gemini' }),
        });
        const result = await searchResponse.json();
        contextDocs = result.sources;
        aiResponseContent = await getAssistantResponse(input, contextDocs);
      } else {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: input, model }),
        });
        
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Failed context retrieval");
        }

        const result = await response.json();
        aiResponseContent = result.content;
        contextDocs = result.sources;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponseContent,
        sources: contextDocs,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to get response from assistant.");
    } finally {
      setLoading(false);
    }
  };

  const simulateReindexing = () => {
    setIndexing(true);
    toast.info("Connecting to Pinecone Vector Index...");
    setTimeout(() => {
      setIndexing(false);
      toast.success("Successfully synchronized 10 Knowledge Bases.");
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-background transition-colors duration-300">
      {/* Header */}
      <header className="h-20 border-b border-border flex items-center justify-between px-10 shrink-0 glass z-30">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
              <span>Platform</span>
              <span className="text-muted-foreground/30">/</span>
              <span className="text-foreground">Nexus Assistant</span>
            </div>
            <h2 className="text-lg font-heading font-semibold tracking-tight mt-0.5">Knowledge Neural Engine</h2>
          </div>
          
          <div className="h-8 w-[1px] bg-border mx-2" />
          
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl ring-1 ring-border/50">
            {(['gemini', 'claude', 'openai'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setModel(m)}
                className={`px-4 py-1.5 text-[10px] uppercase font-bold rounded-lg transition-all duration-300 ${
                  model === m 
                    ? "bg-background text-foreground shadow-lg ring-1 ring-border/50" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={simulateReindexing} 
            disabled={indexing}
            className="text-muted-foreground hover:bg-muted h-9 rounded-xl border-border/50"
          >
            {indexing ? <Loader2 className="size-4 animate-spin mr-2" /> : <RefreshCw className="size-4 mr-2" />}
            Sync Neural Index
          </Button>
          <Button className="bg-primary text-primary-foreground h-9 px-5 rounded-xl font-semibold shadow-xl shadow-primary/10 transition-all text-xs">
            Export Analytics
          </Button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 relative overflow-hidden flex flex-col min-h-0">
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-10 py-10 bg-background/50 scroll-smooth"
        >
          <div className="max-w-4xl mx-auto space-y-10">
          {messages.length === 0 && (
            <div className="text-center py-24 px-10">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="size-20 rounded-3xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/20 ring-4 ring-blue-500/10"
              >
                <BrainCircuit className="size-10 text-white" />
              </motion.div>
              <h2 className="text-4xl font-heading font-bold tracking-tight text-foreground mb-4 text-gradient">How can I assist your research?</h2>
              <p className="text-muted-foreground max-w-lg mx-auto text-lg leading-relaxed mb-12">
                Our RAG engine is currently indexed with 1.2M tokens of peer-reviewed machine learning literature.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-3xl mx-auto">
                {[
                    "What are the core concepts of Deep Learning according to Ian Goodfellow?",
                    "How does SHAP help with model interpretability?",
                    "Explain Bayesian methods from a pattern recognition perspective.",
                    "What is the difference between supervised and unsupervised learning?"
                ].map((suggestion, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card 
                        className="hover:border-blue-500/50 hover:bg-muted/30 transition-all duration-300 cursor-pointer group shadow-sm bg-card border-border/50 rounded-2xl overflow-hidden"
                        onClick={() => setInput(suggestion)}
                      >
                          <CardContent className="p-5 flex items-center justify-between">
                              <span className="text-sm font-medium text-foreground/80 leading-snug">{suggestion}</span>
                              <ChevronRight className="size-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-blue-500" />
                          </CardContent>
                      </Card>
                    </motion.div>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex gap-6 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="size-10 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 text-white shadow-lg shadow-slate-900/10 border border-slate-800">
                    <Bot className="size-5" />
                  </div>
                )}
                
                <div className={`flex flex-col gap-3 max-w-[85%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`rounded-2xl px-6 py-5 shadow-sm border leading-relaxed ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20' 
                      : 'bg-card border-border/50 text-foreground shadow-sm'
                  }`}>
                    <div className={`prose dark:prose-invert max-w-none text-sm md:text-base leading-relaxed whitespace-pre-wrap ${
                        message.role === 'user' ? 'text-primary-foreground' : 'text-foreground/90'
                    }`}>
                      {message.content}
                    </div>
                  </div>

                  {message.sources && message.sources.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest flex items-center mr-2">
                        <BookMarked className="size-3 mr-1.5" /> Verification Sources:
                      </span>
                      {message.sources.map((source, i) => (
                        <Badge key={i} variant="outline" className="text-[9px] font-bold py-0.5 px-2.5 bg-muted/30 text-blue-600 dark:text-blue-400 border-border/50 rounded-lg">
                          {source.title}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <span className="text-[9px] text-muted-foreground font-bold px-2 uppercase tracking-widest mt-1">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {message.role === 'assistant' && " • Verified Neural Response"}
                  </span>
                </div>

                {message.role === 'user' && (
                  <div className="size-10 rounded-xl bg-background border border-border flex items-center justify-center shrink-0 shadow-sm">
                    <User className="size-5 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-6"
            >
              <div className="size-10 rounded-xl bg-primary flex items-center justify-center shrink-0 text-primary-foreground shadow-lg">
                <Bot className="size-5" />
              </div>
              <div className="bg-background border border-border rounded-xl px-6 py-4 flex items-center gap-3 shadow-sm border-dashed">
                <Loader2 className="size-4 animate-spin text-blue-500" />
                <span className="text-sm text-muted-foreground font-medium italic">Synthesizing mathematical context from vector store...</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
        
        {/* Floating Scroll Button */}
        <AnimatePresence>
          {showScrollButton && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-4 right-1/2 translate-x-1/2 z-20"
            >
              <Button
                onClick={scrollToBottom}
                size="sm"
                className="rounded-full bg-background border border-border text-foreground shadow-lg hover:bg-muted px-4 h-9"
              >
                <ArrowDown className="size-4 mr-2" />
                New messages
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-10 shrink-0 bg-background border-t border-border/50">
        <div className="max-w-4xl mx-auto relative">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="relative flex items-center group"
          >
            <div className="absolute left-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors">
              <Search className="size-5" />
            </div>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Query the enterprise knowledge base..."
              className="h-16 pl-14 pr-16 rounded-2xl border-border shadow-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-base font-medium bg-muted/20 placeholder:text-muted-foreground/50"
            />
            <div className="absolute right-2 flex items-center gap-2">
                <Button 
                    type="submit" 
                    size="icon" 
                    className="h-12 w-12 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-600/20 disabled:opacity-50 transition-all font-bold"
                    disabled={!input.trim() || loading}
                >
                    {loading ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
                </Button>
            </div>
          </form>
          <div className="flex items-center justify-center gap-10 mt-6">
              <div className="flex items-center gap-2 text-[9px] uppercase font-bold text-muted-foreground tracking-widest opacity-60 hover:opacity-100 transition-opacity cursor-default">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm" />
                API Gateway
              </div>
              <div className="flex items-center gap-2 text-[9px] uppercase font-bold text-muted-foreground tracking-widest opacity-60 hover:opacity-100 transition-opacity cursor-default">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm" />
                Vector Store
              </div>
              <div className="flex items-center gap-2 text-[9px] uppercase font-bold text-muted-foreground tracking-widest opacity-60 hover:opacity-100 transition-opacity cursor-default">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm" />
                Cloud Compute
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}


