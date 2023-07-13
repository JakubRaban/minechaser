import { PlayerColor, Position } from './types/model'

export const toPositionString = ([col, row]: Position) => `(${col}, ${row})`

export const playerColorToClassName = (playerColor?: PlayerColor, prefix = '') => ({
    [prefix]: !!playerColor,
    [`${prefix}${prefix ? '-' : ''}red`]: playerColor === 'RED',
    [`${prefix}${prefix ? '-' : ''}green`]: playerColor === 'GREEN',
    [`${prefix}${prefix ? '-' : ''}blue`]: playerColor === 'BLUE',
    [`${prefix}${prefix ? '-' : ''}yellow`]: playerColor === 'YELLOW',
})
