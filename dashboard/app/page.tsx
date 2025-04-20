import SummaryTable from '@/components/SummaryTable';
import SummaryWidgets from '@/components/SummaryWidgets';
import { SummaryProvider } from '@/contexts/SummaryContext';

export default function Home() {
  return (
    <main className="container mx-auto p-4 min-h-screen bg-gray-900">
      <h1 className="text-2xl font-bold mb-4 text-white">{process.env.NEXT_PUBLIC_PAGE_TITLE}</h1>
      <div className="text-gray-300 mb-6">{process.env.NEXT_PUBLIC_PAGE_DESCRIPTION}</div>
      <h2 className="text-2xl font-bold mb-4 text-white">Summary</h2>
      <SummaryProvider>
        <SummaryWidgets />
        <SummaryTable />
      </SummaryProvider>
    </main>
  );
}
