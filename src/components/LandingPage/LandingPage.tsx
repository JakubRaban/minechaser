import React, { useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';

import './LandingPage.scss';

export const LandingPage: React.FC = () => {
    const { socket } = useSocket();

    useEffect(() => {
        socket.connect();
        socket.on('connect', () => {
            socket.emit('my event', { data: 'Connected' });
        });
        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div>No elo</div>
    );
};
