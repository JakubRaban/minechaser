import { FC, PropsWithChildren, useRef, createContext } from 'react'
import { pickRandom } from '../helpers'
import { usePreferences } from '../hooks/context/usePreferences'

import game1 from '/sounds/gamemusic1.mp3'
import game2 from '/sounds/gamemusic2.mp3'
import game3 from '/sounds/gamemusic3.mp3'
import game4 from '/sounds/gamemusic4.mp3'
import menu from '/sounds/menumusic.mp3'

const gameAudios = [game1, game2, game3, game4].map(f => new Audio(f))
const menuAudio = new Audio(menu)

interface AudioControl {
    playMenuMusic: () => void
    playGameMusic: () => void
    stopPlaying: () => void
}

function stop(audio?: HTMLAudioElement) {
    if (audio) {
        audio.pause()
        audio.currentTime = 0
    }
}

function tryPlaying(audio: HTMLAudioElement) {
    try {
        audio.play()
    } catch (e) { /* empty */ }
}

function fadeIn(audio?: HTMLAudioElement) {
    if (audio) {
        const fadeInInterval = setInterval(() => {
            const newVolume = audio.volume + 0.1
            if (newVolume > 1) clearInterval(fadeInInterval)
            else audio.volume = newVolume
        }, 300)
    }
}

function fadeOut(audio?: HTMLAudioElement) {
    if (audio) {
        const fadeOutInterval = setInterval(() => {
            const newVolume = audio.volume - 0.1
            if (newVolume <= 0) {
                stop(audio)
                clearInterval(fadeOutInterval)
            } else {
                audio.volume = newVolume
            }
        }, 300)
    }
}

export const AudioContextProvider: FC<PropsWithChildren> = ({ children }) => {
    const audioRef = useRef<HTMLAudioElement | undefined>(undefined)
    const { disableMusic } = usePreferences()

    const playGameMusic = () => {
        if (!disableMusic) {
            stop(audioRef.current)
            audioRef.current = pickRandom(gameAudios)
            audioRef.current.volume = 0.1
            audioRef.current.loop = true
            tryPlaying(audioRef.current)
            fadeIn(audioRef.current)
        }
    }

    const playMenuMusic = () => {
        if (!disableMusic && audioRef.current !== menuAudio) {
            stop(audioRef.current)
            audioRef.current = menuAudio
            audioRef.current.volume = 0.1
            audioRef.current.loop = true
            tryPlaying(audioRef.current)
            fadeIn(audioRef.current)
        }
    }
    
    const stopPlaying = () => {
        if (!disableMusic) {
            fadeOut(audioRef.current)
        }
    }
    
    return (
        <AudioContext.Provider value={{ playGameMusic, playMenuMusic, stopPlaying } as AudioControl}>
            {children}
        </AudioContext.Provider>
    )
}

export const AudioContext = createContext<AudioControl>({} as AudioControl)
