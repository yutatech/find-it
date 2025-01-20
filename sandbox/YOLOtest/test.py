from ultralytics import YOLO
import cv2

# YOLOモデルのロード
model = YOLO('/home/shingo/find-it/sandbox/YOLOtest/runs/detect/yolov8n_finetuned4/weights/best.pt')

def detect_video(model, video_source=0):
    cap = cv2.VideoCapture(video_source)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # YOLOモデルで推論
        results = model(frame)

        for r in results:
            boxes = r.boxes
            for box in boxes:
                # バウンディングボックスの座標
                x1, y1, x2, y2 = box.xyxy[0]
                
                # ラベルと信頼度
                label = box.label  # ラベル (クラス名)
                confidence = box.conf  # 信頼度
                label_text = f"{label}: {confidence:.2f}"

                # バウンディングボックスを描画
                cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)
                
                # ラベルを描画
                cv2.putText(frame, label_text, (int(x1), int(y1) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        # フレームを表示
        cv2.imshow('Video', frame)
        if cv2.waitKey(1) == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

# 使用例
detect_video(model)
