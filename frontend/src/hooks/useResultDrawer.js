import { useState, useEffect } from "react";

const useResultDrawer = (canvasRef, videoSize) => {
  const [canvasSize, setCanvasSize] = useState({ width: videoSize.width, height: videoSize.height });
  const drawResult = (result) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const imageSize = { width: result.image_size.width, height: result.image_size.height };

    const scale = canvas.width / videoSize.width;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    // キャンバスをクリア
    ctx.clearRect(0, 0, videoSize.width, videoSize.height);

    const imgTocanvasScale = videoSize.width / imageSize.width;
    // console.log('result:', result);
    result.results.forEach((result) => {
      result.box[0] *= imgTocanvasScale;
      result.box[1] *= imgTocanvasScale;
      result.box[2] *= imgTocanvasScale;
      result.box[3] *= imgTocanvasScale;

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
      ctx.fillRect(result.box[0], result.box[1], result.box[2], result.box[3]);
      ctx.fillStyle = textStyle;
      ctx.font = "15px Arial";
      ctx.fillText(result.label, result.box[0], result.box[1] + 15);
      ctx.strokeRect(10, 10, videoSize.width - 20, videoSize.height - 20);
    });
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, videoSize.width, videoSize.height);
  };

  const handleCanvasResize = () => {
    let width = videoSize.width;
    let height = videoSize.height;

    if (width > window.innerWidth) {
      height = window.innerWidth * height / width;
      width = window.innerWidth;
    }
    if (height > window.innerHeight) {
      width = window.innerHeight * width / height;
      height = window.innerHeight;
    }

    setCanvasSize({ width: width, height: height });
  };

  useEffect(() => {
    console.log('canvasSize:', canvasSize.width, canvasSize.height);
  }, [canvasSize]);


  useEffect(() => {
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