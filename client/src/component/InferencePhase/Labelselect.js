import React, { useState, useEffect, useRef } from "react";
// import Camera from "./Camera"; // カメラコンポーネントをインポート
import Camera2 from "./Camera2"; // カメラコンポーネントをインポート
import { Button, TextField, Select, MenuItem } from '@mui/material';


function Labelselect() {
  const [inputValue, setInputValue] = useState(""); // 入力された値
  const [isDropdownVisible, setDropdownVisible] = useState(false); // ドロップダウンの表示状態
  const [selectedLabel, setSelectedLabel] = useState(null); // 選択されたラベル
  const suggestions = ["時計", "メガネ", "リモコン", "イヤホン"];
  const dropdownRef = useRef(null); // ドロップダウン要素を参照
  const [label, setLabel] = useState('');
  const [labelList, setLabelList] = useState([]);
  const [useNewLabel, setUseNewLabel] = useState(true);
 

  // 入力値に基づいて候補をフィルタリング
  const filteredSuggestions = suggestions.filter((item) =>
    item.toLowerCase().includes(inputValue.toLowerCase())
  );


  useEffect(() => {
    const storedLabels = JSON.parse(localStorage.getItem('labels')) || [];
    setLabelList(storedLabels);
}, []);

  // 非表示処理を設定
  useEffect(() => {
    const handleClickOutside = (event) => {
      // ドロップダウンやテキストボックス外をクリックしたら非表示にする
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // ラベル選択時の処理
  const handleSelect = (label) => {
    setSelectedLabel(label); // 選択したラベルを保存
    setDropdownVisible(false); // ドロップダウンを非表示
  };

  return (
    <div>
      
      {/* ラベル選択画面 */}
      {!selectedLabel ? (
        <div style={{ position: "relative", width: "200px" }} ref={dropdownRef}>
          <h2>何を探しますか？</h2>
          {/* テキストボックス */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setDropdownVisible(true)} // フォーカス時にドロップダウンを表示
            placeholder="Type to search..."
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />

          {/* 選択候補のドロップダウン */}
          {isDropdownVisible && filteredSuggestions.length > 0 && (
            <ul
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                margin: 0,
                padding: "8px 0",
                listStyle: "none",
                background: "#fff",
                border: "1px solid #ccc",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                zIndex: 1000,
              }}
            >
              {filteredSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => handleSelect(suggestion)}
                  style={{
                    padding: "8px",
                    cursor: "pointer",
                    background: "#fff",
                  }}
                  onMouseOver={(e) => (e.target.style.background = "#f0f0f0")}
                  onMouseOut={(e) => (e.target.style.background = "#fff")}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
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
        </div>
      ) : (
        // カメラコンポーネントを表示
        <Camera2 label={selectedLabel} />
      )}
    </div>
  );
}

export default Labelselect;
