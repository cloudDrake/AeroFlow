type TimelineRangeControlsProps = {
  rangeStart: string
  rangeEnd: string
  onRangeStartChange: (value: string) => void
  onRangeEndChange: (value: string) => void
}

export function TimelineRangeControls({
  rangeStart,
  rangeEnd,
  onRangeStartChange,
  onRangeEndChange
}: TimelineRangeControlsProps) {
  return (
    <div className="toolbar-panel flex flex-wrap items-center gap-2 rounded-2xl border border-slate-700/80 bg-slate-950/60 p-2">
      <label
        htmlFor="range-start"
        className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.18em] text-slate-400"
      >
        <span>From</span>
        <input
          id="range-start"
          type="datetime-local"
          value={rangeStart}
          onChange={event => onRangeStartChange(event.target.value)}
          className="modern-input rounded-xl border border-slate-600/80 bg-slate-950 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-blue-400"
        />
      </label>
      <label
        htmlFor="range-end"
        className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.18em] text-slate-400"
      >
        <span>To</span>
        <input
          id="range-end"
          type="datetime-local"
          value={rangeEnd}
          onChange={event => onRangeEndChange(event.target.value)}
          className="modern-input rounded-xl border border-slate-600/80 bg-slate-950 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-blue-400"
        />
      </label>
    </div>
  )
}
