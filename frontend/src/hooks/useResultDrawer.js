import { useRef, useState, useEffect } from "react";

const useResultDrawer = (canvasRef, videoSize) => {
  const canvasSizeRef = useRef({ width: videoSize.width, height: videoSize.height });
  const videoSizeRef = useRef(videoSize);
  const [ canvasSize, setCanvasSize ] = useState({ width: videoSize.width, height: videoSize.height });

  const drawResult = (result) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const imageSize = { width: result.image_size.width, height: result.image_size.height };
    const scale = canvas.width / canvasSizeRef.current.width;
  
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    // キャンバスをクリア
    ctx.clearRect(0, 0, canvasSizeRef.current.width, canvasSizeRef.current.height);

    const imgToCanvasScale = canvasSizeRef.current.width / imageSize.width;

    result.results.forEach((result) => {
      let box = Object.assign({}, result.box);
      box[0] *= imgToCanvasScale;
      box[1] *= imgToCanvasScale;
      box[2] *= imgToCanvasScale;
      box[3] *= imgToCanvasScale;

      let fillStyle = "";
      let textStyle = "";
      if (result.label === 'person') {
        fillStyle = "rgba(255, 0, 0, 0.5)";
        textStyle = "rgba(255, 0, 0, 1)";
      }
      else {
        fillStyle = "rgba(0, 255, 0, 0.5)";
        textStyle = "rgba(0, 255, 0, 1)";
      }
      ctx.fillStyle = fillStyle;
      ctx.fillRect(box[0], box[1], box[2], box[3]);
      ctx.fillStyle = textStyle;
      ctx.font = "15px Arial";
      ctx.fillText(result.label, box[0], box[1] + 15);
    });
    ctx.strokeRect(10, 10, canvasSizeRef.current.width - 20, canvasSizeRef.current.height - 20);
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvasSizeRef.current.width, canvasSizeRef.current.height);
  };

  const handleCanvasResize = () => {
    let width = videoSizeRef.current.width;
    let height = videoSizeRef.current.height;

    console.log('before:', width, height);
    if (width > window.innerWidth) {
      height = window.innerWidth * height / width;
      width = window.innerWidth;
    }
    if (height > window.innerHeight) {
      width = window.innerHeight * width / height;
      height = window.innerHeight;
    }
    console.log('after:', width, height);

    canvasSizeRef.current = { width: width, height: height };
    setCanvasSize({ width: width, height: height });
  };

  useEffect(() => {
    videoSizeRef.current = videoSize;
    handleCanvasResize();
  }, [videoSize]);


  useEffect(() => {
    // リスナーを登録
    window.addEventListener("resize", handleCanvasResize);

    // クリーンアップ: リスナーを削除
    return () => {
      window.removeEventListener("resize", handleCanvasResize);
    };
  }, []);

  return { drawResult, clearCanvas, canvasSize };
};

export default useResultDrawer;