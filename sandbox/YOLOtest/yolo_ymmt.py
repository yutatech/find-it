from ultralytics import YOLO
import cv2
import os

# YOLOモデルの読み込み
model = YOLO('yolov8n.pt')

# 画像から物体識別を行う関数
def detect_objects_in_image(model, image_path):
    # 画像を読み込む
    image = cv2.imread(image_path)
    if image is None:
        print(f"Error: Cannot open image file {image_path}")
        return None

    # YOLOで物体検出を実行
    results = model(image)

    # 検出された物体の座標を格納するリスト
    detected_objects = []

    # 検出結果を解析
    for r in results:
        boxes = r.boxes
        for box in boxes:
            # バウンディングボックスの座標を取得 (x1, y1, x2, y2)
            x1, y1, x2, y2 = box.xyxy[0]
            # 座標をリストに保存
            detected_objects.append({
                'x1': int(x1),
                'y1': int(y1),
                'x2': int(x2),
                'y2': int(y2),
                'confidence': float(box.conf[0])  # 信頼度
            })
            # バウンディングボックスを描画
            cv2.rectangle(image, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)

    # 検出結果を表示
    cv2.imshow('Detected Objects', image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

    # 座標リストを返す
    return detected_objects

# 使用例: 画像ファイルを指定
image_file_path = "C:/Users/Hinako Yamamoto/Desktop/cyber_physical_solution/picture.jpg"  # 処理したい画像のパス
detected_boxes = detect_objects_in_image(model, image_file_path)

# ファイルが存在するか確認
if not os.path.exists(image_file_path):
    print(f"Error: File does not exist at {image_file_path}")
else:
    print(f"File exists at {image_file_path}, but could not be opened.")

# 検出結果を表示
if detected_boxes:
    print("Detected Objects:")
    for obj in detected_boxes:
        print(obj)
else:
    print("No objects detected.")

