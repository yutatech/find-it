from ultralytics import YOLO
base_model = YOLO('ベースモデルパス')
# ベースとするモデル
model = YOLO('/home/shingo/find-it/sandbox/YOLOtest/runs/detect/train10/weights/glasses_watch.pt')

# M1 macのGPUを使ってモデルを学習
results = base_model.train(
   data= r'/mnt/c/Users/shingo/YOLO/watch/data.yaml', 
   epochs=50,
   imgsz=640, 
   device='cpu',
   name='yolov8n_finetuned',
   pretrained=True,
   )

base_model.export(format='pt')