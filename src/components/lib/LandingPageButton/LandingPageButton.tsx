import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../../../hooks/useSettings'

interface ButtonProps {
    text: string
    onClick?: () => void
    link?: string
}

export const LandingPageButton: FC<ButtonProps> = ({ text, onClick, link }) => {
    const navigate = useNavigate()
    const { setSettings } = useSettings()
    
    const onClickHandler = () => link ? navigate(link) : onClick?.()
    
    return (
        <button onClick={onClickHandler} onTouchStart={() => setSettings(s => ({ ...s, showOnScreenControls: true }))}>
            {text}
        </button>
    )
}
