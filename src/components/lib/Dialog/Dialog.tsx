import { FC, PropsWithChildren } from 'react'
import cn from 'classnames'

import './Dialog.scss'
import { useNavigate } from 'react-router'

interface DialogProps {
    open?: boolean
    className?: string
}

export const Dialog: FC<PropsWithChildren<DialogProps>> = ({ children, open, className }) =>
    <dialog className={cn('dialog', className)} open={open}>
        <article>
            {children}
        </article>
    </dialog>

export const DialogHeader: FC<{ title: string }> = ({ title }) => {
    const navigate = useNavigate()

    return (
        <div className="header-container">
            <h1>{title}</h1>
            <button className="close" onClick={() => navigate('/')} />
        </div>
    )
}
