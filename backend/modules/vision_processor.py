import math
from ultralytics import YOLO
import cv2
from modules.session_controller import SessionController
import logging


class VisionProcessor:
    def __init__(self, session_controller: SessionController):
        # self.model = torch.hub.load("ultralytics/yolov8", "yolov8")
        self.model = YOLO("find_it_model.pt")
        self.set_log_level_for_all(logging.ERROR)
        print("load model complete")

        session_controller.labels = [i for i in self.model.names.values()]
        print(session_controller.labels)

        self.session_controller = session_controller
        
    def set_log_level_for_all(self, level):
        for logger_name, logger_instance in logging.root.manager.loggerDict.items():
            if isinstance(logger_instance, logging.Logger):  # Loggerインスタンスのみ対象
                logger_instance.setLevel(level)

    def on_frame_received(self, sid, frame):
        try:
            img = frame.to_ndarray(format="rgb24")
            img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

            # cv2.imshow("Received Video", img)
            # cv2.waitKey(1)  # OpenCVでフレーム表示を更新
            results = self.model(img)
        except Exception as e:
            print("Error VisionProcessor.on_frame_received():", e)
            return

        names = results[0].names
        classes = results[0].boxes.cls
        boxes = results[0].boxes
        annotatedFrame = results[0].plot()

        target_label = self.session_controller.get_target_label(sid)
        result_dict = []
        # print("\n\n\n")
        for box, cls in zip(boxes, classes):
            name = names[int(cls)]
            if name == target_label:
                x1, y1, x2, y2 = [int(i) for i in box.xyxy[0]]
                # print(name, x1, y1, x2, y2)
                result_dict.append({"label": name, 
                                    "center_x": (x1 + x2)/2,
                                    "center_y": (y1 + y2)/2,
                                    "width": x2 - x1,
                                    "height": y2 - y1})

        return {
            "timestamp": frame.time,
            "image_size": {"width": img.shape[1], "height": img.shape[0]},
            "target_label": target_label,
            "results": result_dict,
        }
