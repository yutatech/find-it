import { useRef, useEffect, use } from "react";

const useOpticalFlow = (videoStreamRef, isVideoStreamReady) => {
  const cvRef = useRef(window.cv);
  const playingRef = useRef(false);
  const cvReadyRef = useRef(false);
  const videoRef = useRef(null);

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
    console.log("opt flow start");
  };

  const stop = () => {
    playingRef.current = false;
    console.log("opt flow stop");
  };

  const onUpdate = () => {
    if (playingRef.current) {
      if (cvReadyRef.current) {
        console.log("cvReady");
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
    console.log(settings.width, settings.height);

    video.height = settings.height / 3;
    video.width = settings.width / 3;

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

  const calcOpticalFlow = () => {
    if (cvReadyRef.current) {
      // try {
          const video = videoRef.current;
          const cap = new cvRef.current.VideoCapture(video);
          const cv = cvRef.current;

          // start processing.
          cap.read(frame2Ref.current);
          cv.cvtColor(frame2Ref.current, nextRef.current, cv.COLOR_RGBA2GRAY);
          cv.calcOpticalFlowFarneback(prvImgRef.current, nextRef.current, flowRef.current, 0.5, 3, 15, 3, 5, 1.2, 0);
          cv.split(flowRef.current, flowVecRef.current);
          let u = flowVecRef.current.get(0);
          let v = flowVecRef.current.get(1);
          // console.log(u)


          cv.cartToPolar(u, v, magRef.current, angRef.current);
          u.delete(); v.delete();
          angRef.current.convertTo(hsv0Ref.current, cv.CV_8UC1, 180/Math.PI/2);
          cv.normalize(magRef.current, hsv2Ref.current, 0, 255, cv.NORM_MINMAX, cv.CV_8UC1);
          cv.merge(hsvVecRef.current, hsvRef.current);
          cv.cvtColor(hsvRef.current, rgbRef.current, cv.COLOR_HSV2RGB);
          cv.imshow('canvasOutput', rgbRef.current);
          nextRef.current.copyTo(prvImgRef.current);
  
      // } catch (err) {
      //     console.log(err);
      // }
    }
  };

  return { onUpdate };
};

export default useOpticalFlow;