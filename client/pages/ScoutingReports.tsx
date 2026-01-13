import { MainLayout } from "@/components/MainLayout";

export function ScoutingReports() {
  return (
    <MainLayout>
      <div className="max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            Scouting Reports
          </h1>
          <p className="text-neutral-600">
            Analyze opponents and generate detailed scouting insights
          </p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center">
          <h2 className="text-xl font-semibold text-black mb-4">
            Scouting Module
          </h2>
          <p className="text-neutral-600 mb-6">
            This section will include opponent selection, auto-generated scouting
            reports, and player tendency analysis.
          </p>
          <div className="inline-block bg-brown text-white px-6 py-2 rounded cursor-pointer hover:bg-brown-light transition-colors">
            Coming Soon
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
