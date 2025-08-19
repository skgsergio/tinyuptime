import { MainContainer } from "@/components/MainContainer";

import TinybirdLogo from "@/components/Icons/TinybirdLogo";
import GitHubLogo from "@/components/Icons/GitHubLogo";

import PageRefresh from "@/components/PageRefresh";

import { SummaryDataProvider } from "@/contexts/SummaryDataContext";
import SummaryTable from "@/components/SummaryTable";
import SummaryWidgets from "@/components/SummaryWidgets";
import SummaryGraph from "@/components/SummaryGraph";
import ErrorsTable from "@/components/ErrorsTable";
import { TimerProvider } from "@/contexts/TimerContext";

export default function Home() {
  return (
    <MainContainer>
      <h1 className="text-2xl font-bold mb-4 text-white">
        {process.env.NEXT_PUBLIC_PAGE_TITLE}
      </h1>

      <div className="mb-6">{process.env.NEXT_PUBLIC_PAGE_DESCRIPTION}</div>

      <div className="flex items-center gap-2 mb-2">
        <span>Source on</span>
        <a
          href="https://github.com/skgsergio/tinyuptime"
          target="_blank"
          className="text-white hover:text-blue-400"
        >
          <GitHubLogo className="h-[22px]" />
        </a>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <span>Powered by</span>
        <a
          href="https://www.tinybird.co/"
          target="_blank"
          className="text-white hover:text-parakeet"
        >
          <TinybirdLogo className="h-[22px]" />
        </a>
      </div>

      <TimerProvider interval={5 * 60 * 1000}>
        <h2 className="text-2xl font-bold mb-4 text-white">Summary</h2>

        <SummaryDataProvider>
          <SummaryWidgets />
          <SummaryTable />
        </SummaryDataProvider>

        <SummaryGraph />

        <h2 className="text-2xl font-bold mb-4 text-white">Last Errors</h2>

        <ErrorsTable />

        <PageRefresh />
      </TimerProvider>
    </MainContainer>
  );
}
