import React, { useState, useEffect } from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Select, MenuItem } from '@mui/material';
import { Row, Col } from 'react-bootstrap';
import './SettingsStyle.css';


const LabelManagement = () => {
    const [labels, setLabels] = useState([]);
    const [newLabel, setNewLabel] = useState('');
    const [editLabel, setEditLabel] = useState('');
    const [selectedLabel, setSelectedLabel] = useState('');
    const [open, setOpen] = useState(false);
    

    // ラベル一覧の読み込み
    useEffect(() => {
        const storedLabels = JSON.parse(localStorage.getItem('labels')) || [];
        setLabels(storedLabels);
    }, []);

    // ラベルの追加
    const handleAddLabel = () => {
        if (!newLabel.trim()) {
            alert('ラベル名を入力してください。');
            return;
        }
        if (labels.includes(newLabel)) {
            alert('このラベルはすでに存在します。');
            return;
        }
        const updatedLabels = [...labels, newLabel];
        localStorage.setItem('labels', JSON.stringify(updatedLabels));
        setLabels(updatedLabels);
        setNewLabel('');
        alert('ラベルを追加しました。');
    };

    // 編集ダイアログのオープン
    const handleEditClick = (label) => {
        setSelectedLabel(label);
        setEditLabel(label);
        setOpen(true);
    };

    // ラベルの編集
    const handleUpdateLabel = () => {
        if (!editLabel.trim()) {
            alert('ラベル名を入力してください。');
            return;
        }
        const updatedLabels = labels.map((lbl) =>
            lbl === selectedLabel ? editLabel : lbl
        );
        localStorage.setItem('labels', JSON.stringify(updatedLabels));
        setLabels(updatedLabels);
        setOpen(false);
        alert('ラベルを更新しました。');
    };

    // ラベルの削除
    const handleDeleteLabel = (label) => {
        if (window.confirm(`「${label}」を削除しますか？`)) {
            const updatedLabels = labels.filter((lbl) => lbl !== label);
            localStorage.setItem('labels', JSON.stringify(updatedLabels));
            setLabels(updatedLabels);
            alert('ラベルを削除しました。');
        }
    };

    return (
        <Col className="justify-content-center col-12 col-xl-4 h-auto"
             style={{padding: 0}}>
            <div className='frame-style'>
            <h1>ラベル管理</h1>

            <TextField
                label="新しいラベル名"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                fullWidth
                margin="normal"
            />
            <Button variant="contained" color="primary" onClick={handleAddLabel}>
                ラベルを追加
            </Button>

            <h2>ラベル一覧</h2>
            {labels.length === 0 ? (
                <p>ラベルがありません。</p>
            ) : (
                labels.map((label, index) => (
                    <div key={index} style={{ margin: '10px 0' }}>
                        <Button
                            variant="outlined"
                            onClick={() => handleEditClick(label)}
                            style={{ marginRight: 10 }}
                        >
                            {label}
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => handleDeleteLabel(label)}
                        >
                            削除
                        </Button>
                    </div>
                ))
            )}

            {/* 編集ダイアログ */}
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>ラベルの編集</DialogTitle>
                <DialogContent>
                    <TextField
                        label="新しいラベル名"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
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

export default LabelManagement;
