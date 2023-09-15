import { useEffect } from 'react'
import { useSettings } from './useSettings'

export const usePhysicalKeyboardDetector = () => {
    const pressLog: { start: number, end?: number }[] = []

    const registerPressStart = () => pressLog.push({ start: performance.now() })
    const registerPressEnd = () => pressLog[pressLog.length - 1].end = performance.now()
    
    const { setSettings } = useSettings()
    
    const recompute = () => {
        registerPressEnd()
        console.log(pressLog.map(l => l.end! - l.start))
        setSettings(s => ({ 
            ...s, 
            showOnScreenControls: pressLog.reduce((prev, curr) => prev + curr.end! - curr.start, 0) / pressLog.length < 25,
        }))
    }

    useEffect(() => {
        window.addEventListener('keydown', registerPressStart)
        window.addEventListener('keyup', recompute)
        return () => {
            window.removeEventListener('keydown', registerPressStart)
            window.removeEventListener('keyup', recompute)
        }
    }, [])
}
