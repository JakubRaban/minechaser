import { FC } from 'react'
import { Link } from 'react-router-dom'

import './LandingPageButton.scss'

interface ButtonProps {
    text: string
    onClick?: () => void
    onHover?: () => void
    link?: string
}

export const LandingPageButton: FC<ButtonProps> = ({ text, onClick, onHover, link }) => {
    const button = (
        <button onClick={onClick} onMouseEnter={onHover}>
            {text}
        </button>
    )
    
    return link ? <Link className="landing-page-link" to={link}>{button}</Link> : button
}
