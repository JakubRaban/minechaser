import { FC } from 'react'
import { Link } from 'react-router-dom'
import { Tooltip } from 'react-tooltip'

import './LandingPageButton.scss'

interface ButtonProps {
    text: string
    onClick?: () => void
    onHover?: () => void
    link?: string
    tooltip?: string
}

export const LandingPageButton: FC<ButtonProps> = ({ text, link, tooltip, onClick, onHover }) => {
    const tooltipId = text.split(' ').join('')

    const button = (
        <button onClick={onClick} onMouseEnter={onHover}>
            {text}
        </button>
    )
    
    return (
        <>
            {link ? <Link data-tooltip-id={tooltipId} data-tooltip-content={tooltip} data-tooltip-delay-show={1000} data-tooltip-delay-hide={300} className="landing-page-link" to={link}>{button}</Link> : button}
            <Tooltip id={tooltipId} />
        </>
    )
}
