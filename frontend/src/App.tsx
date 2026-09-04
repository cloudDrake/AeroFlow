import { useState } from 'react'

import { AppHeader } from './components/layout/AppHeader'
import { OperationsOverview } from './components/overview/OperationsOverview'
import { FlightTimelineSection } from './components/timeline/FlightTimelineSection'
import { useAuth } from './hooks/useAuth'
import { useFlights } from './hooks/useFlights'
import { useFlightTimeline } from './hooks/useFlightTimeline'
import { useTenants } from './hooks/useTenants'

export default function App() {
  const auth = useAuth()
  const { tenants, setTenantId, effectiveTenantId, tenant } = useTenants(auth.sessionReady)
  const { flights, selectedFlight } = useFlights(auth.sessionReady, effectiveTenantId)
  const timeline = useFlightTimeline(flights)
  const [isOverviewOpen, setIsOverviewOpen] = useState(false)

  return (
    <div className="min-h-screen space-y-6 p-5 md:p-8">
      <AppHeader
        sessionReady={auth.sessionReady}
        email={auth.email}
        password={auth.password}
        authError={auth.authError}
        tenants={tenants}
        effectiveTenantId={effectiveTenantId}
        onEmailChange={auth.setEmail}
        onPasswordChange={auth.setPassword}
        onSignIn={auth.signIn}
        onTenantChange={setTenantId}
        onToggleOverview={() => setIsOverviewOpen(value => !value)}
      />

      <main className="relative flex flex-col gap-6 xl:flex-row xl:items-start">
        <FlightTimelineSection
          tenant={tenant}
          rangeStart={timeline.rangeStart}
          rangeEnd={timeline.rangeEnd}
          visibleStart={timeline.visibleStart}
          visibleEnd={timeline.visibleEnd}
          aircraftGroups={timeline.aircraftGroups}
          timelineItems={timeline.timelineItems}
          onRangeStartChange={timeline.handleRangeStartChange}
          onRangeEndChange={timeline.handleRangeEndChange}
          onTimeChange={timeline.handleTimeChange}
        />

        {isOverviewOpen && (
          <OperationsOverview
            flights={flights}
            selectedFlight={selectedFlight}
            visibleStart={timeline.visibleStart}
            visibleEnd={timeline.visibleEnd}
            onClose={() => setIsOverviewOpen(false)}
          />
        )}
      </main>
    </div>
  )
}
