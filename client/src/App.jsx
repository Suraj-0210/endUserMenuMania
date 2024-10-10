import React from "react";
import Header from "./components/Header";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
      <Header
        logoUrl={
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyb47xz1-jYJ18JKCb8wuoxkPwdxnyuUMQ8A&s"
        }
      />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
