import TinybirdLogo from '@/components/Icons/TinybirdLogo';
import GitHubLogo from '@/components/Icons/GitHubLogo';
import SummaryTable from '@/components/SummaryTable';
import SummaryWidgets from '@/components/SummaryWidgets';
import CheckStatusWidgets from '@/components/CheckStatusWidgets';
import PageRefresh from '@/components/PageRefresh';

export default function Home() {
  return (
    <main className="container mx-auto p-4 min-h-screen">
      <div className="text-center mb-2">
        <PageRefresh />
      </div>
      <h1 className="text-2xl font-bold mb-4 text-white">{process.env.NEXT_PUBLIC_PAGE_TITLE}</h1>
      <div className="mb-6">{process.env.NEXT_PUBLIC_PAGE_DESCRIPTION}</div>
      <div className="flex items-center gap-2 mb-2">
        <span>Source on</span>
        <a href="https://github.com/skgsergio/tinyuptime" target="_blank" className="text-white hover:text-blue-400">
          <GitHubLogo className="h-[22px]" />
        </a>
      </div>
      <div className="flex items-center gap-2 mb-6">
        <span>Powered by</span>
        <a href="https://www.tinybird.co/" target="_blank" className="text-white hover:text-parakeet">
          <TinybirdLogo className="h-[22px]" />
        </a>
      </div>
      <h2 className="text-2xl font-bold mb-4 text-white">Summary</h2>
      <div className="mb-6">
        <SummaryWidgets />
        <SummaryTable />
      </div>
      <h2 className="text-2xl font-bold mb-4 text-white">Check Status</h2>
      <div className="mb-6">
        <CheckStatusWidgets />
      </div>
    </main>
  );
}
