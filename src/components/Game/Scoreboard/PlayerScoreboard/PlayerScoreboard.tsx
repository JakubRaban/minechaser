import { memo, useEffect, useRef, useState } from 'react'
import cn from 'classnames'
import { CellIcons } from '../../Cell/Cell'
import { useDateDiff } from '../../../../hooks/useDateDiff'

import './PlayerScoreboard.scss'

interface PlayerScoreboardProps {
    score: number
    bonusName?: string;
    bonusExpiresAtTimestamp?: string;
    alive: boolean
}

export const PlayerScoreboard = memo<PlayerScoreboardProps>(({ score, bonusName, bonusExpiresAtTimestamp, alive }) => {
    const [displayedBonusName, setDisplayedBonusName] = useState<string | null>(null)
    const elementRef = useRef<HTMLDivElement>(null)
    const interval = useRef<NodeJS.Timeout | null>(null)
    const dateDiff = useDateDiff()
    
    useEffect(() => {
        if (bonusName && alive) {
            setDisplayedBonusName(bonusName)
            const dateObtained = new Date()
            const bonusExpiresAt = new Date(bonusExpiresAtTimestamp!)
            const durationTotal = dateDiff(bonusExpiresAt, dateObtained).millis
            interval.current = setInterval(() => {
                const durationLeft = dateDiff(bonusExpiresAt, new Date()).millis
                const durationLeftPart = durationLeft / durationTotal
                elementRef.current!.style.setProperty('--timer-progress', `${durationLeftPart * 100}%`)
                if (durationLeftPart <= 0) {
                    setDisplayedBonusName(null)
                    clearInterval(interval.current!)
                }
            }, 100)
        } else {
            elementRef.current!.style.setProperty('--timer-progress', '100%')
            setDisplayedBonusName(null)
        }
        return () => clearInterval(interval.current!)
    }, [bonusName, bonusExpiresAtTimestamp, alive])

    return (
        <div className={cn('player-scoreboard-wrapper')} ref={elementRef}>
            <div className={cn('score')}>
                <div>{score}</div>
                {(displayedBonusName || !alive) && (
                    <div className={cn('cell player-cell', { mine: !alive, uncovered: !alive, bonus: displayedBonusName })}>
                        <CellIcons bonusName={displayedBonusName} showMine={!alive} />
                        <div className="bonus-expiry-overlay" />
                    </div>
                )}
            </div>
        </div>
    )
})
