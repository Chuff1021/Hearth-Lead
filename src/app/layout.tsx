import type { Metadata } from 'next';
import Sidebar from '@/components/Sidebar';
import './globals.css';

export const metadata: Metadata = {
  title: { default: "Aaron's Fireplace — Lead Engine", template: "%s — Aaron's Fireplace" },
  description: "Internal lead management and SEO tool for Aaron's Fireplace, Springfield MO",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex">
        <Sidebar />
        <main className="flex-1 overflow-auto pb-20 lg:pb-0">
          <div className="max-w-[1400px] mx-auto p-4 lg:p-6">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
