import React, { useState, useEffect, useContext, use } from "react";
import { Autocomplete, TextField } from '@mui/material';
import { Row } from "react-bootstrap";
import { SocketRefContext } from "../../modules/SocketRefContext";

function LabelSelect() {
  const socketRef = useContext(SocketRefContext);
  const [selectedLabel] = useState(null);
  const [label, setLabel] = useState('');
  const [labelList, setLabelList] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL;

  function setTargetLabel(label) {
    setLabel(label);

    fetch(apiUrl + `/api/v1/set_target_label?target_label=${encodeURIComponent(label)}`, // FastAPIのエンドポイント
      {
        headers: {
          'sid': socketRef.current.id
        },
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to set set_target_label");
        }
      })
      .catch((err) => console.log(err.message));
  }

  useEffect(() => {
    // itemsの取得
    fetch(apiUrl + "/api/v1/items", // FastAPIのエンドポイント
      {
        headers: {
          'sid': socketRef.current.id
        }
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch items");
        }
        return response.json();
      })
      .then((data) => setLabelList(data.items))
      .catch((err) => console.log(err.message));
  }, []);

  useEffect(() => {
    // LabelListが取得できたら、target_labelを取得
    fetch(apiUrl + "/api/v1/get_target_label", // FastAPIのエンドポイント
      {
        headers: {
          'sid': socketRef.current.id
        }
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch items");
        }
        return response.json();
      })
      .then((data) => {
        if (data.target_label !== null) {
          setLabel(data.target_label);
        }
        else {
          console.log('labelList:', labelList);
          setLabel(labelList[0]);
        }
        console.log('target_label:', data.target_label);
      })
      .catch((err) => console.log(err.message));
  }, [labelList]);



  // ラベルを選択したときの処理
  const handleLabelChange = (event, newValue) => {
    if (newValue) {
      setTargetLabel(newValue);
    }
  };

  return (
    <Row className="col-8 col-sm-8 col-md-6 col-lg-3 col-xl-3" style={{ marginTop: '2vh' }}>
      <Autocomplete
        options={labelList}
        value={label}
        onChange={handleLabelChange}
        // open // 常に候補を表示する
        // disableCloseOnSelect // 候補を選択してもリストが閉じないようにする
        renderInput={(params) => <TextField {...params} label="ラベルを選択" inputProps={{ ...params.inputProps, readOnly: true }} />}
        fullWidth
      />
    </Row>
  );
}

export default LabelSelect;