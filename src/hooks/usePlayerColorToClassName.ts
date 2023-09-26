import { PlayerColor } from '../types/model'
import { usePreferences } from './context/usePreferences'

export const usePlayerColorToClassName = (prefix = '') => {
    const settings = usePreferences()
    
    return (playerColor?: PlayerColor) => ({
        [prefix]: !!playerColor,
        red: playerColor === 'RED',
        green: playerColor === 'GREEN',
        blue: playerColor === 'BLUE',
        yellow: playerColor === 'YELLOW',
        colorblind: settings.colorBlindMode,
    })
}
