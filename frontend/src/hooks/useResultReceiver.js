import { useEffect, useContext } from "react";
import { SocketRefContext } from "../modules/SocketRefContext";

const useResultReceiver = (drawResult) => {
  const socketRef = useContext(SocketRefContext);

  const handleResult = (result) => {
    drawResult(result);
  };

  const setSocketHandlers = () => {
    console.log('setSocketHandlers');
    socketRef.current.on("result", (result) => {
      handleResult(result);
    });
  };

  const setupResultReceiver = () => {
    setSocketHandlers();
  }

  const deleteResultReceiver = () => {
    socketRef.current.removeListener("result");
  }

  return { setupResultReceiver, deleteResultReceiver };
};

export default useResultReceiver;