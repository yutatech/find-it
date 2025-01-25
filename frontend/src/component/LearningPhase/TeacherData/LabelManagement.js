import React, { useState, useContext } from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Select, MenuItem } from '@mui/material';
import { Col } from 'react-bootstrap';
import { LabelContext } from '../../../modules/LabelContext';
import './SettingsStyle.css';


const LabelManagement = () => {
    const [newLabel, setNewLabel] = useState('');
    const [editLabel, setEditLabel] = useState('');
    const [selectedLabel, setSelectedLabel] = useState('');
    const [open, setOpen] = useState(false);
    const { labelList, setLabelList } = useContext(LabelContext);

    // ラベルの追加
    const handleAddLabel = () => {
        if (!newLabel.trim()) {
            alert('ラベル名を入力してください。');
            return;
        }
        if (labelList.includes(newLabel)) {
            alert('このラベルはすでに存在します。');
            return;
        }
        const updatedLabels = [...labelList, newLabel];
        setLabelList(updatedLabels);
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
        const updatedLabels = labelList.map((lbl) =>
            lbl === selectedLabel ? editLabel : lbl
        );
        setLabelList(updatedLabels);
        setOpen(false);
        alert('ラベルを更新しました。');
    };

    // ラベルの削除
    const handleDeleteLabel = (label) => {
        if (window.confirm(`「${label}」を削除しますか？`)) {
            const updatedLabels = labelList.filter((lbl) => lbl !== label);
            setLabelList(updatedLabels);
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

            <h2 style={{marginTop: '0.5rem'}}>ラベル一覧</h2>
            {labelList.length === 0 ? (
                <p>ラベルがありません。</p>
            ) : (
                labelList.map((label, index) => (
                    <div key={index} style={{ margin: '10px 0' }}>
                        <Button
                            variant="outlined"
                            onClick={() => handleEditClick(label)}
                            style={{ marginRight: 10, width: '65%' }}
                        >
                            {label}
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => {handleDeleteLabel(label);}}
                            style={{ width: '30%' }}
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
