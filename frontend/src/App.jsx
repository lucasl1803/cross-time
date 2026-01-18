import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import CriarConta from "./pages/CriarConta";
import Home from "./pages/Home";
import MinhaBox from "./pages/MinhaBox"; 

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/criar-conta" element={<CriarConta />} />
      <Route path="/home" element={<Home />} />
      <Route path="/minha-box" element={<MinhaBox />} /> 
    </Routes>
  );
}

