import { useRef, useContext } from "react";
import { SocketRefContext } from "../modules/SocketRefContext";

const useResultReceiver = () => {
  const socketRef = useContext(SocketRefContext);
  const onGetResultRef = useRef(null);

  const handleResult = (result) => {
    if (onGetResultRef.current) {
      onGetResultRef.current(result);
    }
  };

  const setSocketHandlers = () => {
    socketRef.current.on("result", (result) => {
      handleResult(result);
    });
  };

  const setupResultReceiver = () => {
    setSocketHandlers();
  }

  const deleteResultReceiver = () => {
    socketRef.current.off("result");
  }

  const setOnGetResult = (onGetResult) => {
    onGetResultRef.current = onGetResult;
  }

  return { setupResultReceiver, deleteResultReceiver, setOnGetResult };
};

export default useResultReceiver;