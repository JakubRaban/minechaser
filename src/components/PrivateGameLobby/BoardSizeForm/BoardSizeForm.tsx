import { FC } from 'react'
import { is } from '../../../helpers'

import './BoardSizeForm.scss'

interface BoardSizeFormProps {
    size: [number, number]
    onChange: (size: [number, number]) => void
}

interface SizeDef {
    name: string
    size: [number, number]
}

const sizeDefs: SizeDef[] = [
    { name: 'Small (10 x 15)', size: [10, 15] },
    { name: 'Medium (14 x 21)', size: [14, 21] },
    { name: 'Large (18 x 27)', size: [18, 27] },
]

export const BoardSizeForm: FC<BoardSizeFormProps> = ({ size, onChange }) => {
    const isCustomSize = (size: [number, number]) => !sizeDefs.some(s => is(s.size, size))
    const sizeDef = sizeDefs.find(d => is(d.size, size))!

    return (
        <details className="dropdown board-size-form">
            <summary>{sizeDef.name}</summary>
            <ul>
                {sizeDefs.map(d => (
                    <li key={d.name}>
                        <label>
                            <input type="radio" name="size" checked={is(size, d.size)} onChange={() => onChange(d.size)} />
                            {d.name}
                        </label>
                    </li>
                ))}
            </ul>
        </details>
    )
}
