import { FC, useEffect, useRef, useState } from 'react'
import { useDateDiff } from '../../../../hooks/useDateDiff'

import './Stopwatch.scss'

interface StopwatchProps {
    timestampAtZero: Date
    endScheduled: Date | null
    isActive: boolean
}

export const Stopwatch: FC<StopwatchProps> = ({ timestampAtZero, endScheduled, isActive }) => {
    const [stopwatchValue, setStopwatchValue] = useState(0)
    const [endGameTimer, setEndGameTimer] = useState<number | null>(null)
    const interval = useRef<NodeJS.Timeout | null>(null)
    const dateDiff = useDateDiff()

    useEffect(() => {
        if (isActive) {
            interval.current = setInterval(() => {
                setStopwatchValue(dateDiff(new Date(), timestampAtZero).seconds)
                if (endScheduled) {
                    const timeToEnd = dateDiff(endScheduled, new Date()).seconds
                    setEndGameTimer(timeToEnd <= 30 ? timeToEnd : null)
                }
            }, 200)
        } else {
            clearInterval(interval.current!)
        }
        return () => {
            clearInterval(interval.current!)
        }
    }, [isActive, endScheduled])

    return (
        <div className="stopwatch-wrapper">
            {endGameTimer !== null && <span className="end-game-timer">{endGameTimer}</span>}
            <span className="stopwatch-value">{stopwatchValue}</span>
        </div>
    )
}
