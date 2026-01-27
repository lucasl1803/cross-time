import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import CriarConta from "./pages/CriarConta";
import Home from "./pages/Home";
import MinhaBox from "./pages/MinhaBox";
import Pagamento from "./pages/Pagamento";

function RequireAuth({ children }) {
  const perfil = localStorage.getItem("perfil");
  if (!perfil) return <Navigate to="/login" replace />;
  return children;
}

function RequireCoach({ children }) {
  const perfil = localStorage.getItem("perfil");
  if (perfil !== "ADMIN") return <Navigate to="/home" replace />;
  return children;
}

function RequireAluno({ children }) {
  const perfil = localStorage.getItem("perfil");
  if (perfil !== "ALUNO") return <Navigate to="/home" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/criar-conta" element={<CriarConta />} />

      {/* HOME compartilhada (precisa estar logado) */}
      <Route
        path="/home"
        element={
          <RequireAuth>
            <Home />
          </RequireAuth>
        }
      />

      {/* COACH */}
      <Route
        path="/minha-box"
        element={
          <RequireCoach>
            <MinhaBox />
          </RequireCoach>
        }
      />

      {/* ALUNO */}
      <Route
        path="/pagamento/:assinaturaId"
        element={
          <RequireAluno>
            <Pagamento />
          </RequireAluno>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
