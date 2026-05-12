import * as React from "react"
import { motion } from "motion/react"
import { 
  BookOpen, 
  MessageSquare, 
  ShieldCheck, 
  Settings, 
  Database, 
  ChevronRight,
  BrainCircuit,
  Search,
  Sun,
  Moon
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"

export function AppSidebar({ 
  activeTab, 
  onTabChange,
  theme,
  onThemeToggle
}: { 
  activeTab: string, 
  onTabChange: (tab: string) => void,
  theme: 'light' | 'dark',
  onThemeToggle: () => void
}) {
  const items = [
    {
      title: "Knowledge Library",
      id: "library",
      icon: BookOpen,
    },
    {
      title: "Document Upload",
      id: "upload",
      icon: Database,
    },
    {
      title: "RAG Assistant",
      id: "assistant",
      icon: MessageSquare,
    },
    {
      title: "Infrastructure",
      id: "metrics",
      icon: Database,
    },
  ]

  return (
    <Sidebar className="bg-sidebar border-r border-sidebar-border">
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="size-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-xl shadow-blue-900/20 ring-1 ring-white/20">
            AI
          </div>
          <h1 className="text-white font-heading font-semibold tracking-tight text-lg">Enterprise AI</h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase font-bold text-sidebar-foreground/40 mb-3 px-3 tracking-widest mt-4">Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    isActive={activeTab === item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`h-11 flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 ${
                        activeTab === item.id 
                        ? "bg-white/10 text-white font-semibold shadow-inner ring-1 ring-white/10" 
                        : "text-sidebar-foreground/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <item.icon className={`size-4.5 ${activeTab === item.id ? 'text-blue-400' : ''}`} />
                    <span className="text-sm tracking-tight">{item.title}</span>
                    {activeTab === item.id && (
                      <motion.div 
                        layoutId="active-indicator"
                        className="ml-auto w-1 h-4 bg-blue-500 rounded-full" 
                      />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="text-[10px] uppercase font-bold text-slate-500 mb-2 px-3 tracking-wider">Cloud Services</SidebarGroupLabel>
            <div className="px-5 space-y-3 pt-2">
                <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">AWS Status</span>
                    <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Online
                    </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Gemini Pro</span>
                    <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Active
                    </span>
                </div>
            </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-5 bg-black/20 border-t border-sidebar-border">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="size-9 shrink-0 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center text-white font-bold text-xs uppercase cursor-pointer hover:from-slate-600 hover:to-slate-700 transition-all">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-white font-semibold truncate leading-tight transition-colors">Admin Profile</p>
              <p className="text-[10px] text-sidebar-foreground/40 uppercase font-bold tracking-tighter mt-0.5">us-east-1 • stable</p>
            </div>
          </div>
          <button 
            onClick={onThemeToggle}
            className="size-8 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-xl"
            title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === 'light' ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
          </button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
