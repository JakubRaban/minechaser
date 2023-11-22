import { FC, useEffect } from 'react'
import { Link } from 'react-router-dom'
import tippy from 'tippy.js'

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

    useEffect(() => {
        tippy(`#${tooltipId}`, { content: tooltip, theme: 'default', delay: [1000, 300] })
    }, [])

    const button = (
        <button onClick={onClick} onMouseEnter={onHover}>
            {text}
        </button>
    )
    
    return (
        <>
            {link ? <Link id={tooltipId} className="landing-page-link" to={link}>{button}</Link> : button}
        </>
    )
}
