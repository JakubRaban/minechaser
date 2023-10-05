import { useRef, useState } from 'react'

export const useStateRef = <T>(initialState: T) => {
    const [state, setState] = useState(initialState)
    const ref = useRef(initialState)
    
    const setBoth = <X extends T>(state: X) => {
        setState(state)
        ref.current = state
    }
    
    return [state, ref, setBoth] as const
}
