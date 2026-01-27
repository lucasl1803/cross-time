import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import { socket } from "../services/socket";

const STORAGE_SESSAO = "pagamento:sessaoId";

function toNonEmptyString(v) {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

export default function Pagamento() {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  // assinaturaId (continua numérico, ok)
  const assinaturaIdNumber = useMemo(() => {
    const fromParams = Number(params.assinaturaId);
    if (Number.isInteger(fromParams) && fromParams >= 1) return fromParams;

    const fromState = Number(location.state?.assinaturaId);
    if (Number.isInteger(fromState) && fromState >= 1) return fromState;

    const fromQuery = Number(new URLSearchParams(location.search).get("assinaturaId"));
    if (Number.isInteger(fromQuery) && fromQuery >= 1) return fromQuery;

    return null;
  }, [params.assinaturaId, location.state, location.search]);

  const isIdValido = assinaturaIdNumber !== null;

  // ✅ sessaoId COMO STRING (pode ser UUID)
  const sessaoId = useMemo(() => {
    const sp = new URLSearchParams(location.search);

    const fromState = toNonEmptyString(location.state?.sessaoId);
    const fromQuery = toNonEmptyString(sp.get("sessaoId"));
    const fromStorage = toNonEmptyString(localStorage.getItem(STORAGE_SESSAO));

    return fromState || fromQuery || fromStorage || null;
  }, [location.state, location.search]);

  // ✅ trava o sessaoId no storage assim que abrir a tela
  useEffect(() => {
    if (sessaoId) localStorage.setItem(STORAGE_SESSAO, sessaoId);
  }, [sessaoId]);

  const [loadingPix, setLoadingPix] = useState(false);
  const [erro, setErro] = useState("");
  const [pix, setPix] = useState(null);
  const [copiado, setCopiado] = useState(false);

  async function handlePagar() {
    if (!isIdValido) {
      setErro("assinaturaId inválido. Volte e clique em Pagar pela Home.");
      return;
    }

    setErro("");
    setCopiado(false);
    setLoadingPix(true);

    try {
      const { data } = await api.post("/pagamentos/pix", {
        assinaturaId: assinaturaIdNumber,
      });
      setPix(data);
    } catch (e) {
      const status = e?.response?.status;
      const payload = e?.response?.data;

      const msg =
        payload?.message ||
        payload?.error ||
        payload?.details ||
        "Falha ao gerar PIX. Tente novamente.";

      const finalMsg = Array.isArray(msg) ? msg.join(", ") : msg;
      setErro(status ? `Erro ${status}: ${finalMsg}` : finalMsg);
    } finally {
      setLoadingPix(false);
    }
  }

  // ✅ Pagamento já realizado -> check-in REAL + marca confirmado + volta
  function handleJaPaguei() {
    const alunoId = toNonEmptyString(localStorage.getItem("usuarioId"));
    const sessaoIdFinal = toNonEmptyString(localStorage.getItem(STORAGE_SESSAO));

    if (!sessaoIdFinal) {
      alert("Sessão não encontrada. Volte e clique em Pagar em uma aula.");
      return;
    }
    if (!alunoId) {
      alert("Usuário não identificado. Faça login novamente.");
      return;
    }

    // 1) check-in REAL
    socket.emit("checkin:create", { alunoId, sessaoId: sessaoIdFinal });

    // 2) feedback visual (verde) no front
    try {
      const raw = localStorage.getItem("reservas");
      const reservas = raw ? JSON.parse(raw) : {};
      reservas[sessaoIdFinal] = "CONFIRMADO";
      localStorage.setItem("reservas", JSON.stringify(reservas));
    } catch {}

    // 3) limpa e volta
    localStorage.removeItem(STORAGE_SESSAO);
    navigate("/home");
  }

  async function copiar() {
    const texto = pix?.copiaECola || "";
    if (!texto) return;

    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = texto;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);

      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>
            Voltar
          </button>
          <h1 style={styles.title}>Pagamento</h1>
        </div>

        <div style={styles.section}>
          <div style={styles.row}>
            <div>
              <div style={styles.label}>Assinatura</div>
              <div style={styles.value}>{isIdValido ? assinaturaIdNumber : "-"}</div>

              <div style={{ ...styles.mini, marginTop: 8 }}>
                Sessão: <b>{sessaoId ?? "-"}</b>
              </div>
            </div>

            <button
              onClick={handlePagar}
              disabled={loadingPix || !isIdValido}
              style={{
                ...styles.payBtn,
                opacity: loadingPix || !isIdValido ? 0.7 : 1,
                cursor: loadingPix || !isIdValido ? "not-allowed" : "pointer",
              }}
            >
              {loadingPix ? "Gerando PIX..." : "Gerar PIX"}
            </button>
          </div>

          {erro ? <div style={styles.error}>{erro}</div> : null}
        </div>

        {pix ? (
          <div style={styles.section}>
            <h2 style={styles.subtitle}>Pague com PIX</h2>

            <div style={styles.qrWrap}>
              {pix.qrBase64 ? (
                <img
                  alt="QR Code PIX"
                  style={styles.qr}
                  src={`data:image/png;base64,${pix.qrBase64}`}
                />
              ) : (
                <div style={styles.error}>Não veio qrBase64 na resposta da API.</div>
              )}
            </div>

            <div style={styles.copyBlock}>
              <div style={styles.label}>Copia e Cola</div>
              <textarea readOnly value={pix.copiaECola || ""} style={styles.textarea} />
              <button onClick={copiar} style={styles.copyBtn}>
                {copiado ? "Copiado ✅" : "Copiar código"}
              </button>
            </div>

            <button onClick={handleJaPaguei} style={styles.demoBtn}>
              Pagamento já realizado!
            </button>
          </div>
        ) : (
          <div style={styles.hint}>
            Clique em <b>Gerar PIX</b> para obter o QR Code e o código copia e cola.
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    padding: 24,
    background: "#0b0f17",
  },
  card: {
    width: "100%",
    maxWidth: 720,
    background: "#0f172a",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 20,
    color: "#e5e7eb",
  },
  header: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" },
  backBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.18)",
    color: "#e5e7eb",
    padding: "8px 12px",
    borderRadius: 10,
    cursor: "pointer",
  },
  title: { fontSize: 22, margin: 0, marginLeft: "auto" },
  section: {
    padding: 14,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
    marginTop: 12,
    background: "rgba(255,255,255,0.02)",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
    flexWrap: "wrap",
  },
  label: { fontSize: 12, opacity: 0.8 },
  value: { fontSize: 16, fontWeight: 600 },
  mini: { marginTop: 10, opacity: 0.8, fontSize: 12, lineHeight: 1.35 },
  payBtn: {
    background: "#22c55e",
    border: "none",
    borderRadius: 12,
    padding: "10px 16px",
    fontWeight: 700,
    cursor: "pointer",
  },
  demoBtn: {
    marginTop: 10,
    width: "100%",
    borderRadius: 12,
    padding: "10px 14px",
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(226,241,99,.10)",
    color: "#E2F163",
    fontWeight: 800,
    cursor: "pointer",
  },
  error: {
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.35)",
    color: "#fecaca",
  },
  subtitle: { margin: "0 0 10px 0", fontSize: 16 },
  qrWrap: { display: "flex", justifyContent: "center", padding: 12 },
  qr: { width: 260, height: 260, borderRadius: 12, background: "#fff", padding: 10 },
  copyBlock: { marginTop: 10 },
  textarea: {
    width: "100%",
    minHeight: 90,
    marginTop: 6,
    borderRadius: 12,
    padding: 10,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.25)",
    color: "#e5e7eb",
    resize: "none",
  },
  copyBtn: {
    marginTop: 10,
    width: "100%",
    borderRadius: 12,
    padding: "10px 14px",
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.06)",
    color: "#e5e7eb",
    fontWeight: 700,
    cursor: "pointer",
  },
  hint: { marginTop: 14, opacity: 0.85, fontSize: 13, paddingLeft: 6 },
};
