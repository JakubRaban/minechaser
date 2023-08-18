import { FC } from 'react'
import { Link } from 'react-router-dom'
import { NameSetter } from './NameSetter/NameSetter'
import { useLocation } from 'react-router'

export const LandingPage: FC = () => {
    const { error } = useLocation().state ?? {}

    return (
        <>
            <div><Link to="/queue">Join a public game</Link></div>
            <div><Link to="/new-game">Create a private game</Link></div>
            <div><Link to="/new-game/single-player">Single Player</Link></div>
            <div><Link to="/how-to-play">How to play</Link></div>
            <NameSetter />
            {error && <div>{error}</div>}
        </>
    )
}
