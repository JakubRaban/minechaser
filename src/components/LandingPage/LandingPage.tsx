import { FC } from 'react'
import { Link } from 'react-router-dom'

export const LandingPage: FC = () => {
    return (
        <Link to="/queue">Join a game</Link>
    )
}
