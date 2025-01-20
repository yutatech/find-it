import React, { useState, useEffect} from "react";
import { Autocomplete, TextField} from '@mui/material';
import { Row } from "react-bootstrap";

function LabelSelect() {
  const [selectedLabel] = useState(null); 
  const [label, setLabel] = useState('');
  const [labelList, setLabelList] = useState([]);

  useEffect(() => {
    // itemsの取得
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



  // ラベルを選択したときの処理
  const handleLabelChange = (event, newValue) => {
    if (newValue) {
      setLabel(newValue);
    }
  };
  
  return (
    <Row className="col-8 col-sm-8 col-md-6 col-lg-3 col-xl-3" style={{marginTop: '2vh'}}>
      <Autocomplete
      options={labelList}
      value={label}
      onChange={handleLabelChange}
      // open // 常に候補を表示する
      // disableCloseOnSelect // 候補を選択してもリストが閉じないようにする
      renderInput={(params) => <TextField {...params} label="ラベルを選択" inputProps={{ ...params.inputProps, readOnly: true }}/>}
      fullWidth
      />
    </Row>
  );
}

export default LabelSelect;