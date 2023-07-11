import { PlayerColor, Position } from './types/model'

export const toPositionString = ([col, row]: Position) => `(${col}, ${row})`

export const playerColorToClassName = (playerColor?: PlayerColor, prefix = '') => ({
    [prefix]: !!playerColor,
    [`${prefix}-red`]: playerColor === 'RED',
    [`${prefix}-green`]: playerColor === 'GREEN',
    [`${prefix}-blue`]: playerColor === 'BLUE',
    [`${prefix}-yellow`]: playerColor === 'YELLOW',
})
