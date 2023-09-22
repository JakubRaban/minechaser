import { FC } from 'react'
import { Link } from 'react-router-dom'

import './LandingPageButton.scss'

interface ButtonProps {
    text: string
    onClick?: () => void
    link?: string
}

export const LandingPageButton: FC<ButtonProps> = ({ text, onClick, link }) => {
    const onClickHandler = () => onClick?.()

    const button = (
        <button role="a" onClick={onClickHandler}>
            {text}
        </button>
    )
    
    return link ? <Link className="landing-page-link" to={link}>{button}</Link> : button
}
