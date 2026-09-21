import type { Metadata } from 'next';
import './globals.css';
import ParticleBackground from '@/components/ParticleBackground';

export const metadata: Metadata = {
  title: 'AI-Powered Frontend Developer | Laiba Khan',
  description: '8 Weeks Live & Recorded Masterclass by Laiba Khan. Learn AI tools, modern frontend frameworks, and build elite Web applications.',
  openGraph: {
    title: 'AI-Powered Frontend Developer | Laiba Khan',
    description: '8 Weeks Live & Recorded Masterclass. Register now.',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0d1117] text-[#f0f6fc] antialiased selection:bg-[#2dd4bf] selection:text-[#0d1117] min-h-screen relative">
        <ParticleBackground />
        <div className="relative z-10 flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
