import { useEffect, useRef, useState } from "react";

const useLocalVideo = () => {
  const localStreamRef = useRef(null);
  const [isLocalStreamReady, setIsLocalStreamReady] = useState(false);
  const [videoSize, setVideoSize] = useState({ width: 360, height: 240 });

  const getLocalStream = async () => {
    // カメラの取得
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((stream) => {
        console.log('success to get media');
        localStreamRef.current = stream;
        setIsLocalStreamReady(true);

        const videoTrack = stream.getVideoTracks()[0];
        const settings = videoTrack.getSettings();

        setVideoSize({ width: settings.width, height: settings.height });
      })
      .catch((error) => {
        console.error('メディアデバイスの取得エラー:', error);
      });
  };
  useEffect(() => {
    console.log('videoSize', videoSize.width, videoSize.height);
  }, [videoSize]);

  useEffect(() => {
    getLocalStream();
  }, []);

  return { localStreamRef, isLocalStreamReady, videoSize };
};

export default useLocalVideo;