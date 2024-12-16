// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Home Page</h1>
      <button onClick={() => navigate("/about")}>Go to About Page</button>
    </div>
  );
};

const AboutPage = () => {
  return <h1>About Page</h1>;
};

function Appsample1() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Router>
  );
}

export default Appsample1;
