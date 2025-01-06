import React, { useRef, createContext } from 'react';
import io from "socket.io-client";

export const SocketRefContext = createContext();


export const SocketRefProvider = ({ children }) => {
  const socketRef = useRef(null);
  socketRef.current = io(process.env.REACT_APP_API_URL, {
    transports: ['websocket', 'polling']
  });
  console.log('socketRef:', socketRef.current);

  return (
    <SocketRefContext.Provider value={socketRef}>
      {children}
    </SocketRefContext.Provider>
  );
}