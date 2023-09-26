import { useTimeOffset } from './context/useTimeOffset'
import { useCallback } from 'react'

export const useDateDiff = () => {
    const { timeOffset } = useTimeOffset()

    return useCallback((laterDate: Date, earlierDate: Date) => {
        const diff = Math.max(laterDate.getTime() - earlierDate.getTime() - timeOffset, 0)
        return {
            seconds: Math.ceil(diff / 1000),
            millis: diff,
        }
    }, [timeOffset])
}
