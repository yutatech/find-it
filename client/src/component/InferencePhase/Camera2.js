import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';


function Camera2() {
  const videoRef = useRef(null); // video要素への参照
  const streamRef = useRef(null); // ストリームを保存する参照
  const isCameraStarting = useRef(false);
  const [isCameraActive, setCameraActive] = useState(false); // 初期状態をカメラ起動に設定
  const navigate = useNavigate();
  const location = useLocation();
  const label = location.state?.label;


  useEffect(() => {
    if (isCameraActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      console.log("end");
      stopCamera(); // コンポーネントがアンマウントされる際にカメラを停止
    };
  }, [isCameraActive]);

  const startCamera = async () => {
    // if (isCameraStarting) {
    //   return;
    // }
    isCameraStarting.current = true;
    try {
      console.log("カメラ起動開始");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      // ストリームを保存
      streamRef.current = stream;

      // video要素にストリームを設定
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        console.log("ビデオ再生成功");
      }
    } catch (error) {
      console.error("カメラ起動エラー:", error);
      setCameraActive(false); // エラーが発生した場合、状態を停止に戻す
    }
    isCameraStarting.current = false;
  };

  const stopCamera = () => {
    isCameraStarting.current = true;
    console.log("カメラ停止処理開始");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    console.log("カメラ停止完了");
    isCameraStarting.current = false;
  };

  const handleStart = () => setCameraActive(true);
  const handleStop = () => setCameraActive(false);

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => navigate('/page2')}>ラベル選択に戻る</button>
      <h2>選択されたラベル: {label}</h2>

      {/* ボタンの表示切り替え */}
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        {isCameraActive ? (
          <button
            onClick={handleStop}
            style={{
              padding: "10px 20px",
              cursor: "pointer",
              backgroundColor: "#f44336",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              margin: "10px",
            }}
          >
            カメラを停止
          </button>
        ) : (
          <button
            onClick={handleStart}
            style={{
              padding: "10px 20px",
              cursor: "pointer",
              backgroundColor: "#4caf50",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              margin: "10px",
            }}
          >
            カメラを再起動
          </button>
        )}
      </div>

      {/* カメラ映像を表示するビデオ要素 */}
      <video
        ref={videoRef}
        style={{
          width: "100%",
          height: "auto",
          backgroundColor: "#000",
        }}
        autoPlay
        muted
        playsInline
      ></video>
    </div>
  );
}

export default Camera2;
