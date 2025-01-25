import React, { useRef, useState, createContext } from 'react';
import io from "socket.io-client";

export const SocketRefContext = createContext();


export const SocketRefProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [isSocketReady, setIsSocketReady] = useState(false);

  socketRef.current = io(process.env.REACT_APP_API_URL, {
    transports: ['websocket', 'polling']
  });

  socketRef.current.on('connect', () => {
    setIsSocketReady(true);
  });

  return (
    <SocketRefContext.Provider value={{socketRef, isSocketReady}}>
      {children}
    </SocketRefContext.Provider>
  );
}