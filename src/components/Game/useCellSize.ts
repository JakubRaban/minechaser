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

    const onResize = (e?: Event) => {
        if (!container || !scoreboard) return
        const { width, height } = container.getBoundingClientRect()
        const { width: windowWidth, height: windowHeight } = (e?.target as any)?.screen || window.screen
        const isHorizontal = windowWidth > windowHeight

        const verticalSpace = !isMobile ? 15 : isHorizontal ? 6 : 0
        const horizontalSpace = !isMobile ? 10 : isHorizontal ? 4 : 0

        const { height: scoreboardHeight, width: scoreboardWidth } = scoreboard.getBoundingClientRect()
        const scoreboardOnSide = isMobile && isHorizontal

        const defeatedMessageHeight = defeatedPlayerMessage?.getBoundingClientRect()?.height ?? 0
        const gridGap = Number(rootStyle.getPropertyValue('--grid-gap')[0])
        const cellWidth = Math.floor((width - (scoreboardOnSide ? scoreboardWidth : 0) - horizontalSpace - gridGap * boardDimensions[1]) / boardDimensions[1])
        const cellHeight = Math.floor((height - (scoreboardOnSide ? 0 : scoreboardHeight) - defeatedMessageHeight - verticalSpace - gridGap * boardDimensions[0]) / boardDimensions[0])
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
