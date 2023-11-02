import { FC, PropsWithChildren } from 'react'
import cn from 'classnames'

import './Dialog.scss'

interface DialogProps {
    open?: boolean
    className?: string
}

export const Dialog: FC<PropsWithChildren<DialogProps>> = ({ children, open, className }) => {
    return (
        <dialog className={cn('dialog', className)} open={open}>
            <article>
                {children}
            </article>
        </dialog>
    )
}
