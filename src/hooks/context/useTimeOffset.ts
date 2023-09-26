import { useContext } from 'react'
import { TimeOffsetContext } from '../../contexts/TimeOffsetContext'

export const useTimeOffset = () => useContext(TimeOffsetContext)
