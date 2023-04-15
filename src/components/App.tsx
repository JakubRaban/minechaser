import React, {FC} from 'react';
import {SocketIOContext} from "../contexts/SocketIOContext";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import './LandingPage/LandingPage.scss';
import {io} from "socket.io-client";
import config from "../config";
import {LandingPage} from "./LandingPage/LandingPage";

const App: FC = () => {
  return (
    <SocketIOContext.Provider value={{ socket: io(config.SERVER_URL, { autoConnect: false, closeOnBeforeunload: true }) }}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage/>}/>
      </Routes>
    </BrowserRouter>
  </SocketIOContext.Provider>
  );
}

export default App;
