import { FC, useEffect, useState } from 'react'

import './Stopwatch.scss'

interface StopwatchProps {
    timestampAtZero: Date
    endScheduled: Date | null
    isActive: boolean
}

export const Stopwatch: FC<StopwatchProps> = ({ timestampAtZero, endScheduled, isActive }) => {
    const [stopwatchValue, setStopwatchValue] = useState(0)
    const [endGameTimer, setEndGameTimer] = useState<number | null>(null)
    let interval: NodeJS.Timeout

    useEffect(() => {
        if (isActive) {
            interval = setInterval(() => {
                setStopwatchValue(
                    Math.max(0, Math.floor((new Date().getTime() - timestampAtZero.getTime()) / 1000)),
                )
                if (endScheduled) {
                    const timeToEnd = Math.max(0, Math.floor((endScheduled.getTime() - new Date().getTime()) / 1000))
                    setEndGameTimer(timeToEnd <= 20 ? timeToEnd : null)
                }
            }, 200)
        } else {
            clearInterval(interval)
        }
        return () => {
            clearInterval(interval)
        }
    }, [isActive, endScheduled])

    return (
        <div className="stopwatch-wrapper">
            {endGameTimer !== null && <span className="end-game-timer">{endGameTimer}</span>}
            <span className="stopwatch-value">{stopwatchValue}</span>
        </div>
    )
}
