import { PlayerColor, Position } from './types/model'

export const toPositionString = ([col, row]: Position) => `(${col}, ${row})`

export const playerColorToClassName = (playerColor?: PlayerColor, prefix = '') => ({
    [prefix]: !!playerColor,
    [`${prefix}${prefix ? '-' : ''}red`]: playerColor === 'RED',
    [`${prefix}${prefix ? '-' : ''}green`]: playerColor === 'GREEN',
    [`${prefix}${prefix ? '-' : ''}blue`]: playerColor === 'BLUE',
    [`${prefix}${prefix ? '-' : ''}yellow`]: playerColor === 'YELLOW',
})

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
    ]
    return `${pickRandom(adjectives)}-${pickRandom(nouns)}-${Math.floor(Math.random() * 990 + 10)}`
}
