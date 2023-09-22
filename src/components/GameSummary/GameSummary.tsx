import { FC } from 'react'
import { Cell, GameState, Player, PlayerColor, PlayerColorMapping } from '../../types/model'
import { PlayerColor as PlayerColorComponent } from '../lib/PlayerColor/PlayerColor'
import cn from 'classnames'
import { MineIcon } from '../../icons/Mine/MineIcon'
import { dateDiff, pickRandom, readableTime } from '../../helpers'
import { Link } from 'react-router-dom'

import './GameSummary.scss'

interface GameSummaryProps {
    gameState: GameState
    colorMapping: PlayerColorMapping
    playerColor: PlayerColor
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
    'But you died',
    'But you\'re dead',
    'You\'re dead though',
    'If only you were alive',
    'It\'s a pity you died',
]

export const GameSummary: FC<GameSummaryProps> = ({ gameState, colorMapping, playerColor }) => {
    const players = Object.entries(gameState.game.players) as [PlayerColor, Player][]
    players.sort(([, player1], [, player2]) => (player2.score - (player2.alive ? 0 : 10000)) - (player1.score - (player1.alive ? 0 : 10000)))

    const currentPlayerName = colorMapping[playerColor]!
    const currentPlayerStanding = players.findIndex(([p]) => p === playerColor) + 1

    const { initialMines, minesLeft, dims } = gameState.game.board
    const minesFlagged = initialMines - minesLeft

    const uncoveredCells = Object.values(gameState.game.board.cells).reduce((acc: number, cell: Cell) => cell.isUncovered ? acc + 1 : acc, 0)
    const totalCells = dims[0] * dims[1]

    return (
        <div className="game-summary">
            <h1>Game Summary</h1>
            <h3>
                You finished in the <span>{standingsMapping[currentPlayerStanding].text}</span> place
                with <span>{gameState.game.players[playerColor]!.score} points</span>.
                {currentPlayerStanding === 1 && (
                    <>&nbsp;{gameState.game.players[playerColor]!.alive ? `${pickRandom(greetings) }!`: `${pickRandom(firstPlaceDead)}...`}</>
                )}
            </h3>
            <div className="stats">
                <table>
                    {/*<thead>*/}
                    {/*    <tr>*/}
                    {/*        <th />*/}
                    {/*        <th />*/}
                    {/*        <th />*/}
                    {/*        <th />*/}
                    {/*        <th />*/}
                    {/*    </tr>*/}
                    {/*</thead>*/}
                    <tbody>
                        {players.map(([playerColor, player], i) => (
                            <tr key={playerColor} className={cn({ dead: !player.alive && players.some(([, p]) => p.alive) })}>
                                <td>{standingsMapping[i + 1].emoji}</td>
                                <td className="color-cell"><PlayerColorComponent color={playerColor} /></td>
                                <td className={cn('name-cell', { current: colorMapping[playerColor] === currentPlayerName })}>{colorMapping[playerColor]}</td>
                                {players.some(([, p]) => !p.alive) && (
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
                <button className="show-more outline">&gt;</button>
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
                        <td>{uncoveredCells}/{totalCells} <span className="percent">({Math.floor(uncoveredCells / totalCells * 100)}%)</span></td>
                    </tr>
                </tbody>
            </table>
            <div className="action-buttons">
                <Link to="/queue"><button>Play Again</button></Link>
                <Link to="/"><button className="outline">Back to Main Menu</button></Link>
                <button className="outline">Share</button>
            </div>
        </div>
    )
}
