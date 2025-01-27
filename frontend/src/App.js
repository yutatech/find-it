import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, Row } from "react-bootstrap";

import SettingsTab from './component/SettingsTab/SettingsTab';
import FindTab from './component/FindTab/FindTab';
import Logo from "./component/SharedComponents/Logo";
import Header from './component/SharedComponents/Header';

import { SocketRefProvider } from './modules/SocketRefContext';
import { LabelProvider } from './modules/LabelContext';
import useLocalVideo from './hooks/useLocalVideo';
import useWebRtc from './hooks/useWebRtc';

import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css";


function Component() {
  const [loading, setLoading] = useState(true);
  const { localStreamRef, isLocalStreamReady } = useLocalVideo();
  const { isConnected, startTimeRef } = useWebRtc(localStreamRef, isLocalStreamReady);
  const [windowHeight, setWindowHeight] = useState(500);
  const [viewHight, setViewHight] = useState(0);

  const updateWindowHeight = () => {
    setWindowHeight(window.innerHeight);  // 現在のウィンドウ高さを設定
    const remSize = parseFloat(getComputedStyle(document.documentElement).fontSize); // 1remのピクセル値
    setViewHight(window.innerHeight - 4 * remSize);  // 現在のウィンドウ高さからヘッダーの高さを引いたものを設定
  };

  useEffect(() => {
    // 初回実行
    updateWindowHeight();

    // ウィンドウのリサイズ時にも高さを更新
    window.addEventListener('resize', updateWindowHeight);

    // クリーンアップ
    return () => {
      window.removeEventListener('resize', updateWindowHeight);
    };
  }, []);

  useEffect(() => {
    // ローディング画面を非表示にする
    if (isLocalStreamReady && isConnected) {
      setLoading(false);
    }
  }, [isLocalStreamReady, isConnected]);

  return (
    <Router>
      <div className={`App ${loading ? "" : "loader-hidden"}`}>
        {/* ロゴとローディング画面 */}
        <div className="loader-container">
          <div className="loader-logo"></div>
        </div>
        {/* メイン画面 */}
        <div className="d-flex justify-content-center app-content">
          <Container fluid="xl" className="d-flex flex-column" style={{ height: `${windowHeight}`, padding: '0px', position: 'relative' }}>
            {/* 常に右上に表示されるロゴ */}
            <Logo />
            <Row className="d-flex w-100 flex-column flex-grow-1 " style={{ padding: 0, margin: 0, height: `${viewHight}px` }}>
              {/* ルーティング設定 */}
              <Routes>
                <Route path="/" element={<FindTab streamRef={localStreamRef} isStreamReady={isLocalStreamReady} streamStartTimeRef={startTimeRef} />} />
                <Route path="/settings" element={<SettingsTab />} />
              </Routes>
            </Row>
            <Header />
          </Container>
        </div>

      </div>
    </Router>
  );
}

function App() {
  return (
    <>
      {/* Socket通信のインスタンスを全体で共有 */}
      <SocketRefProvider>
        <LabelProvider>
          <Component />
        </LabelProvider>
      </SocketRefProvider>
    </>
  );
}

export default App;
