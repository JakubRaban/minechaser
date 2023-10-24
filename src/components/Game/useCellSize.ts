import { Position } from '../../types/model'
import { useEffect, useState } from 'react'
import { usePreferences } from '../../hooks/context/usePreferences'
import { rootStyle } from '../../helpers'

export const useCellSize = (boardDimensions: Position) => {
    const [cellSize, setCellSize] = useState<number>(16)
    const [container, setContainer] = useState<HTMLDivElement | null>(null)
    const [scoreboard, setScoreboard] = useState<HTMLDivElement | null>(null)
    const [defeatedPlayerMessage, setDefeatedPlayerMessage] = useState<HTMLDivElement | null>(null)

    const { showOnScreenControls: isMobile } = usePreferences()

    const verticalSpace = isMobile ? 6 : 15
    const horizontalSpace = isMobile ? 4 : 10

    const onResize = () => {
        if (!container || !scoreboard) return
        const { width, height } = container.getBoundingClientRect()
        const { height: scoreboardHeight, width: scoreboardWidth } = scoreboard.getBoundingClientRect()
        const defeatedMessageHeight = defeatedPlayerMessage?.getBoundingClientRect()?.height ?? 0
        const gridGap = Number(rootStyle.getPropertyValue('--grid-gap')[0])
        const cellWidth = Math.floor((width - (isMobile ? scoreboardWidth : 0) - horizontalSpace - gridGap * boardDimensions[1]) / boardDimensions[1])
        const cellHeight = Math.floor((height - (isMobile ? 0 : scoreboardHeight) - defeatedMessageHeight - verticalSpace - gridGap * boardDimensions[0]) / boardDimensions[0])
        const cellSize = Math.min(cellWidth, cellHeight)
        setCellSize(cellSize)
    }

    useEffect(onResize, [container, scoreboard])

    useEffect(() => {
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [container, scoreboard])

    useEffect(() => {
        if (screen.orientation) {
            screen.orientation.addEventListener('change', onResize)
            return () => screen.orientation.removeEventListener('change', onResize)
        } else {
            window.addEventListener('orientationchange', onResize)
            return () => window.addEventListener('orientationchange', onResize)
        }
    }, [container, scoreboard])
    
    return [cellSize, setContainer, setScoreboard, setDefeatedPlayerMessage] as const
}
