import { FC, useEffect, useState } from 'react'

interface StopwatchProps {
    timestampAtZero: Date
}

export const Stopwatch: FC<StopwatchProps> = ({ timestampAtZero }) => {
    const [value, setValue] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setValue(
                Math.max(
                    0,
                    Math.floor((new Date().getTime() - timestampAtZero.getTime()) / 1000),
                ),
            )
        }, 200)
        return () => {
            clearInterval(interval)
        }
    }, [])

    return <>{value}</>
}
