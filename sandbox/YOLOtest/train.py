from ultralytics import YOLO

# ベースとするモデル
model = YOLO(r'/mnt/c/Users/shingo/YOLO/Glasses/glasses.pt')

# M1 macのGPUを使ってモデルを学習
results = model.train(
    data= r'/mnt/c/Users/shingo/YOLO/watch/data.yaml', 
    epochs=50,
    imgsz=640, 
    device='cpu'
)
