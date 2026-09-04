import type { Moment } from 'moment'

import type { Tenant } from '../../types/tenant'
import type { FlightTimelineItem } from '../../types/timeline'
import { TenantDetails } from '../tenant/TenantDetails'

import { FlightTimeline } from './FlightTimeline'
import { TimelineHints } from './TimelineHints'
import { TimelineRangeControls } from './TimelineRangeControls'

type FlightTimelineSectionProps = {
  tenant: Tenant | undefined
  rangeStart: string
  rangeEnd: string
  visibleStart: Moment
  visibleEnd: Moment
  aircraftGroups: { id: number; title: string }[]
  timelineItems: FlightTimelineItem[]
  onRangeStartChange: (value: string) => void
  onRangeEndChange: (value: string) => void
  onTimeChange: (start: number, end: number) => void
}

export function FlightTimelineSection({
  tenant,
  rangeStart,
  rangeEnd,
  visibleStart,
  visibleEnd,
  aircraftGroups,
  timelineItems,
  onRangeStartChange,
  onRangeEndChange,
  onTimeChange
}: FlightTimelineSectionProps) {
  return (
    <section className="glass-panel flex min-h-[68vh] w-full min-w-0 flex-1 flex-col rounded-[1.5rem] p-5">
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-50">Flight timeline</h2>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
            Aircraft schedule
          </p>
        </div>

        <TimelineRangeControls
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          onRangeStartChange={onRangeStartChange}
          onRangeEndChange={onRangeEndChange}
        />
      </div>

      <TimelineHints visibleStart={visibleStart} visibleEnd={visibleEnd} />

      <FlightTimeline
        aircraftGroups={aircraftGroups}
        timelineItems={timelineItems}
        visibleStart={visibleStart}
        visibleEnd={visibleEnd}
        onTimeChange={onTimeChange}
      />

      <TenantDetails tenant={tenant} />

      <div className="mt-5 flex flex-wrap gap-3">
        <button className="primary-button rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-2.5 font-semibold text-white shadow-[0_12px_35px_rgba(59,130,246,0.35)] transition hover:brightness-110">
          Generate plan
        </button>
        <button className="secondary-button rounded-xl border border-slate-600/80 bg-slate-950/60 px-4 py-2.5 font-semibold text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          Save brief
        </button>
      </div>
    </section>
  )
}
