import { SummaryProvider } from '@/contexts/SummaryContext';
import SummaryTable from '@/components/SummaryTable';
import SummaryWidgets from '@/components/SummaryWidgets';
import TinybirdLogo from '@/components/Logos/TinybirdLogo';
import GitHubLogo from '@/components/Logos/GitHubLogo';

export default function Home() {
  return (
    <main className="container mx-auto p-4 min-h-screen bg-gray-900">
      <h1 className="text-2xl font-bold mb-4 text-white">{process.env.NEXT_PUBLIC_PAGE_TITLE}</h1>
      <div className="text-gray-300 mb-6">{process.env.NEXT_PUBLIC_PAGE_DESCRIPTION}</div>
      <div className="flex items-center gap-2 text-gray-300 mb-2">
        <span>Source on</span>
        <a href="https://github.com/skgsergio/tinyuptime" target="_blank" className="text-white hover:text-blue-400">
          <GitHubLogo className="h-[22px]" />
        </a>
      </div>
      <div className="flex items-center gap-2 text-gray-300 mb-6">
        <span>Powered by</span>
        <a href="https://www.tinybird.co/" target="_blank" className="text-white hover:text-parakeet">
          <TinybirdLogo className="h-[22px]" />
        </a>
      </div>
      <h2 className="text-2xl font-bold mb-4 text-white">Summary</h2>
      <SummaryProvider>
        <SummaryWidgets />
        <SummaryTable />
      </SummaryProvider>
    </main>
  );
}
