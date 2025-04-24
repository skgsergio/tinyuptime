import { MainContainer } from '@/components/MainContainer';

import CheckStatusWidgets from '@/components/CheckStatusWidgets';

export default function StatusPage() {
  return (
    <MainContainer>
      <h1 className="text-2xl font-bold mb-4 text-white">Check Status</h1>
      <div className="mb-6">
        <CheckStatusWidgets />
      </div>
    </MainContainer>
  );
}
