import { FC } from 'react'

interface BoardSizeFormProps {
    size: [number, number]
    onChange: (size: [number, number]) => void
}

interface SizeDef {
    name: string
    size: [number, number]
}

const is = (size1: [number, number], size2: [number, number]) => size1[0] === size2[0] && size1[1] === size2[1]
const sizeDefs: SizeDef[] = [
    { name: 'Small (8 x 16)', size: [8, 16] },
    { name: 'Medium (12 x 24)', size: [12, 24] },
    { name: 'Large (16 x 32)', size: [16, 32] },
]

export const BoardSizeForm: FC<BoardSizeFormProps> = ({ size, onChange }) => {
    const isCustomSize = (size: [number, number]) => !sizeDefs.some(s => is(s.size, size))
    const sizeDef = sizeDefs.find(d => is(d.size, size))!

    return (
        <details className="dropdown">
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
