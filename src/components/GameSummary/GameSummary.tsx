import { FC } from 'react'
import { GameDef } from '../../types/model'

interface GameSummaryProps {
    gameDef: GameDef
}

export const GameSummary: FC<GameSummaryProps> = ({ gameDef }) => {
    return <div>Game summary</div>
}
