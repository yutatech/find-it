import { useRef, useState, useEffect } from "react";
import DrawResult from "../../modules/DrawResult";

const ResultView = ({ isVideoStreamReady, videoStreamRef, setOnGetResult, calcDisplacementFromTime, streamStartTimeRef }) => {
  const videoRef = useRef(null); // video要素への参照
  const canvasRef = useRef(null); // canvas要素への参照
  const frameRef = useRef(null); // フレーム要素への参照

  const canvasSizeRef = useRef({ width: 640, height: 480 });
  const videoSizeRef = useRef({ width: 640, height: 480 });
  const [canvasSize, setCanvasSize] = useState({ width: 640, height: 480 });
  const resultRef = useRef(null);

  function deepCopy(obj) {
    if (obj === null || typeof obj !== "object") {
      return obj; // プリミティブ型やnullはそのまま返す
    }
  
    const copy = Array.isArray(obj) ? [] : {};
  
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        copy[key] = deepCopy(obj[key]); // 再帰的にコピー
      }
    }
  
    return copy;
  }

  const drawResult = () => {
    const result = resultRef.current;
    if (result) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const imageSize = { width: result.image_size.width, height: result.image_size.height };
      const scale = canvas.width / canvasSizeRef.current.width;

      // videoSizeを最大値とするような座標系で描画できるようにスケールを調整
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.clearRect(0, 0, canvasSizeRef.current.width, canvasSizeRef.current.height);

      // 映像を転送するときにリサイズしている場合があるので、その分を補正
      const imgToCanvasScale = canvasSizeRef.current.width / imageSize.width;

      const frameTime = new Date(streamStartTimeRef.current.getTime() + result.timestamp * 1000);
      const displacecmet = calcDisplacementFromTime(frameTime);

      result.results.forEach((result) => {
        let result_copy = deepCopy(result);
        result_copy.box[0] *= imgToCanvasScale;
        result_copy.box[1] *= imgToCanvasScale;
        result_copy.box[2] *= imgToCanvasScale;
        result_copy.box[3] *= imgToCanvasScale;

        result_copy.box[0] += displacecmet.x;
        result_copy.box[1] += displacecmet.y;

        DrawResult(ctx, result_copy);
      });
      ctx.strokeStyle = "gray";
      ctx.strokeRect(10, 10, canvasSizeRef.current.width - 20, canvasSizeRef.current.height - 20);
    }
    window.requestAnimationFrame(drawResult);
  };

  const onGetResult = (result) => {
    resultRef.current = result;
  }

  const handleCanvasResize = () => {
    // Windowに収まるようにcanvasSizeを調整
    let width = videoSizeRef.current.width;
    let height = videoSizeRef.current.height;

    const videoParentRect = frameRef.current.parentElement.getBoundingClientRect();

    console.log('parent', videoParentRect.height);
    if (height < videoParentRect.height) {
      width = width * videoParentRect.height / height;
      height = videoParentRect.height;
    }

    if (width > videoParentRect.width) {
      height = videoParentRect.width * height / width;
      width = videoParentRect.width;
    }

    if (height > videoParentRect.height) {
      width = videoParentRect.height * width / height;
      height = videoParentRect.height;
    }

    canvasSizeRef.current = { width: width, height: height };
    console.log('canvasSize', canvasSizeRef.current);
    setCanvasSize({ width: width, height: height });
  };

  useEffect(() => {
    if (isVideoStreamReady) {
      // video要素にストリームを設定
      console.log('video added');
      videoRef.current.srcObject = videoStreamRef.current;

      // videoStreamのピクセルサイズを取得
      const videoTrack = videoStreamRef.current.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      videoSizeRef.current = { width: settings.width, height: settings.height };

      handleCanvasResize();
      window.requestAnimationFrame(drawResult);
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
    <div ref={frameRef} style={{ position: "relative", width: `${canvasSize.width}px`, height: `${canvasSize.height}px`, padding: 0 }}>
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
        id="canvasDraw"
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ position: "relative", top: 0, left: 0, pointerEvents: "none" }}
      />
      <canvas
        id="canvasDebugOut"
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      />
    </div>
  );
};

export default ResultView;