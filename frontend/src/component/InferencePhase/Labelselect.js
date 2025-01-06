import React, { useState, useEffect} from "react";
// import Camera from "./Camera"; // カメラコンポーネントをインポート
import Camera2 from "./Camera2"; // カメラコンポーネントをインポート
import { Autocomplete, TextField} from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Labelselect() {
  const [selectedLabel] = useState(null); 
  const [label, setLabel] = useState('');
  const [labelList, setLabelList] = useState([]);
  // const [useNewLabel, setUseNewLabel] = useState(true);
  const navigate = useNavigate();

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

  // ラベルを選択したときの処理
  const handleLabelChange = (event, newValue) => {
    if (newValue) {
      setLabel(newValue);
      navigate("/InferencePhasePage/camera",{state:{label: newValue}});
    }
  };
  
  return (
    <div>
      {/* ラベル選択画面 */}
      {!selectedLabel ? (
        <div style={{ position: "relative", width: "200px" }}>
          <h2>何を探しますか？</h2>
            <Autocomplete
            options={labelList}
            value={label}
            onChange={handleLabelChange}
            open // 常に候補を表示する
            disableCloseOnSelect // 候補を選択してもリストが閉じないようにする
            renderInput={(params) => <TextField {...params} label="ラベルを選択" inputProps={{ ...params.inputProps, readOnly: true }}/>}
            fullWidth
            />
        </div>
      ) : (
        // カメラコンポーネントを表示
        <Camera2 label={selectedLabel} />
      )}
    </div>
  );
}

export default Labelselect;