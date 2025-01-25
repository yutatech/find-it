/**
 * 
 * @param {CanvasRenderingContext2D} canvasContext 
 * @param {{box[4], label}} result : 認識結果一つ分のデータ
 */
export default function DrawResult(canvasContext, result) {
  const ctx = canvasContext;

  const x = result.center_x;
  const y = result.center_y;
  const radiusX = result.width / 2;
  const radiusY = result.height / 2;

  ctx.shadowColor = 'rgb(255, 255, 255)';
  ctx.shadowBlur = 25; // 影のぼかし量
  ctx.shadowOffsetX = 0; // 影の水平オフセット
  ctx.shadowOffsetY = 0; // 影の垂直オフセット

  // 影付き楕円の描画
  ctx.beginPath();
  ctx.fillStyle = 'rgba(255, 255, 255, 1)';
  ctx.ellipse(x,y, radiusX + 2, radiusY + 2, 0, 0, 2 * Math.PI);
  ctx.fill();
  ctx.strokeStyle = 'rgb(255, 255, 255)'; // 楕円の枠線の色
  ctx.lineWidth = 5;
  ctx.stroke();


  // 背景透過部分の楕円の描画
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = 'rgba(0, 0, 0, 1)'; // 透明領域の設定
  ctx.shadowColor = 'transparent';

  ctx.beginPath();
  ctx.ellipse(x, y, radiusX, radiusY, 0, 0, 2 * Math.PI);
  ctx.fill();
  ctx.lineWidth = 0;
  ctx.stroke();

  ctx.globalCompositeOperation = 'source-over';
}