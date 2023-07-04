import { FC } from 'react'
import { useParams } from 'react-router'

export const Game: FC = () => {
    const { gameId } = useParams()
    
    return (
        <div>Game {gameId}</div>
    )
}
