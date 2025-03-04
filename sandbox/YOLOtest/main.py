from ultralytics import YOLO
import cv2
import requests
import json

# YOLOモデルのロード
model = YOLO('/home/shingo/find-it/sandbox/YOLOtest/runs/detect/yolov8n_finetuned8/weights/last.pt')
# 画像のパスを指定
image_path = r'/mnt/c/Users/shingo/YOLO/remote/train/images/0F2Y5GJOUACI_jpg.rf.3e770663c648eb5d3748661599762049.jpg'
image = cv2.imread(image_path)

# 検出を許可するラベル
allowed_labels = ['glasses', 'watch','remote']

model.conf = 0.5
print(model.names)
# 物体検出を実行
results = model(image)

# 検出結果をリストに格納
detected_objects = []

for result in results:
    for box in result.boxes:
        # 各検出結果の情報を取得
        x1, y1, x2, y2 = box.xyxy[0]  # バウンディングボックスの座標
        conf = float(box.conf[0])  # 信頼度
        cls = int(box.cls[0])  # クラスID
        label = model.names[cls]  # クラス名

        # 許可されたラベルのみ処理
        if label in allowed_labels:
            # 検出結果を辞書形式で追加
            detected_objects.append({
                "class": label,
                "confidence": conf,
                "bounding_box": {
                    "x1": int(x1),
                    "y1": int(y1),
                    "x2": int(x2),
                    "y2": int(y2)
                }
            })

# サーバーに送信するデータ
payload = {
    "image_name": image_path.split('/')[-1],  # 画像名
    "detected_objects": detected_objects     # 検出結果
}

# 検出された物体を出力
print("Detected Objects:")
for obj in detected_objects:
    print(f"Class: {obj['class']}, Confidence: {obj['confidence']:.2f}, Bounding Box: {obj['bounding_box']}")