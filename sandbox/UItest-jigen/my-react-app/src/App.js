// メインコンポーネント
import React, { useState } from "react";
import Labelselect from "./Labelselect";
import Camera2 from "./Camera2";

function App() {
    const [selectedLabel, setSelectedLabel] = useState(null);
    const [showCamera, setShowCamera] = useState(false);
  
    const items = ["Option 1", "Option 2", "Option 3"]; // 検索ボックスのデータ
  
    const handleItemSelect = (item) => {
      setSelectedLabel(item);
      setShowCamera(true);
    };
  
    const handleCloseCamera = () => {
      setSelectedLabel(null);
      setShowCamera(false);
    };
  
    return (
      <div>
        <h1>探索フェーズ</h1>
        {/* {!showCamera ? (
          <Labelselect items={items} onItemSelect={handleItemSelect} />
        ) : (
          <Camera2
            selectedLabel={selectedLabel}
            onClose={handleCloseCamera}
          />
        )} */}
        <Labelselect items={items} onItemSelect={handleItemSelect} />
      </div>
    );
  }
  
  export default App;
  