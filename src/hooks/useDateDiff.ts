import { useTimeOffset } from './context/useTimeOffset'
import { useCallback } from 'react'

export const useDateDiff = () => {
    const { timeOffset } = useTimeOffset()

    return useCallback((serverDate: Date, clientDate: Date) => {
        const realClientTime = clientDate.getTime() + timeOffset
        const serverTime = serverDate.getTime()
        const diff = Math.max(0, realClientTime > serverTime ? realClientTime - serverTime : serverTime - realClientTime)
        return {
            seconds: Math.ceil(diff / 1000),
            millis: diff,
        }
    }, [timeOffset])
}
