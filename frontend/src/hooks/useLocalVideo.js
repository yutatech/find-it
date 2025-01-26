import { useEffect, useRef, useState } from "react";

const useLocalVideo = () => {
  const localStreamRef = useRef(null);
  const [isLocalStreamReady, setIsLocalStreamReady] = useState(false);

  const controllerRef = useRef(new AbortController());
  const signalRef = useRef(controllerRef.current.signal);

  useEffect(() => {
    let mounted = true;

    // カメラの取得
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false, signal: signalRef.current })
      .then((stream) => {
        if (mounted) {
          localStreamRef.current = stream;
          setTimeout(() => {
            // 1秒待機してからIsReadyを発火しないと、settingsが正しく取得できない
            setIsLocalStreamReady(true);
          }, 1000);
        }
      })
      .catch((error) => {
        console.error('メディアデバイスの取得エラー:', error);
      });

    return () => {
      mounted = false;
      controllerRef.current.abort();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  return { localStreamRef, isLocalStreamReady };
};

export default useLocalVideo;