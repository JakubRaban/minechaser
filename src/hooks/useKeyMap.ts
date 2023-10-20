import { useState, useEffect } from 'react'

export const useKeyMap = () => {
    const [keyMap, setKeyMap] = useState<Record<'KeyW' | 'KeyA' | 'KeyS' | 'KeyD', string>>({
        KeyW: 'W',
        KeyA: 'A',
        KeyS: 'S',
        KeyD: 'D',
    })

    useEffect(() => {
        if (navigator.keyboard.getLayoutMap) {
            navigator.keyboard.getLayoutMap().then(layoutMap => setKeyMap(Object.fromEntries(['KeyW', 'KeyA', 'KeyS', 'KeyD'].map(key => [key, layoutMap.get(key).toUpperCase()]))))
        }
    }, [])

    return keyMap
}
