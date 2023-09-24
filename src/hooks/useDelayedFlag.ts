import { useEffect, useState } from 'react'

export const useDelayedFlag = (delay: number) => {
    const [firstFlag, setFirstFlag] = useState(false)
    const [secondFlag, setSecondFlag] = useState(false)
    
    useEffect(() => {
        let timeout: NodeJS.Timeout
        if (firstFlag) {
            setTimeout(() => {
                setSecondFlag(true)
            }, delay)
        }
        return () => clearTimeout(timeout)
    }, [firstFlag])
    
    return [firstFlag, secondFlag, () => setFirstFlag(true)] as const
}
