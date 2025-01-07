import { useEffect, useRef, useState } from "react";

const useLocalVideo = () => {
  const localStreamRef = useRef(null);
  const [isLocalStreamReady, setIsLocalStreamReady] = useState(false);

  const getLocalStream = async () => {
    // カメラの取得
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((stream) => {
        console.log('success to get media');
        localStreamRef.current = stream;
        setIsLocalStreamReady(true);
      })
      .catch((error) => {
        console.error('メディアデバイスの取得エラー:', error);
      });
  };

  useEffect(() => {
    getLocalStream();
  }, []);

  return { localStreamRef, isLocalStreamReady };
};

export default useLocalVideo;