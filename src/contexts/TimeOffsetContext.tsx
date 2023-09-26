import { createContext, FC, PropsWithChildren, useState } from 'react'

interface TimeOffsetContextState {
    timeOffset: number
    setTimeOffset: (offset: number) => void
}

export const TimeOffsetContextProvider: FC<PropsWithChildren> = ({ children }) => {
    const [timeOffset, setTimeOffset] = useState(0)

    return (
        <TimeOffsetContext.Provider value={{ timeOffset, setTimeOffset }}>
            {children}
        </TimeOffsetContext.Provider>
    )
}

export const TimeOffsetContext = createContext<TimeOffsetContextState>({} as TimeOffsetContextState)
