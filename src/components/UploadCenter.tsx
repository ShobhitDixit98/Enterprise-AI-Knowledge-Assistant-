import * as React from 'react';
import { Upload, FileText, Image as ImageIcon, FileCode, CheckCircle2, Loader2, Trash2, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  status: 'processing' | 'indexed';
  content?: string;
  previewUrl?: string;
}

export default function UploadCenter() {
  const [files, setFiles] = React.useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [viewingFile, setViewingFile] = React.useState<UploadedFile | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    let incomingFiles: File[] = [];
    if ('files' in e.target && e.target.files) {
      incomingFiles = Array.from(e.target.files);
    } else if ('dataTransfer' in e && e.dataTransfer.files) {
      incomingFiles = Array.from(e.dataTransfer.files);
    }

    if (incomingFiles.length === 0) return;

    incomingFiles.forEach(file => {
      const newFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        status: 'processing',
        content: `Simulated extracted content for ${file.name}. This text would be chunked and sent to Pinecone in a real production environment...`,
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      };

      setFiles(prev => [newFile, ...prev]);

      // Real Backend Processing & Vector Indexing
      fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: file.name,
          content: newFile.content,
          type: file.type || 'text/plain'
        })
      })
      .then(res => res.json())
      .then(indexedDoc => {
        setFiles(prev => prev.map(f => 
          f.id === newFile.id ? { ...f, id: indexedDoc.id, status: 'indexed' } : f
        ));
        toast.success(`${file.name} successfully indexed in Pinecone`);
      })
      .catch(err => {
        toast.error(`Failed to index ${file.name}`);
        removeFile(newFile.id);
      });
    });
  };

  const removeFile = (id: string) => {
    fetch(`/api/documents/${id}`, { method: 'DELETE' })
      .then(() => {
        setFiles(prev => prev.filter(f => f.id !== id));
        toast.info("Document removed from local vector cache");
        if (viewingFile?.id === id) setViewingFile(null);
      });
  };

  return (
    <div className="flex flex-col h-full bg-background transition-colors duration-300">
      <header className="h-20 border-b border-border flex items-center justify-between px-10 shrink-0 glass z-30">
        <div className="flex items-center gap-3">
          <Upload className="size-5 text-blue-500" />
          <h2 className="text-lg font-heading font-semibold tracking-tight text-foreground">Document Ingestion</h2>
        </div>
        <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-1 font-bold text-[10px] uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                Neural Pipeline: Online
            </Badge>
        </div>
      </header>

      <div className="flex-1 p-10 overflow-hidden flex gap-10 min-h-0">
        {/* Left Side: Upload Zone & List */}
        <div className="flex-1 flex flex-col gap-10">
          <motion.div 
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileUpload}
            className={`
              relative border-2 border-dashed rounded-3xl p-16 transition-all duration-300 text-center group cursor-pointer
              ${isDragging ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 shadow-2xl' : 'border-border bg-muted/20 hover:bg-muted/40 hover:border-blue-500/30 shadow-inner'}
            `}
          >
            <input 
              type="file" 
              multiple 
              onChange={handleFileUpload} 
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            <div className="size-20 rounded-2xl bg-background border border-border shadow-xl flex items-center justify-center mx-auto mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Upload className="size-10 text-blue-500" />
            </div>
            <h3 className="text-2xl font-heading font-bold text-foreground">Extract Knowledge</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
              Sync enterprise documents to your vector index. Support for PDF, MD, and specialized technical logs.
            </p>
            <Button variant="outline" className="mt-8 border-border rounded-xl px-10 h-10 font-bold text-xs uppercase tracking-widest bg-background hover:bg-muted shadow-sm">
              Select Assets
            </Button>
          </motion.div>

          <div className="flex-1 flex flex-col min-h-0">
            <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.2em] mb-6 flex items-center gap-2">
                <div className="w-8 h-[1px] bg-border" />
                Ingestion Queue
            </h4>
            <div className="flex-1 overflow-y-auto pr-4 -mr-4 custom-scrollbar">
              <div className="space-y-4">
                {files.length === 0 && (
                  <div className="py-20 text-center border-2 border-dashed rounded-3xl border-border bg-muted/5">
                    <p className="text-sm font-medium text-muted-foreground">Neural buffer is currently empty</p>
                  </div>
                )}
                <AnimatePresence mode="popLayout">
                  {files.map(file => (
                    <motion.div
                      key={file.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`group border border-border/50 rounded-2xl p-5 flex items-center gap-5 transition-all duration-300 hover:shadow-2xl hover:border-blue-500/30 ${viewingFile?.id === file.id ? 'bg-blue-500/5 border-blue-500/50 ring-1 ring-blue-500/20' : 'bg-card hover:bg-muted/30'}`}
                    >
                      <div className="size-12 rounded-xl bg-background border border-border flex items-center justify-center text-muted-foreground group-hover:text-blue-500 transition-colors shadow-sm">
                        {file.type.includes('image') ? <ImageIcon className="size-6" /> : <FileText className="size-6" />}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-foreground truncate mb-0.5">{file.name}</p>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[8px] bg-muted tracking-widest uppercase font-black px-1.5 py-0 h-4">{file.type.split('/')[1]}</Badge>
                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter opacity-60">{file.size}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {file.status === 'processing' ? (
                          <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground bg-muted/50 border border-border px-3 py-1.5 rounded-xl">
                            <Loader2 className="size-3 animate-spin text-blue-500" />
                            INDEXING
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-800">
                            <CheckCircle2 className="size-3 text-emerald-500" />
                            COMPLETED
                          </div>
                        )}
                        <div className="flex items-center bg-muted/30 rounded-xl border border-border p-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background" onClick={() => setViewingFile(file)}>
                            <Eye className="size-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-background" onClick={() => removeFile(file.id)}>
                            <Trash2 className="size-4" />
                            </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Preview */}
        <div className="w-[500px] bg-card border border-border rounded-3xl flex flex-col shadow-2xl overflow-hidden glass">
          <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                <FileCode className="size-4 text-blue-500" />
                Asset Inspection
            </h3>
            {viewingFile && <Badge variant="outline" className="text-[10px] font-mono border-border bg-background px-3">{viewingFile.id}</Badge>}
          </div>
          <div className="flex-1 p-8 overflow-auto">
            {viewingFile ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div>
                  <h4 className="text-2xl font-heading font-bold text-foreground tracking-tight leading-tight">{viewingFile.name}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded">Strategy: Neural_Heuristic_V3</span>
                  </div>
                </div>
                
                {viewingFile.previewUrl && (
                  <div className="rounded-2xl overflow-hidden border border-border shadow-2xl ring-4 ring-muted/20">
                    <img src={viewingFile.previewUrl} alt="Preview" className="w-full h-auto" />
                  </div>
                )}

                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2 text-[10px] uppercase font-black text-muted-foreground tracking-[0.15em]">
                          <FileCode className="size-3.5 text-blue-500" /> Normalization Output
                       </div>
                       <Badge variant="outline" className="text-[8px] opacity-60">UTF-8</Badge>
                   </div>
                   <div className="bg-background/80 border border-border p-6 rounded-2xl text-xs md:text-sm text-foreground/80 leading-relaxed font-mono whitespace-pre-wrap min-h-[400px] shadow-inner">
                      {viewingFile.content}
                   </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center px-10">
                 <div className="size-24 rounded-[2.5rem] bg-muted/30 border border-border flex items-center justify-center mb-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-500/20 group-hover:h-full transition-all duration-700" />
                    <Eye className="size-10 text-muted-foreground/20 group-hover:text-blue-500/40 transition-colors duration-500 relative z-10" />
                 </div>
                 <h4 className="text-lg font-heading font-bold text-foreground mb-2">Neural Asset Preview</h4>
                 <p className="text-sm text-muted-foreground leading-relaxed">Selecting an entity from the ingestion queue will reveal its extracted neural nodes and indexing path.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
