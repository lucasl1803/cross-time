import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";

export default function Pagamento() {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  // assinaturaId pode vir por:
  // 1) /pagamento/:assinaturaId
  // 2) state do navigate("/pagamento", { state: { assinaturaId } })
  // 3) query ?assinaturaId=123
  const assinaturaId = useMemo(() => {
    const fromParams = params.assinaturaId;
    const fromState = location.state?.assinaturaId;
    const fromQuery = new URLSearchParams(location.search).get("assinaturaId");
    return fromParams || fromState || fromQuery || "";
  }, [params.assinaturaId, location.state, location.search]);

  // ✅ Converte para número e detecta UUID/valor inválido
const assinaturaIdNumber = useMemo(() => {
  const n = Number(assinaturaId);
  return Number.isInteger(n) ? n : null;
}, [assinaturaId]);


  // ✅ Se vier UUID, não deixa ficar nessa tela
 useEffect(() => {
  if (assinaturaId && assinaturaIdNumber === null) {
    setErro("Link de pagamento inválido (ID não numérico). Volte e clique em Pagar pela Home.");
  }
}, [assinaturaId, assinaturaIdNumber]);


  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [pix, setPix] = useState(null); // { qrBase64, copiaECola, ... }

  async function handlePagar() {
  if (assinaturaIdNumber === null || assinaturaIdNumber < 1) {
  setErro("assinaturaId inválido. Precisa ser um número inteiro (ex: 1, 2, 3).");
  return;
}


    setErro("");
    setLoading(true);

    try {
    const { data } = await api.post("/pagamentos/pix", {
  assinaturaId: assinaturaIdNumber,
});


      setPix(data);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "Falha ao gerar PIX. Tente novamente.";
      setErro(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setLoading(false);
    }
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(pix?.copiaECola || "");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = pix?.copiaECola || "";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
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
              <div style={styles.value}>
                {assinaturaIdNumber ? assinaturaIdNumber : "-"}
              </div>
            </div>

            <button
              onClick={handlePagar}
              disabled={loading || !assinaturaIdNumber}
              style={{
                ...styles.payBtn,
                opacity: loading || !assinaturaIdNumber ? 0.7 : 1,
                cursor: loading || !assinaturaIdNumber ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Gerando PIX..." : "Pagar"}
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
                Copiar código
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.hint}>
            Clique em <b>Pagar</b> para gerar o QR Code e o código copia e cola.
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
  header: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 },
  backBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.18)",
    color: "#e5e7eb",
    padding: "8px 12px",
    borderRadius: 10,
  },
  title: { fontSize: 22, margin: 0 },
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
  payBtn: {
    background: "#22c55e",
    border: "none",
    borderRadius: 12,
    padding: "10px 16px",
    fontWeight: 700,
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
  },
  hint: { marginTop: 14, opacity: 0.85, fontSize: 13, paddingLeft: 6 },
};
