import math
from ultralytics import YOLO
import cv2

class VisionProcessor:
    def __init__(self):
        self.counter = 0
        # self.model = torch.hub.load("ultralytics/yolov8", "yolov8")
        self.model = YOLO("find_it_model.pt")
        print('load model complete')
    
    def on_frame_received(self, sid, frame):
        self.counter += 1
        
        try:
            # OpenCVで画像を表示
            img = frame.to_ndarray(format="rgb24")
            img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
            
            cv2.imshow("Received Video", img)
            cv2.waitKey(1)  # OpenCVでフレーム表示を更新
            results = self.model(img)
        except Exception as e:
            print("Error VisionProcessor.on_frame_received():", e)
            return
        
        names = results[0].names
        classes = results[0].boxes.cls
        boxes = results[0].boxes
        annotatedFrame = results[0].plot()
  
  
        result_dict = []
        # print("\n\n\n")
        for box, cls in zip(boxes, classes):
            name = names[int(cls)]
            x1, y1, x2, y2 = [int(i) for i in box.xyxy[0]]
            # print(name, x1, y1, x2, y2)
            result_dict.append({
                "label": name,
                "box": [x1, y1, x2 - x1, y2 - y1]
            })
        return {
            "image_size": {'width': img.shape[1], 'height': img.shape[0]},
            "results": result_dict
        }
        
        x = math.sin(self.counter / 10) * 10
        y = math.cos(self.counter / 10) * 10
        return {
            "results": [
                {
                    "label": "person",
                    "confidence": 0.9,
                    "box": [x + 50, y + 50, 50, 50]
                },
                {
                    "label": "car",
                    "confidence": 0.8,
                    "box": [-x + 100, -y + 100, 50, 50]
                }
            ]
        }