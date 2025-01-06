from ultralytics import YOLO

# 元のYOLOモデルをロード（事前学習済みのモデル）
base_model = YOLO('/home/shingo/find-it/sandbox/YOLOtest/yolov8n.pt')  # デフォルトYOLOモデル (例: YOLOv8 Nano)

# 新しいデータセットで追加学習
results = base_model.train(
    data= r'/mnt/c/Users/shingo/YOLO/dataset/data.yaml',  # 新しいデータセットのdata.yaml
    epochs=50,  # 追加学習するエポック数
    imgsz=640,  # 画像サイズ
    device='cpu',  # 'cpu' または 'cuda'（GPU使用の場合）
    name='yolov8n_finetuned',  # 結果保存フォルダ名
    pretrained=True,  # 事前学習済みモデルを活用
    patience = 25
)

# 追加学習したモデルを保存
base_model.export(format='pt')  # ファイル形式は PyTorch 形式で保存（他の形式も選択可能）
model = YOLO("/home/shingo/find-it/sandbox/YOLOtest/runs/detect/yolov8n_finetuned/weights/best.pt")
print(model.names)