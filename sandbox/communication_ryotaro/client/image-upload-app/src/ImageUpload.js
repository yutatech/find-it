// src/components/ImageUpload.js
import React, { useState } from "react";
import axios from "axios";

const ImageUpload = () => {
  const [image, setImage] = useState(null); // 画像ファイルの状態を管理

  // 画像が選択されたときの処理
  const onFileChange = (event) => {
    setImage(event.target.files[0]); // 画像ファイルを状態にセット
  };

  // 画像をサーバーに送信する処理
  const onFileUpload = async () => {
    if (!image) {
      alert("画像が選択されていません。");
      return;
    }

    const formData = new FormData();
    formData.append("file", image);

    try {
      // FastAPIサーバーに画像を送信
      const response = await axios.post("http://localhost:8000/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("ファイルがアップロードされました！ 返却されたパス: " + response.data.file_path);
    } catch (error) {
      alert("アップロード中にエラーが発生しました。");
      console.error(error);
    }
  };

  return (
    <div>
      <h2>画像アップロード</h2>
      <input type="file" onChange={onFileChange} />
      <button onClick={onFileUpload}>アップロード</button>
    </div>
  );
};

export default ImageUpload;
