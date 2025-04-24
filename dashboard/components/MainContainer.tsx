'use client';

export function MainContainer({ children }: { children: React.ReactNode }) {
  return (
    <main className="container mx-auto p-4 min-h-screen">
      {children}
    </main>
  );
}