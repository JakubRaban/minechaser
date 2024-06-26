import { FC, useEffect, useRef, useState } from 'react'
import { Cell, GameState, Player, PlayerColor, PlayerColorMapping } from '../../types/model'
import { PlayerColor as PlayerColorComponent } from '../lib/PlayerColor/PlayerColor'
import cn from 'classnames'
import { MineIcon } from '../../icons/Mine/MineIcon'
import { dateDiff, pickRandom, readableTime } from '../../helpers'
import { Link } from 'react-router-dom'
import { useParams } from 'react-router'
import { PrivateGameLoading, ShareDialog } from '../lazy-components'
import { usePreload } from '../../hooks/usePreload'
import { usePreferences } from '../../hooks/context/usePreferences'
import applause from '/sounds/applause.wav'

import './GameSummary.scss'

interface GameSummaryProps {
    gameState: GameState
    colorMapping: PlayerColorMapping
    playerColor: PlayerColor
    isPrivate: boolean
    isSinglePlayer: boolean
}

const standingsMapping: Record<number, { emoji: string; text: string }> = {
    1: { emoji: '🥇', text: '1st' },
    2: { emoji: '🥈', text: '2nd' },
    3: { emoji: '🥉', text: '3rd' },
    4: { emoji: '4', text: '4th' },
}

const greetings = [
    'Very well done',
    'Good job',
    'Way to go',
    'What a game',
    'You\'re nailing it',
    'You\'re on fire',
]

const firstPlaceDead = [
    'But you didn\'t stay alive',
    'It would be better if you stayed alive though',
    'Not alive though',
    'If only you were alive',
    'It\'s a pity you didn\'t stay alive',
]

type RankedPlayer = Player & { ranking: number }

const getRankedPlayers = (gameState: GameState, gameTimeout: boolean) => {
    const positions: Record<number, number> = {}
    const players = Object.entries(gameState.game.players) as [PlayerColor, RankedPlayer][]
    players.sort(([, player1], [, player2]) => (player2.score - ((player2.alive || gameTimeout) ? 0 : 10000)) - (player1.score - ((player1.alive || gameTimeout) ? 0 : 10000)))
    players.forEach(([, player], index) => {
        const ranking = positions[player.score] ?? index + 1
        player.ranking = ranking
        positions[player.score] = ranking
    })
    return players
}

const GameSummary: FC<GameSummaryProps> = ({ gameState, colorMapping, playerColor, isPrivate, isSinglePlayer }) => {
    const { gameId } = useParams()
    const playAgainLink = isSinglePlayer ? '/new-game/single-player' : isPrivate ? '/new-game' : '/queue'
    const playAgainState = isPrivate ? { restartedGameId: gameId } : undefined

    const gameTimeout = gameState.end! >= gameState!.endScheduled!
    const players = getRankedPlayers(gameState, gameTimeout)

    const { alive: currentPlayerAlive, score: currentPlayerScore } = gameState.game.players[playerColor]!
    const currentPlayerName = colorMapping[playerColor]!
    const currentPlayerStanding = players.find(([color]) => color === playerColor)![1].ranking

    const { initialMines, minesLeft, dims } = gameState.game.board
    const minesFlagged = initialMines - minesLeft - players.reduce((acc, [, player]) => !player.alive ? acc + 1 : acc, 0)
    const uncoveredCells = Object.values(gameState.game.board.cells).reduce((acc: number, cell: Cell) => cell.isUncovered && !cell.hasMine ? acc + 1 : acc, 0)
    const totalCells = dims[0] * dims[1]
    
    const [shareDialogOpen, setShareDialogOpen] = useState(false)

    const [animationStopped, setAnimationStopped] = useState(false)
    const pickedGreetings = useRef(pickRandom(greetings))
    const pickedFirstPlaceDead = useRef(pickRandom(firstPlaceDead))

    const { disableSoundEffects } = usePreferences()
    usePreload(ShareDialog)

    useEffect(() => {
        if (isPrivate) {
            PrivateGameLoading.preload()
        }
    }, [isPrivate])

    useEffect(() => {
        if (!disableSoundEffects && !gameTimeout && currentPlayerStanding === 1 && currentPlayerAlive) {
            new Audio(applause).play()
        }
    }, [])

    return (
        <div className={cn('game-summary', { 'single-player': isSinglePlayer, 'no-animation': animationStopped })} onClick={() => setAnimationStopped(true)}>
            <h1>Game Summary</h1>
            <h3>
                {!isSinglePlayer ? <>You finished in the <span>{standingsMapping[currentPlayerStanding].text}</span> place </> : <>You finished the game </>}
                with <span>{currentPlayerScore} points</span>.
                {!isSinglePlayer && currentPlayerStanding === 1 && !gameTimeout && (
                    <>&nbsp;{currentPlayerAlive ? `${pickedGreetings.current}!`: `${pickedFirstPlaceDead.current}...`}</>
                )}
            </h3>
            <div className="action-buttons">
                <Link to={playAgainLink} state={playAgainState}><button>Play Again{isPrivate && <> (with same players)</>}{isSinglePlayer && <> (single player)</>}</button></Link>
                {isSinglePlayer && <Link to="/queue"><button>Play again (with other players)</button></Link>}
                <Link to="/"><button className="outline">Back to Main Menu</button></Link>
                <button className="outline" onClick={() => setShareDialogOpen(true)}>Share</button>
            </div>
            <div className="mobile-horizontal-container">
                <div className="stats">
                    <table>
                        <tbody>
                            {players.map(([playerColor, player]) => (
                                <tr key={playerColor} className={cn({ dead: !player.alive && !gameTimeout && players.some(([, p]) => p.alive) })}>
                                    <td>{standingsMapping[player.ranking].emoji}</td>
                                    <td className="color-cell"><PlayerColorComponent color={playerColor} /></td>
                                    <td className={cn('name-cell', { current: colorMapping[playerColor] === currentPlayerName })}>{colorMapping[playerColor]}</td>
                                    {players.some(([, p]) => !p.alive) && !gameTimeout && (
                                        <td className="dead-cell">
                                            <div className={cn('dead-indicator', { alive: player.alive })}>
                                                <MineIcon />
                                            </div>
                                        </td>
                                    )}
                                    <td className="score-cell">{player.score}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <table className="general-stats">
                    <tbody>
                        <tr>
                            <td>Game Time</td>
                            <td>{readableTime(dateDiff(gameState.end!, gameState.start!).seconds)}</td>
                        </tr>
                        <tr>
                            <td>Mines Flagged</td>
                            <td>{minesFlagged}/{initialMines} <span className="percent">({Math.floor(minesFlagged / initialMines * 100)}%)</span></td>
                        </tr>
                        <tr>
                            <td>Cells Uncovered</td>
                            <td>
                                {uncoveredCells}/{totalCells - initialMines} <span className="percent">({Math.floor(uncoveredCells / (totalCells - initialMines) * 100)}%)</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <ShareDialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} />
        </div>
    )
}

export default GameSummary
