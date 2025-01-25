import { useRef, useEffect } from "react";

const useOpticalFlow = (videoStreamRef, isVideoStreamReady) => {
  const cvRef = useRef(window.cv);
  const playingRef = useRef(false);
  const cvReadyRef = useRef(false);
  const videoRef = useRef(null);
  const flowHistoryRef = useRef([]);

  const downScale = 3;

  // OpenCV の初期化完了を待つ
  cvRef.current.onRuntimeInitialized = () => {
    console.log('OpenCV.js is ready!');
    cvReadyRef.current = true;
  };

  useEffect(() => {
    if (isVideoStreamReady) {
      if (cvRef.current.getBuildInformation !== undefined) {
        console.log('OpenCV.js is already initilized!');
        cvReadyRef.current = true;
      }

      const videoElement = document.createElement("video");
      videoElement.playsInline = true;
      videoElement.srcObject = videoStreamRef.current;
      videoElement.play();
      videoRef.current = videoElement;

      start();
      return () => {
        stop();
      };
    }
  }, [isVideoStreamReady]);

  const start = () => {
    playingRef.current = true;
    startOptFlow();
    window.requestAnimationFrame(onUpdate);
  };

  const stop = () => {
    playingRef.current = false;
  };

  const onUpdate = () => {
    if (playingRef.current) {
      if (cvReadyRef.current) {
        calcOpticalFlow();
      }
      window.requestAnimationFrame(onUpdate);
    }
  };

  const prvImgRef = useRef(null);
  const hsvRef = useRef(null);
  const hsv0Ref = useRef(null);
  const hsv1Ref = useRef(null);
  const hsv2Ref = useRef(null);
  const hsvVecRef = useRef(null);

  const frame2Ref = useRef(null);
  const nextRef = useRef(null);
  const flowRef = useRef(null);
  const flowVecRef = useRef(null);
  const magRef = useRef(null);
  const angRef = useRef(null);
  const rgbRef = useRef(null);
  const startOptFlow = () => {
    const video = videoRef.current;
    const cap = new cvRef.current.VideoCapture(video);
    const cv = cvRef.current;


    prvImgRef.current = new cv.Mat()
    // take first frame of the video

    const videoTrack = videoStreamRef.current.getVideoTracks()[0];
    const settings = videoTrack.getSettings();

    video.height = settings.height / downScale;
    video.width = settings.width / downScale;

    let frame1 = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    cap.read(frame1);
    cv.cvtColor(frame1, prvImgRef.current, cv.COLOR_RGBA2GRAY);
    frame1.delete();

    hsvRef.current = new cv.Mat();
    hsv0Ref.current = new cv.Mat(video.height, video.width, cv.CV_8UC1);
    hsv1Ref.current = new cv.Mat(video.height, video.width, cv.CV_8UC1, new cv.Scalar(255));
    hsv2Ref.current = new cv.Mat(video.height, video.width, cv.CV_8UC1);
    hsvVecRef.current = new cv.MatVector();
    hsvVecRef.current.push_back(hsv0Ref.current);
    hsvVecRef.current.push_back(hsv1Ref.current);
    hsvVecRef.current.push_back(hsv2Ref.current);

    frame2Ref.current = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    nextRef.current = new cv.Mat(video.height, video.width, cv.CV_8UC1);
    flowRef.current = new cv.Mat(video.height, video.width, cv.CV_32FC2);
    flowVecRef.current = new cv.MatVector();
    magRef.current = new cv.Mat(video.height, video.width, cv.CV_32FC1);
    angRef.current = new cv.Mat(video.height, video.width, cv.CV_32FC1);
    rgbRef.current = new cv.Mat(video.height, video.width, cv.CV_8UC3);
  }

  function calculateMedian(mat) {
    // 1. Matを1次元配列に変換
    let data = mat.data32F; // ここでは32ビット浮動小数点型のデータを使用しています。適宜型を変更してください。

    // 2. 配列をソート
    let sortedData = Array.from(data).sort((a, b) => a - b);

    const threshold = 0.1; // 絶対値の閾値
    // 負の側の要素を処理
    const firstPositiveIndex = sortedData.findIndex(value => value >= -threshold);
    // 正の側の要素を処理
    const lastValidIndex = sortedData.findIndex(value => value > threshold);
    // 残したい要素だけを抽出
    sortedData = sortedData.slice(0, firstPositiveIndex).concat(sortedData.slice(lastValidIndex));

    // 3. 中央値を計算
    let middle = Math.floor(sortedData.length / 2);
    let median;

    if (sortedData.length % 2 === 0) {
      // 偶数個の要素の場合、中央の2つの要素の平均
      median = (sortedData[middle - 1] + sortedData[middle]) / 2;
    } else {
      // 奇数個の要素の場合、中央の要素
      median = sortedData[middle];
    }

    return median;
  }

  const calcOpticalFlow = () => {
    if (cvReadyRef.current) {
      const video = videoRef.current;
      const cap = new cvRef.current.VideoCapture(video);
      const cv = cvRef.current;

      cap.read(frame2Ref.current);
      cv.cvtColor(frame2Ref.current, nextRef.current, cv.COLOR_RGBA2GRAY);
      cv.calcOpticalFlowFarneback(prvImgRef.current, nextRef.current, flowRef.current, 0.5, 3, 15, 3, 5, 1.2, 0);
      cv.split(flowRef.current, flowVecRef.current);
      nextRef.current.copyTo(prvImgRef.current);

      const u = flowVecRef.current.get(0);
      const v = flowVecRef.current.get(1);
      const flowArrow = { x: calculateMedian(u) * downScale, y: calculateMedian(v) * downScale, timestamp: new Date() };
      flowHistoryRef.current.push(flowArrow);

      // Debug
      /*
      const canvas = document.getElementById("canvasDebugOut");

      cv.cartToPolar(u, v, magRef.current, angRef.current);
      u.delete(); v.delete();
      angRef.current.convertTo(hsv0Ref.current, cv.CV_8UC1, 180 / Math.PI / 2);
      cv.normalize(magRef.current, hsv2Ref.current, 0, 255, cv.NORM_MINMAX, cv.CV_8UC1);
      cv.merge(hsvVecRef.current, hsvRef.current);
      cv.cvtColor(hsvRef.current, rgbRef.current, cv.COLOR_HSV2RGB);
      cv.imshow('canvasDebugOut', rgbRef.current);

      const ctx = canvas.getContext("2d");
      ctx.lineWidth = 2;
      ctx.strokeStyle = "red";
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, canvas.height / 2);
      ctx.lineTo(canvas.width / 2 + flowArrow.x * 10, canvas.height / 2 + flowArrow.y * 10);
      ctx.stroke();
      */
    }
  };

  const calcDisplacementFromTime = (time) => {
    while (flowHistoryRef.current.length > 0 &&
      flowHistoryRef.current[0].timestamp < time) { // 条件: timestamp が現在時刻以下
      flowHistoryRef.current.shift(); // 先頭の要素を削除
    }

    const displacement = {
      x: flowHistoryRef.current.reduce((sum, item) => sum + item.x, 0),
      y: flowHistoryRef.current.reduce((sum, item) => sum + item.y, 0)
    };
    return displacement
    // return {x: 0, y: 0};
  }
  return { calcDisplacementFromTime };
};

export default useOpticalFlow;