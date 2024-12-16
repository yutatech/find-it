import React, { useState, useEffect, useRef } from 'react';
import { Button, TextField, Select, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AddPhoto = () => {
    const [image, setImage] = useState(null);
    const [label, setLabel] = useState('');
    const [labelList, setLabelList] = useState([]);
    const [useNewLabel, setUseNewLabel] = useState(true);
    const videoRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedLabels = JSON.parse(localStorage.getItem('labels')) || [];
        setLabelList(storedLabels);
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                saveImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const startCamera = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
    };

    const takePhoto = () => {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
        saveImage(canvas.toDataURL('image/png'));
    };

    const saveImage = (imageData) => {
        if (!label) {
            alert('ラベルを入力または選択してください。');
            return;
        }

        const storedImages = JSON.parse(localStorage.getItem('images')) || [];
        storedImages.push({ label, image: imageData });
        localStorage.setItem('images', JSON.stringify(storedImages));

        if (useNewLabel && !labelList.includes(label)) {
            const updatedLabels = [...labelList, label];
            localStorage.setItem('labels', JSON.stringify(updatedLabels));
            setLabelList(updatedLabels);
        }
        alert('画像を保存しました！');
        setLabel('');
        setImage(null);
    };

    return (
        <div>
            <button onClick={() => navigate('/page1')}>戻る</button>

            <h2>ラベルを選択または入力</h2>
            <Select
                value={useNewLabel ? '' : label}
                onChange={(e) => {
                    setLabel(e.target.value);
                    setUseNewLabel(false);
                }}
                displayEmpty
                fullWidth
            >
                <MenuItem value="" disabled>ラベルを選択</MenuItem>
                {labelList.map((lbl, index) => (
                    <MenuItem key={index} value={lbl}>{lbl}</MenuItem>
                ))}
            </Select>

            <TextField
                label="新しいラベルを入力"
                value={useNewLabel ? label : ''}
                onChange={(e) => {
                    setLabel(e.target.value);
                    setUseNewLabel(true);
                }}
                fullWidth
                margin="normal"
            />

            <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                id="fileInput"
                onChange={handleFileChange}
            />
            <label htmlFor="fileInput">
                <Button component="span" variant="contained">
                    ライブラリから画像を選択
                </Button>
            </label>

            <Button onClick={startCamera} variant="contained" color="primary">
                カメラを起動
            </Button>

            <video ref={videoRef} autoPlay style={{ width: '100%', marginTop: 20 }}></video>
            <Button onClick={takePhoto} variant="contained" color="secondary">
                写真を撮って追加
            </Button>
        </div>
    );
};

export default AddPhoto;
