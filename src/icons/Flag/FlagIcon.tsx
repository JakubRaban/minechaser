import { FC } from 'react'
import cn from 'classnames'
import { playerColorToClassName } from '../../helpers'
import { PlayerColor } from '../../types/model'

import './FlagIcon.scss'

interface FlagIconProps {
    className?: string
    fill?: PlayerColor
}

export const FlagIcon: FC<FlagIconProps> = ({ className, fill }) => (
    <svg className={cn('flag-icon', className)} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" width="1000" height="1000" viewBox="0 0 1000 1000" xmlSpace="preserve">
        <rect x="0" y="0" width="100%" height="100%" fill="none" />
        <g transform="matrix(1.3541 0 0 1.7756 631.8525 500.0081)" id="924093">
            <g>
                <g transform="matrix(1 0 0 1 -102.803 199.684)" id="flat_x2C__basic_x2C__home_x2C__flag__x2C_">
                    <path 
                        fill="rgb(0,0,0)" 
                        transform="translate(-153.197, -455.684)" 
                        d="M 39.421 490.596 h 227.552 v -18.047 c 0 -28.242 -23.516 -51.777 -51.791 -51.777 H 91.22 c -28.22 0 -51.799 23.535 -51.799 51.777 V 490.596 z" 
                        strokeLinecap="round" 
                    />
                </g>
                <g transform="matrix(1 0 0 1 -102.783 -34.912)" id="flat_x2C__basic_x2C__home_x2C__flag__x2C_">
                    <polygon points="-19.607,199.683 19.607,199.683 19.607,41.967 19.607,-170.655 19.607,-199.683 -19.607,-199.683" />
                </g>
                <g transform="matrix(1 0 0 1 66.7015 -111.756)" id="flat_x2C__basic_x2C__home_x2C__flag__x2C_">
                    <polygon className={cn('color-triangle', playerColorToClassName(fill))} points="-149.8775,118.811 149.8775,-0.381 -149.8775,-118.811" />
                </g>
            </g>
        </g>
    </svg>
)
