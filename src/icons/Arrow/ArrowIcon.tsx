import { FC } from 'react'
import cn from 'classnames'

import './ArrowIcon.scss'

interface ArrowIconProps {
    className?: string
}

export const ArrowIcon: FC<ArrowIconProps> = ({ className }) => (
    <svg className={cn('arrow-icon', className)} version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 512 512" xmlSpace="preserve">
        <g id="XMLID_1_">
            <path id="XMLID_3_" d="M297.7,483.6l200.9-194.6c8.7-8.7,13.4-19.7,13.4-32.3V256c0-12.6-4.7-24.4-13.4-32.3L297.7,28.4
		c-17.3-18.1-45.7-18.1-63,0s-17.3,47.3,0,65.4l120.5,115.8H44.9C20.5,209.5,0,230,0,256c0,26,19.7,46.5,44.9,46.5H356L234.7,418.3
		c-17.3,18.1-17.3,47.3,0,65.4C252.8,501.8,280.4,501.8,297.7,483.6L297.7,483.6z" />
        </g>
    </svg>
)
