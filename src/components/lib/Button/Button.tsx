import { FC } from 'react'
import cn from 'classnames'
import { useNavigate } from 'react-router-dom'

interface ButtonProps {
    text: string
    onClick?: () => void
    link?: string
    disabled?: boolean
}

export const Button: FC<ButtonProps> = ({ text, onClick, link, disabled }) => {
    const navigate = useNavigate()
    const onClickHandler = () => link ? navigate(link) : onClick?.()
    
    return (
        <button onClick={onClickHandler} disabled={disabled}>
            {text}
        </button>
    )
}
