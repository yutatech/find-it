import React, { useState, useEffect } from 'react';
import {
    Button, Select, MenuItem, TextField, Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import { Col } from 'react-bootstrap';

import './SettingsStyle.css';

const EditPhoto = () => {
    const [images, setImages] = useState([]);
    const [labels, setLabels] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [newLabel, setNewLabel] = useState('');
    const [selectedLabel, setSelectedLabel] = useState('');
    const [open, setOpen] = useState(false);

    // 初期データのロード
    useEffect(() => {
        const storedImages = JSON.parse(localStorage.getItem('images')) || [];
        const storedLabels = JSON.parse(localStorage.getItem('labels')) || [];
        setImages(storedImages);
        setLabels(storedLabels);
    }, []);

    // 画像の削除処理
    const handleDeleteImage = () => {
        const updatedImages = images.filter((img) => img !== selectedImage);
        localStorage.setItem('images', JSON.stringify(updatedImages));
        setImages(updatedImages);
        setSelectedImage(null);
        alert('画像を削除しました。');
    };

    // ラベルの更新処理
    const handleUpdateLabel = () => {
        if (!selectedLabel && !newLabel.trim()) {
            alert('ラベルを選択または入力してください。');
            return;
        }

        const updatedImages = images.map((img) =>
            img === selectedImage ? { ...img, label: newLabel || selectedLabel } : img
        );
        localStorage.setItem('images', JSON.stringify(updatedImages));
        setImages(updatedImages);

        if (newLabel && !labels.includes(newLabel)) {
            const updatedLabels = [...labels, newLabel];
            localStorage.setItem('labels', JSON.stringify(updatedLabels));
            setLabels(updatedLabels);
        }

        setOpen(false);
        setSelectedImage(null);
        alert('ラベルを更新しました。');
    };

    // ラベルごとに画像をグループ化
    const groupedImages = images.reduce((acc, img) => {
        if (!acc[img.label]) {
            acc[img.label] = [];
        }
        acc[img.label].push(img);
        return acc;
    }, {});

    return (
        <Col className="justify-content-center col-12 col-xl-4 h-auto"
            style={{ padding: 0 }}>
            <div className='frame-style'>

                <h1>教師データを編集</h1>

                {Object.keys(groupedImages).length === 0 ? (
                    <p>画像がありません。</p>
                ) : (
                    Object.keys(groupedImages).map((label) => (
                        <div key={label} style={{ marginBottom: 30 }}>
                            <h2>{label}</h2>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                                {groupedImages[label].map((img, index) => (
                                    <img
                                        key={index}
                                        src={img.image}
                                        alt={label}
                                        style={{ width: 150, height: 150, cursor: 'pointer' }}
                                        onClick={() => setSelectedImage(img)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))
                )}

                {/* 選択された画像の操作ボタン */}
                {selectedImage && (
                    <div style={{ marginTop: 30 }}>
                        <h3>選択された画像の操作</h3>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleDeleteImage}
                            style={{ marginRight: 10 }}
                        >
                            画像を削除
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => setOpen(true)}
                        >
                            ラベルの編集
                        </Button>
                    </div>
                )}

                {/* ラベル編集ダイアログ */}
                <Dialog open={open} onClose={() => setOpen(false)}>
                    <DialogTitle>ラベルの編集</DialogTitle>
                    <DialogContent>
                        <Select
                            value={selectedLabel}
                            onChange={(e) => setSelectedLabel(e.target.value)}
                            displayEmpty
                            fullWidth
                            margin="normal"
                        >
                            <MenuItem value="" disabled>ラベルを選択</MenuItem>
                            {labels.map((label, index) => (
                                <MenuItem key={index} value={label}>{label}</MenuItem>
                            ))}
                        </Select>

                        <TextField
                            label="新しいラベルを入力"
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            fullWidth
                            margin="normal"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)}>キャンセル</Button>
                        <Button variant="contained" onClick={handleUpdateLabel}>
                            更新
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </Col>
    );
};

export default EditPhoto;
