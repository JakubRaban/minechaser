import { FC, useEffect, useState } from 'react'

interface StopwatchProps {
    timestampAtZero: Date
    isActive: boolean
}

export const Stopwatch: FC<StopwatchProps> = ({ timestampAtZero, isActive }) => {
    const [value, setValue] = useState(0)
    let interval: NodeJS.Timeout

    useEffect(() => {
        if (isActive) {
            interval = setInterval(() => {
                setValue(
                    Math.max(
                        0,
                        Math.floor((new Date().getTime() - timestampAtZero.getTime()) / 1000),
                    ),
                )
            }, 200)
        } else {
            clearInterval(interval)
        }
        return () => {
            clearInterval(interval)
        }
    }, [isActive])

    return <>{value}</>
}
