import { type ComponentProps } from 'react'
import moment, { type Moment } from 'moment'
import Timeline from 'react-calendar-timeline'

import 'react-calendar-timeline/dist/style.css'

import type { FlightTimelineItem } from '../../types/timeline'

import { FlightTimelineItemRenderer } from './FlightTimelineItem'

type FlightTimelineProps = {
  aircraftGroups: { id: number; title: string }[]
  timelineItems: FlightTimelineItem[]
  visibleStart: Moment
  visibleEnd: Moment
  onTimeChange: (start: number, end: number) => void
}

export function FlightTimeline({
  aircraftGroups,
  timelineItems,
  visibleStart,
  visibleEnd,
  onTimeChange
}: FlightTimelineProps) {
  const itemRenderer = (
    props: Parameters<NonNullable<ComponentProps<typeof Timeline>['itemRenderer']>>[0]
  ) => {
    const { item, getItemProps } = props
    return (
      <FlightTimelineItemRenderer item={item as FlightTimelineItem} getItemProps={getItemProps} />
    )
  }

  return (
    <div className="timeline-modern overflow-hidden rounded-[1.25rem] border border-slate-700/80 bg-slate-950/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <Timeline
        groups={aircraftGroups}
        items={timelineItems}
        visibleTimeStart={visibleStart.valueOf()}
        visibleTimeEnd={visibleEnd.valueOf()}
        onTimeChange={onTimeChange}
        itemRenderer={itemRenderer}
        lineHeight={72}
        sidebarWidth={170}
        sidebarContent={
          <div className="flex h-full items-center justify-center text-[10px] font-medium uppercase tracking-[0.24em] text-slate-400">
            Aircraft
          </div>
        }
        itemHeightRatio={0.88}
        canMove={false}
        canResize={false}
        stackItems
        dragSnap={60 * 60 * 1000}
        timeSteps={{ second: 0, minute: 60, hour: 1, day: 1, month: 1, year: 1 }}
        defaultTimeStart={moment().subtract(6, 'hours').valueOf()}
        defaultTimeEnd={moment().add(18, 'hours').valueOf()}
      />
    </div>
  )
}
