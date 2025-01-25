import React, { useState, createContext, useContext, useEffect } from 'react';
import { SocketRefContext } from './SocketRefContext';

export const LabelContext = createContext();

export const LabelProvider = ({ children }) => {
  const [labelList, setLabelList] = useState([]);
  const [label, setLabel] = useState(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const socketRef = useContext(SocketRefContext);

  socketRef.current.on('connect', () => {
    // labelListが取得済みの場合は何もしない
    if (labelList.length > 0) {
      return;
    }

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
  });

  const setTargetLabel = (targetLabel) => {
    setLabel(targetLabel);
    localStorage.setItem('target_label', targetLabel);

    fetch(apiUrl + `/api/v1/set_target_label?target_label=${encodeURIComponent(targetLabel)}`, // FastAPIのエンドポイント
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
  };

  useEffect(() => {
    if (labelList.length === 0) {
      return;
    }

    // LabelListが取得できたら、target_labelを取得
    const targetLabel = localStorage.getItem('target_label');

    if (labelList.includes(targetLabel)) {
      setTargetLabel(targetLabel);
    }
    else {
      setTargetLabel(labelList[0]);
    }
  }, [labelList]);

  return (
    <LabelContext.Provider value={{ label, setLabel, labelList, setLabelList, setTargetLabel }}>
      {children}
    </LabelContext.Provider>
  );
}