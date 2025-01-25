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

  function lowPassFilter(previous, current, alpha_cord = 0.8, alpha_size = 0.5) {
    return {
      label: current.label,
      box: [
        previous.box[0] * (1 - alpha_cord) + current.box[0] * alpha_cord,
        previous.box[1] * (1 - alpha_cord) + current.box[1] * alpha_cord,
        previous.box[2] * (1 - alpha_size) + current.box[2] * alpha_size,
        previous.box[3] * (1 - alpha_size) + current.box[3] * alpha_size
      ]
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
          Math.abs(prvTrackedResults[i].box[0] - item.box[0]) < threshold &&
          Math.abs(prvTrackedResults[i].box[1] - item.box[1]) < threshold) {

          // Apply low-pass filter to position and size
          trackedResult.push(lowPassFilter(prvTrackedResults[i], item));
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
      const scale = canvas.width / canvasSizeRef.current.width;

      // videoSizeを最大値とするような座標系で描画できるようにスケールを調整
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.clearRect(0, 0, canvasSizeRef.current.width, canvasSizeRef.current.height);

      // 映像を転送するときにリサイズしている場合があるので、その分を補正
      const imgToCanvasScale = canvasSizeRef.current.width / imageSize.width;

      const frameTime = new Date(streamStartTimeRef.current.getTime() + result.timestamp * 1000);
      const displacecmet = calcDisplacementFromTime(frameTime);

      let scaledResults = []

      result.results.forEach((result) => {
        let result_copy = deepCopy(result);
        result_copy.box[0] *= imgToCanvasScale;
        result_copy.box[1] *= imgToCanvasScale;
        result_copy.box[2] *= imgToCanvasScale;
        result_copy.box[3] *= imgToCanvasScale;

        result_copy.box[0] += displacecmet.x;
        result_copy.box[1] += displacecmet.y;
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
      window.requestAnimationFrame(drawResult);
    }
  }, [isVideoStreamReady]);


  useEffect(() => {
    // 結果取得時のcallbackを登録
    setOnGetResult(onGetResult);

    // リスナーを登録
    window.addEventListener("resize", handleCanvasResize);
    window.addEventListener("orientationchange", handleCanvasResize);

    // クリーンアップ: リスナーを削除
    return () => {
      window.removeEventListener("resize", handleCanvasResize);
      window.removeEventListener("orientationchange", handleCanvasResize);
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