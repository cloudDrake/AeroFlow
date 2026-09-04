import type { Moment } from 'moment'

import { formatShortDate } from '../../lib/format'

type TimelineHintsProps = {
  visibleStart: Moment
  visibleEnd: Moment
}

export function TimelineHints({ visibleStart, visibleEnd }: TimelineHintsProps) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3 text-xs text-slate-300">
      <span>Drag to pan</span>
      <span>Scroll to zoom</span>
      <span className="rounded-full border border-slate-700/80 bg-slate-950/50 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">
        {formatShortDate(visibleStart.toDate())} → {formatShortDate(visibleEnd.toDate())}
      </span>
    </div>
  )
}
