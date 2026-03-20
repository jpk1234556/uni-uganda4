import type { ReactNode } from "react";

interface AdminLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export default function AdminLayout({ sidebar, children }: AdminLayoutProps) {
  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-50 overflow-hidden">
      {/* Sidebar fixed on the left */}
      <div className="w-64 flex-shrink-0 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col h-full overflow-y-auto custom-scrollbar">
        {sidebar}
      </div>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50/50 flex flex-col relative w-full custom-scrollbar">
        {children}
      </main>
    </div>
  );
}
