import { useEffect } from "react";

const useResultReceiver = (socketRef, drawResult) => {
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

  return { setupResultReceiver };
};

export default useResultReceiver;