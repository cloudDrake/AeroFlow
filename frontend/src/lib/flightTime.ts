import moment, { type Moment } from 'moment'

export function parseFlightTime(value?: string): Moment | null {
  if (!value) {
    return null
  }

  const trimmed = value.trim()

  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(trimmed)) {
    const [hours, minutes, seconds = 0] = trimmed.split(':').map(Number)
    return moment().hours(hours).minutes(minutes).seconds(seconds).milliseconds(0)
  }

  const parsed = moment(value)
  return parsed.isValid() ? parsed : null
}
