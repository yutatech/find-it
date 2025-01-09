import { useRef } from "react";


const useOpticalFlow = () => {
  const cvRef = useRef(window.cv);

  // OpenCV の初期化完了を待つ
  cvRef.current.onRuntimeInitialized = () => {
    console.log('OpenCV.js is ready!');
  };

  const onUpdate = () => {

  };

  return { onUpdate };
};