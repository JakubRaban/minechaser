import { useEffect } from 'react'
import { useSettings } from './useSettings'

export const usePhysicalKeyboardDetector = () => {
    const pressLog: { start: number, end?: number }[] = []

    const registerPressStart = () => pressLog.push({ start: performance.now() })
    const registerPressEnd = () => pressLog[pressLog.length - 1].end = performance.now()
    
    const { setSettings } = useSettings()
    
    const recompute = () => {
        registerPressEnd()
        const diffs = pressLog.map(p => p.end! - p.start).filter(t => !!t)
        setSettings(s => ({ 
            ...s, 
            showOnScreenControls: diffs.reduce((acc, curr) => acc + curr) / diffs.length < 25,
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
