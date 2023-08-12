import { FC } from 'react'
import { Link } from 'react-router-dom'
import { NameSetter } from './NameSetter/NameSetter'

export const LandingPage: FC = () => {
    return (
        <>
            <div><Link to="/queue">Join a public game</Link></div>
            <div><Link to="/new-game">Create a private game</Link></div>
            <div><Link to="/how-to-play">How to play</Link></div>
            <NameSetter />
        </>
    )
}
