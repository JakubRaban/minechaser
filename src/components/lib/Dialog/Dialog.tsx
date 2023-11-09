import { FC, PropsWithChildren, useRef, useEffect } from 'react'
import cn from 'classnames'
import { useNavigate } from 'react-router'

import './Dialog.scss'

interface DialogProps {
    open?: boolean
    className?: string
}

export const Dialog: FC<PropsWithChildren<DialogProps>> = ({ children, open, className }) => {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const articleRef = useRef<HTMLElement>(null)
    const navigate = useNavigate()

    useEffect(() => {
        const close = (e: Event) => {
            if (e.target === dialogRef.current) navigate(-1)
        }
        dialogRef.current!.addEventListener('click', close)
    }, [])

    return (
        <dialog ref={dialogRef} className={cn('dialog', className)} open={open}>
            <article ref={articleRef}>
                {children}
            </article>
        </dialog>
    )
}

export const DialogHeader: FC<{ title: string }> = ({ title }) => {
    const navigate = useNavigate()

    return (
        <div className="header-container">
            <h1>{title}</h1>
            <button className="close" onClick={() => navigate(-1)} />
        </div>
    )
}
