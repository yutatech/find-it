import React, { useEffect, useRef, useState } from "react";

function Camera({ label }) {
  const videoRef = useRef(null); // video要素への参照
  const streamRef = useRef(null); // ストリームを保存する参照
  const [isCameraActive, setCameraActive] = useState(true); // カメラの状態を管理

  useEffect(() => {
    const startCamera = async () => {
      try {
        console.log("カメラ起動開始");
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });

        // ストリームを保存
        streamRef.current = stream;

        // video要素にストリームを設定
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = async () => {
            try {
              await videoRef.current.play();
              console.log("ビデオ再生成功");
            } catch (playError) {
              console.error("ビデオ再生エラー:", playError);
            }
          };
        }
      } catch (cameraError) {
        console.error("カメラ起動エラー:", cameraError);
      }
    };

    if (isCameraActive) {
      console.log("カメラが有効状態");
      startCamera();
    }

    return () => {
      console.log("コンポーネントアンマウント: カメラを停止");
      stopCamera();
    };
  }, [isCameraActive]);

  const stopCamera = () => {
    console.log("カメラ停止処理開始");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        console.log("トラック停止:", track);
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
    console.log("カメラ停止完了");
  };

  const restartCamera = () => {
    console.log("カメラ再起動処理開始");
    setCameraActive(true);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>選択されたラベル: {label}</h2>

      {/* 両方のボタンを常に表示 */}
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <button
          onClick={stopCamera}
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
        <button
          onClick={restartCamera}
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
      ></video>
    </div>
  );
}

export default Camera;
