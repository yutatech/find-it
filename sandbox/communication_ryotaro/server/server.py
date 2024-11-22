from fastapi import FastAPI, File, UploadFile
import os
import uvicorn

# FastAPIアプリケーションを作成
app = FastAPI()

# 画像の保存ディレクトリ
UPLOAD_DIR = "uploaded_images"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 画像をアップロードするエンドポイント
@app.post("/upload/")
async def upload_image(file: UploadFile = File(...)):
    # 保存先パスを決定
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    # 画像を保存
    with open(file_path, "wb") as f:
        f.write(await file.read())

    print('保存したよ')

    return {"message": "File uploaded successfully!", "file_path": file_path}

# 確認用: サーバーが動いているかチェック
@app.get("/")
async def root():
    return {"message": "Hello, this is the image upload API!"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug")
