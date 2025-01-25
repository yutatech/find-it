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

  function lowPassFilter(previous, current, alpha_cord = 0.8, alpha_size = 0.2) {
    return {
      label: current.label,
      center_x: previous.center_x * (1 - alpha_cord) + current.center_x * alpha_cord,
      center_y: previous.center_y * (1 - alpha_cord) + current.center_y * alpha_cord,
      width: previous.width * (1 - alpha_size) + current.width * alpha_size,
      height: previous.height * (1 - alpha_size) + current.height * alpha_size
    };
  }

  const prvTrackedResultsRef = useRef([]);
  // Process the time series data
  function processObjectsData(data, threshold = 200) {
    let trackedResult = [];  // Final output list
    const prvTrackedResults = prvTrackedResultsRef.current;
    // Iterate through the data
    data.forEach((item, index) => {
      let matched = false;
      // Try to find a matching label with similar position in the previous data
      for (let i = 0; i < prvTrackedResults.length; i++) {
        if (prvTrackedResults[i].label === item.label &&
          Math.abs(prvTrackedResults[i].center_x - item.center_x) < threshold &&
          Math.abs(prvTrackedResults[i].center_y - item.center_y) < threshold) {

          const delta = Math.sqrt(Math.abs(prvTrackedResults[i].width - item.width) ** 2 + Math.abs(prvTrackedResults[i].height - item.height) ** 2);
          let alpha = delta / 20;
          alpha = alpha > 0.8 ? 0.8 : alpha;
          alpha = alpha < 0.2 ? 0.2 : alpha;

          // Apply low-pass filter to position and size
          trackedResult.push(lowPassFilter(prvTrackedResults[i], item, alpha));
          matched = true;
          break;
        }
      }

      if (!matched) {
        trackedResult.push(item);
      }
    });

    prvTrackedResultsRef.current = trackedResult;

    return trackedResult;
  }

  const drawResult = () => {
    const result = resultRef.current;
    const canvas = canvasRef.current;
    if (result && canvas) {
      const ctx = canvas.getContext("2d");
      const imageSize = { width: result.image_size.width, height: result.image_size.height };

      ctx.clearRect(0, 0, canvasSizeRef.current.width, canvasSizeRef.current.height);

      // 全体を薄く黒に
      ctx.globalCompositeOperation = 'source-over';
      ctx.shadowColor = 'rgba(0, 0, 0, 0)';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 映像を転送するときにリサイズしている場合があるので、その分を補正
      const imgToCanvasScale = canvas.width / imageSize.width;

      const frameTime = new Date(streamStartTimeRef.current.getTime() + result.timestamp * 1000);
      const displacecmet = calcDisplacementFromTime(frameTime);

      let scaledResults = []

      result.results.forEach((result) => {
        let result_copy = deepCopy(result);
        result_copy.center_x *= imgToCanvasScale;
        result_copy.center_y *= imgToCanvasScale;
        result_copy.width *= imgToCanvasScale;
        result_copy.height *= imgToCanvasScale;

        result_copy.center_x += displacecmet.x;
        result_copy.center_y += displacecmet.y;
        result_copy.width *= 1.2;
        result_copy.height *= 1.2;
        scaledResults.push(result_copy);
      });

      const trackedResult = processObjectsData(scaledResults);

      trackedResult.forEach((result) => {
        DrawResult(ctx, result);
      });
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
    console.log("width", width, height);

    const videoParentRect = frameRef.current.parentElement.getBoundingClientRect();

    const heightRatio = videoParentRect.height / height;
    const widthRatio = videoParentRect.width / width;

    if (heightRatio > widthRatio) {
      width = width * heightRatio;
      height = videoParentRect.height;
    }
    else {
      height = height * widthRatio;
      width = videoParentRect.width;
    }

    canvasSizeRef.current = { width: width, height: height };
    setCanvasSize({ width: width, height: height });
    console.log("handleCanvasResize", width, height);
  };

  useEffect(() => {
    if (isVideoStreamReady) {
      // video要素にストリームを設定
      videoRef.current.srcObject = videoStreamRef.current;

      // videoStreamのピクセルサイズを取得
      console.log("videoSize", videoStreamRef.current.getVideoTracks()[0].getSettings().width, videoStreamRef.current.getVideoTracks()[0].getSettings().height);
      videoSizeRef.current = { width: videoStreamRef.current.getVideoTracks()[0].getSettings().width, height: videoStreamRef.current.getVideoTracks()[0].getSettings().height };

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
      window.cancelAnimationFrame(drawResult);
      resultRef.current = null;
    };
  }, []);

  const innerStyle = {
    position: "absolute", top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)', pointerEvents: "none"
  };

  return (
    <div ref={frameRef} height="100%" width="100%">
      {/* Video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        width={canvasSize.width}
        height={canvasSize.height}
        style={innerStyle}
      />
      {/* Canvas */}
      <canvas
        id="canvasDraw"
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={innerStyle}
      />
      <canvas
        id="canvasDebugOut"
        width={canvasSize.width}
        height={canvasSize.height}
        style={innerStyle}
      />
    </div>
  );
};

export default ResultView;