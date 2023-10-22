import { GameDef, PlayerColor, Position } from './types/model'
import { Direction } from './components/Game/Game'

export const toPositionString = ([col, row]: Position) => `(${col}, ${row})`

export enum ErrorCode {
    full = 'full',
    notFound = 'notFound',
    alien = 'alien',
}

export const errorCodeToMessage = (errorCode: ErrorCode) => ({
    [ErrorCode.full]: 'The game you tried to join was already full',
    [ErrorCode.alien]: 'You are not in this game',
    [ErrorCode.notFound]: 'This game does not exist',
})[errorCode]

export const pickRandom = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

export const generateRandomUsername = () => {
    const adjectives = [
        'mesmerizing',
        'captivating',
        'enchanting',
        'delightful',
        'exquisite',
        'blissful',
        'serene',
        'vibrant',
        'charming',
        'euphoric',
        'astonishing',
        'magnificent',
        'fascinating',
    ]
    const nouns = [
        'empanada',
        'sushi',
        'pizza',
        'croissant',
        'taco',
        'ramen',
        'gelato',
        'samosa',
        'paella',
        'gnocchi',
        'falafel',
        'currywurst',
        'biryani',
        'pierogi',
        'ceviche',
        'fondue',
        'yassa',
    ]
    return `${pickRandom(adjectives)}-${pickRandom(nouns)}-${Math.floor(Math.random() * 990 + 10)}`
}

export const dateDiff = (date1: Date, date2: Date) => {
    const diff = Math.max(date1.getTime() - date2.getTime(), 0)
    return {
        seconds: Math.ceil(diff / 1000),
        millis: diff,
    }
}
export const rootStyle = getComputedStyle(document.documentElement)

export const readableTime = (seconds: number) => {
    const levels = [
        [Math.floor(seconds / 86400), 'd'],
        [Math.floor((seconds % 86400) / 3600), 'h'],
        [Math.floor((seconds % 86400 % 3600) / 60), 'min'],
        [seconds % 86400 % 3600 % 60, 'sec'],
    ] as [number, string][]
    let result = ''

    for (let i = 0; i < levels.length; i++) {
        if (levels[i][0]) result += ' ' + levels[i][0] + ' ' + levels[i][1]
    }
    return result.trim()
}

export const is = (size1: [number, number], size2: [number, number]) => size1[0] === size2[0] && size1[1] === size2[1]

const directionToPosition: Record<Direction, Position> = {
    UP: [-1, 0],
    DOWN: [1, 0],
    LEFT: [0, -1],
    RIGHT: [0, 1],
}

export const calculatePosition = (currentPosition: Position, props: GameDef, direction: Direction, playerColor: PlayerColor) => {
    const relativePosition = directionToPosition[direction]
    const newPosition = currentPosition.map((c, i) => {
        const res = c + relativePosition[i]
        if (res === -1) return props.dims[i] - 1
        if (res === props.dims[i]) return 0
        return res
    }) as Position
    const newPositionString = toPositionString(newPosition)
    const newCell = props.cells[newPositionString]
    return Object.entries(props.players).some(([color, player]) => (color !== playerColor && is(player.position, newPosition))) || newCell?.hasMine || newCell?.flaggingPlayer
        ? currentPosition
        : newPosition
}
