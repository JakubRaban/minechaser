import { FC } from 'react';
import { SocketIOContext } from '../contexts/SocketIOContext';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './LandingPage/LandingPage.scss';
import { io } from 'socket.io-client';
import config from '../config';
import { LandingPage } from './LandingPage/LandingPage';
import { HowToPlay } from './HowToPlay/HowToPlay';

export const App: FC = () => {
    return (
        <SocketIOContext.Provider value={{ socket: io(config.SERVER_URL, { autoConnect: false, closeOnBeforeunload: true }) }}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LandingPage/>}/>
                    <Route path="/how-to-play" element={<HowToPlay />}/>
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </BrowserRouter>
        </SocketIOContext.Provider>
    );
};
