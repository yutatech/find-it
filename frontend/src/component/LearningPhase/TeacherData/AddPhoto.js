import React, { useState, useEffect, useRef } from 'react';
import { Button, TextField, Select, MenuItem } from '@mui/material';
import { Row, Container, Col } from 'react-bootstrap';
import './SettingsStyle.css';

const AddPhoto = () => {
    const [image, setImage] = useState(null);
    const [label, setLabel] = useState('');
    const [labelList, setLabelList] = useState([]);
    const [useNewLabel, setUseNewLabel] = useState(true);
    const videoRef = useRef(null);


    useEffect(() => {
        const apiUrl = process.env.REACT_APP_API_URL;
        fetch(apiUrl + "/api/v1/items") // FastAPIのエンドポイント
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch items");
                }
                return response.json();
            })
            .then((data) => setLabelList(data.items))
            .catch((err) => console.log(err.message));
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
        <Col className="justify-content-center col-12 col-xl-4 h-auto" style={{padding: 0}} >
            <div className="frame-style">
                <h2>教師データを追加</h2>
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
                        写真を選択
                    </Button>
                </label>
            {/* </Container> */}
            </div>
        </Col>
    );
};

export default AddPhoto;
