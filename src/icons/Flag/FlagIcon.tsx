import { FC } from 'react'
import cn from 'classnames'

import './FlagIcon.scss'

interface FlagIconProps {
    className?: string
    fillClassName?: any
}

export const FlagIcon: FC<FlagIconProps> = ({ className, fillClassName }) => (
    <>
        <svg className={cn('flag-icon mobile', className)} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" width="1000" height="1000" viewBox="0 0 1000 1000" xmlSpace="preserve">
            <rect x="0" y="0" width="100%" height="100%" fill="none" transform="matrix(1, 0, 0, 1, -7.105427357601002e-15, 0)" />
            <g transform="matrix(1.354099988937378, 0, 0, 1.7755999565124512, 631.8524780273436, 500.0080871582031)" id="924093">
                <g transform="matrix(1, 0, 0, 1, -150.254807, 0)">
                    <g transform="matrix(1 0 0 1 -102.803 199.684)" id="flat_x2C__basic_x2C__home_x2C__flag__x2C_">
                        <path fill="rgb(0,0,0)" transform="translate(-153.197, -455.684)" d="M 39.421 490.596 h 227.552 v -18.047 c 0 -28.242 -23.516 -51.777 -51.791 -51.777 H 91.22 c -28.22 0 -51.799 23.535 -51.799 51.777 V 490.596 z" strokeLinecap="round" />
                    </g>
                    <g transform="matrix(1 0 0 1 -102.783 -34.912)" id="flat_x2C__basic_x2C__home_x2C__flag__x2C_">
                        <polygon fill="rgb(0,0,0)" points="-19.607,199.683 19.607,199.683 19.607,41.967 19.607,-170.655 19.607,-199.683 -19.607,-199.683" />
                    </g>
                    <g transform="matrix(1 0 0 1 66.7015 -111.756)" id="flat_x2C__basic_x2C__home_x2C__flag__x2C_">
                        <polygon className={cn('color-triangle', fillClassName)} points="-149.878 200.58 395.35 40.885 -149.878 -118.811" />
                    </g>
                </g>
            </g>
        </svg>
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
                        <polygon fill="rgb(0,0,0)" points="-19.607,199.683 19.607,199.683 19.607,41.967 19.607,-170.655 19.607,-199.683 -19.607,-199.683" />
                    </g>
                    <g transform="matrix(1 0 0 1 66.7015 -111.756)" id="flat_x2C__basic_x2C__home_x2C__flag__x2C_">
                        <polygon className={cn('color-triangle', fillClassName)} points="-149.8775,118.811 149.8775,-0.381 -149.8775,-118.811" />
                    </g>
                </g>
            </g>
        </svg>
    </>
)
