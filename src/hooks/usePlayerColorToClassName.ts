import { PlayerColor } from '../types/model'
import { useSettings } from './useSettings'

export const usePlayerColorToClassName = (prefix = '') => {
    const settings = useSettings()
    
    return (playerColor?: PlayerColor) => ({
        [prefix]: !!playerColor,
        red: playerColor === 'RED',
        green: playerColor === 'GREEN',
        blue: playerColor === 'BLUE',
        yellow: playerColor === 'YELLOW',
        colorblind: settings.colorBlindMode,
    })
}
