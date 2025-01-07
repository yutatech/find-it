/**
 * 
 * @param {CanvasRenderingContext2D} canvasContext 
 * @param {{box[4], label}} result : 認識結果一つ分のデータ
 */
export default function DrawResult(canvasContext, result) {
  const ctx = canvasContext;
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
}