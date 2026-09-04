import type { Moment } from 'moment'
import type { TimelineItemBase } from 'react-calendar-timeline'

import type { Flight } from './flight'

export type FlightTimelineItem = TimelineItemBase<Moment> & {
  flight: Flight
}
