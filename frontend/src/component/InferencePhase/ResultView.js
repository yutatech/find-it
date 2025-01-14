import { useRef, useState, useEffect } from "react";
import DrawResult from "../../modules/DrawResult";

const ResultView = ({ isVideoStreamReady, videoStreamRef, setOnGetResult }) => {
  const videoRef = useRef(null); // video要素への参照
  const canvasRef = useRef(null); // canvas要素への参照

  const canvasSizeRef = useRef({ width: 640, height: 480 });
  const videoSizeRef = useRef({ width: 640, height: 480 });
  const [canvasSize, setCanvasSize] = useState({ width: 640, height: 480 });

  const onGetResult = (result) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const imageSize = { width: result.image_size.width, height: result.image_size.height };
    const scale = canvas.width / canvasSizeRef.current.width;

    // videoSizeを最大値とするような座標系で描画できるようにスケールを調整
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, canvasSizeRef.current.width, canvasSizeRef.current.height);

    // 映像を転送するときにリサイズしている場合があるので、その分を補正
    const imgToCanvasScale = canvasSizeRef.current.width / imageSize.width;

    result.results.forEach((result) => {
      let result_copy = Object.assign({}, result);
      result_copy.box[0] *= imgToCanvasScale;
      result_copy.box[1] *= imgToCanvasScale;
      result_copy.box[2] *= imgToCanvasScale;
      result_copy.box[3] *= imgToCanvasScale;

      DrawResult(ctx, result_copy);
    });
    ctx.strokeRect(10, 10, canvasSizeRef.current.width - 20, canvasSizeRef.current.height - 20);
  }

  const handleCanvasResize = () => {
    // Windowに収まるようにcanvasSizeを調整
    let width = videoSizeRef.current.width;
    let height = videoSizeRef.current.height;

    if (width > window.innerWidth) {
      height = window.innerWidth * height / width;
      width = window.innerWidth;
    }
    if (height > window.innerHeight) {
      width = window.innerHeight * width / height;
      height = window.innerHeight;
    }

    canvasSizeRef.current = { width: width, height: height };
    setCanvasSize({ width: width, height: height });
  };

  useEffect(() => {
    if (isVideoStreamReady) {
      // video要素にストリームを設定
      videoRef.current.srcObject = videoStreamRef.current;

      // videoStreamのピクセルサイズを取得
      const videoTrack = videoStreamRef.current.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      videoSizeRef.current = { width: settings.width, height: settings.height };

      handleCanvasResize();
    }
  }, [isVideoStreamReady]);


  useEffect(() => {
    // 結果取得時のcallbackを登録
    setOnGetResult(onGetResult);

    // リスナーを登録
    window.addEventListener("resize", handleCanvasResize);

    // クリーンアップ: リスナーを削除
    return () => {
      window.removeEventListener("resize", handleCanvasResize);
    };
  }, []);

  return (
    <div style={{ position: "relative", width: `${canvasSize.width}px`, height: `${canvasSize.height}px` }}>
      {/* Video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ position: "absolute", top: 0, left: 0 }}
      />
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      />
      <canvas
        id="canvasOutput"
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      />
    </div>
  );
};

export default ResultView;