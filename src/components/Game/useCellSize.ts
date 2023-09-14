import { Position } from '../../types/model'
import { useEffect, useState } from 'react'

export const useCellSize = (boardDimensions: Position) => {
    const [cellSize, setCellSize] = useState<number>(16)
    const [container, setContainer] = useState<HTMLDivElement | null>(null)
    const [scoreboard, setScoreboard] = useState<HTMLDivElement | null>(null)

    const onResize = () => {
        if (!container || !scoreboard) return
        const { width, height } = container.getBoundingClientRect()
        const { height: scoreboardHeight } = scoreboard.getBoundingClientRect()
        const cellWidth = Math.floor((width - 20 - 2 * boardDimensions[1]) / boardDimensions[1])
        const cellHeight = Math.floor((height - scoreboardHeight - 10) / boardDimensions[0])
        const cellSize = Math.min(cellWidth, cellHeight)
        setCellSize(cellSize)
    }

    useEffect(onResize, [container, scoreboard])

    useEffect(() => {
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    useEffect(() => {
        screen.orientation.addEventListener('change', onResize)
        return () => screen.orientation.removeEventListener('change', onResize)
    }, [])
    
    return [cellSize, setContainer, setScoreboard] as const
}
