import React, { useState, useContext } from 'react';
import { Button, Select, MenuItem } from '@mui/material';
import { LabelContext } from '../../../modules/LabelContext';
import { Col } from 'react-bootstrap';

const AddPhoto = () => {
    const [image, setImage] = useState(null);
    const [label, setLabel] = useState('');
    const { labelList } = useContext(LabelContext);

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
            alert('ラベルを選択してください。');
            return;
        }

        const storedImages = JSON.parse(localStorage.getItem('images')) || [];
        storedImages.push({ label, image: imageData });
        localStorage.setItem('images', JSON.stringify(storedImages));

        alert('画像を保存しました！');
        setLabel('');
        setImage(null);
    };

    return (
        <Col className="justify-content-center col-12 col-xl-4 h-auto" style={{ padding: 0 }} >
            <div className="frame-style">
                <h2>教師データを追加</h2>
                <Select
                    value={label}
                    onChange={(e) => {
                        setLabel(e.target.value);
                    }}
                    displayEmpty
                    fullWidth
                    style={{ marginBottom: '0.5rem' }}
                >
                    <MenuItem value="" disabled>ラベルを選択</MenuItem>
                    {labelList.map((lbl, index) => (
                        <MenuItem key={index} value={lbl}>{lbl}</MenuItem>
                    ))}
                </Select>

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
