import { useState, useEffect, useRef } from "react";
import Head from "next/head";

// ── API HELPERS ──
async function callClaude(prompt) {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.text;
}

async function loadArticles() {
  try {
    const res = await fetch("/api/articles");
    const data = await res.json();
    return data.articles || [];
  } catch { return []; }
}

async function saveArticle(article) {
  try {
    await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ article }),
    });
  } catch (e) { console.error("Save error", e); }
}

// ── SHARED STYLES ──
const S = {
  con: { maxWidth: 1060, margin: "0 auto", padding: "44px 24px" },
  ey: { fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--lime)", marginBottom: 10, display: "flex", alignItems: "center", gap: 10 },
  ttl: { fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(38px,6vw,68px)", letterSpacing: "0.02em", lineHeight: 1, marginBottom: 8 },
  sub: { fontSize: 15, color: "var(--text2)", marginBottom: 28 },
  btn: { fontFamily: "'Syne',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", padding: "12px 24px", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, textTransform: "uppercase", transition: "all 0.2s" },
  bP: { background: "var(--lime)", color: "var(--bg)" },
  bG: { background: "transparent", color: "var(--text2)", border: "1px solid var(--border2)" },
  bC: { background: "var(--cyan)", color: "var(--bg)" },
  lbl: { fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--text3)", display: "block", marginBottom: 7 },
  inp: { background: "var(--surface)", border: "1px solid var(--border2)", color: "var(--text)", padding: "12px 14px", fontSize: 14, width: "100%", transition: "all 0.2s", borderRadius: 0, display: "block" },
  hint: { fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "var(--text3)", lineHeight: 1.5, letterSpacing: "0.04em", marginTop: 5 },
};

// ── LOADING SCREEN ──
function LoadingScreen({ msg = "Redactando tu futuro..." }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 24, textAlign: "center" }}>
      <div className="loading-orb" />
      <p className="loading-headline">{msg}</p>
      <div className="loading-bar" />
      <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: "0.3em", color: "var(--text3)", textTransform: "uppercase" }}>KPL Future Gazette · IA escribiendo</p>
    </div>
  );
}

// ── INTRO ──
function StepIntro({ go }) {
  return (
    <div className="fadeUp" style={S.con}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr minmax(260px,380px)", gap: 48, alignItems: "center" }}>
        <div>
          <div style={S.ey}><span style={{ width: 28, height: 1, background: "var(--lime)", display: "inline-block" }} />KPL · Actividad de equipo</div>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(56px,9vw,114px)", lineHeight: 0.9, letterSpacing: "0.02em", marginBottom: 22 }}>
            EL<br /><span style={{ color: "var(--lime)", textShadow: "0 0 40px rgba(200,245,60,0.2)" }}>FUTURO</span><br />DE KPL
          </h1>
          <p style={{ ...S.sub, maxWidth: 420 }}>Imagina que KPL ya logró lo que sueñas. ¿Cómo lo contaría la prensa? La IA escribe el artículo. El equipo construye la visión colectiva.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn-primary" style={{ ...S.btn, ...S.bP }} onClick={() => go("write")}>Escribir mi noticia →</button>
            <button className="btn-ghost" style={{ ...S.btn, ...S.bG }} onClick={() => go("wall")}>Ver portada del equipo</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginTop: 36 }}>
            {[["3'","Escribir"],["1'","Generar"],["10'","Compartir"]].map(([n,l]) => (
              <div key={l} style={{ background: "var(--bg)", padding: "16px 10px", textAlign: "center" }}>
                <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 34, color: "var(--cyan)", textShadow: "0 0 24px rgba(60,245,224,0.2)", display: "block" }}>{n}</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: "0.2em", color: "var(--text3)", textTransform: "uppercase" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border2)", padding: 28, position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,var(--lime),var(--cyan))" }} />
          {[["01","Escribe tu titular","Una noticia del futuro: un logro ambicioso de KPL en 2026–2028."],
            ["02","La IA redacta el artículo","Claude genera el artículo periodístico completo como si ya hubiera ocurrido."],
            ["03","Publica en la portada","Tu artículo aparece en la portada colectiva del equipo en tiempo real."],
            ["04","Síntesis colectiva","La IA analiza todos los artículos y extrae la visión compartida de KPL."]
          ].map(([n,t,d]) => (
            <div key={n} style={{ display: "flex", gap: 14, marginBottom: 18 }}>
              <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: "var(--lime)", opacity: 0.35, lineHeight: 1, minWidth: 26 }}>{n}</span>
              <div><strong style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{t}</strong><span style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.5 }}>{d}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── WRITE ──
function StepWrite({ go, onGenerated }) {
  const [form, setForm] = useState({ author: "", role: "", headline: "", category: "", year: "2027", context: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(180);
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); setRunning(false); return 0; }
        return t - 1;
      }), 1000);
    } else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [running]);

  const fmt = t => `${String(Math.floor(t/60)).padStart(2,"0")}:${String(t%60).padStart(2,"0")}`;
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const generate = async () => {
    setError("");
    if (!form.author || !form.headline || !form.category) { setError("→ Completa tu nombre, el titular y la categoría."); return; }
    setLoading(true);
    const prompt = `Eres el mejor redactor periodístico de "KPL Future Gazette", diario de negocios y tecnología.

Escribe un artículo COMPLETO y CONVINCENTE como si ya hubiera ocurrido en el año ${form.year}.

CONTEXTO DE KPL:
- KPL es una empresa con base en Mérida, Yucatán, México
- Inició como despacho contable y ha evolucionado integrando inteligencia artificial a sus servicios
- Hoy combina contabilidad, finanzas y soluciones de IA para sus clientes
- Es un equipo con visión de transformar cómo se hace la contabilidad en la región

DATOS DEL ARTÍCULO:
- Titular: "${form.headline}"
- Categoría: ${form.category}
- Autor: ${form.author}${form.role ? ` (${form.role})` : ""}
- Año: ${form.year}
- Contexto adicional: ${form.context || "No especificado"}

INSTRUCCIONES:
- Español, tono periodístico claro y emocionante, creíble
- Entre 280 y 360 palabras
- Párrafos cortos de 2-3 oraciones
- Menciona Mérida o el contexto regional de forma natural si encaja
- Evita inventar datos ultra-específicos; usa aproximaciones naturales
- Incluye UNA cita poderosa entre comillas integrada en el texto
- Escribe en pasado/presente como si ya ocurrió
- Cierra con el impacto hacia adelante

FORMATO: Solo el cuerpo del artículo, párrafos separados por línea en blanco. Sin títulos ni encabezados.`;
    try {
      const body = await callClaude(prompt);
      onGenerated({ ...form, body, id: Date.now() });
      go("article");
    } catch(e) {
      setError("Error al generar: " + e.message);
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="fadeUp" style={S.con}>
      <div style={S.ey}><span style={{ width: 24, height: 1, background: "var(--lime)", display: "inline-block" }} />Paso 01 de 04</div>
      <h2 style={S.ttl}>TU NOTICIA</h2>
      <p style={S.sub}>KPL ya lo logró. ¿Cómo lo cuenta el mundo?</p>

      <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--surface)", border: "1px solid var(--border2)", padding: "10px 18px", marginBottom: 32, width: "fit-content" }}>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text3)" }}>Tiempo</span>
        <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, color: "var(--lime)", textShadow: "0 0 20px rgba(200,245,60,0.3)", letterSpacing: "0.05em", minWidth: 66 }}>{timer === 0 ? "LISTO" : fmt(timer)}</span>
        <button style={{ background: "none", border: "1px solid var(--border2)", color: "var(--text2)", width: 30, height: 30, cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setRunning(r => !r)}>{running ? "⏸" : "▶"}</button>
      </div>

      <div style={{ maxWidth: 680 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <div><label style={S.lbl}>Tu nombre</label><input style={S.inp} value={form.author} onChange={set("author")} placeholder="Ej. Salma Tejero" /></div>
          <div><label style={S.lbl}>Área / Rol</label><input style={S.inp} value={form.role} onChange={set("role")} placeholder="Ej. Contadora Senior" /></div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={S.lbl}>El titular de la noticia</label>
            <input style={S.inp} value={form.headline} onChange={set("headline")} placeholder='«KPL automatiza la contabilidad del sureste con IA»' maxLength={130} />
            <span style={S.hint}>→ Sé específico y ambicioso. Este es el futuro que quieres ver.</span>
          </div>
          <div>
            <label style={S.lbl}>Categoría</label>
            <select style={S.inp} value={form.category} onChange={set("category")}>
              <option value="">Selecciona...</option>
              {["TECNOLOGÍA & IA","INNOVACIÓN","CULTURA & EQUIPO","IMPACTO REGIONAL","CRECIMIENTO","PRODUCTO","CLIENTES"].map(c => (
                <option key={c} value={c}>{c.charAt(0)+c.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={S.lbl}>Año de la noticia</label>
            <select style={S.inp} value={form.year} onChange={set("year")}>
              {["2026","2027","2028","2030"].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={S.lbl}>Contexto clave (opcional pero poderoso)</label>
            <textarea style={{ ...S.inp, minHeight: 96, lineHeight: 1.6, resize: "vertical" }} value={form.context} onChange={set("context")} placeholder="¿Qué logró KPL? ¿A quién ayudó? ¿Qué cambió? Más contexto = mejor artículo." />
          </div>
        </div>
        {error && <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "var(--red)", padding: "11px 14px", border: "1px solid var(--red)", background: "rgba(245,69,60,0.06)", marginTop: 14 }}>{error}</div>}
        <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
          <button className="btn-primary" style={{ ...S.btn, ...S.bP }} onClick={generate}>⚡ Generar artículo</button>
          <button className="btn-ghost" style={{ ...S.btn, ...S.bG }} onClick={() => go("intro")}>← Volver</button>
        </div>
      </div>
    </div>
  );
}

// ── ARTICLE ──
function StepArticle({ article, go, onPublish }) {
  if (!article) return null;
  const paras = article.body.split(/\n\n+/).filter(p => p.trim());
  let pullQuote = "";
  paras.forEach(p => { if (!pullQuote) { const m = p.match(/"([^"]{30,120})"/); if (m) pullQuote = m[1]; } });
  const mid = Math.ceil(paras.length / 2);

  return (
    <div className="fadeUp" style={S.con}>
      <div style={S.ey}><span style={{ width: 24, height: 1, background: "var(--lime)", display: "inline-block" }} />Tu artículo generado</div>
      <h2 style={{ ...S.ttl, marginBottom: 22 }}>LISTO ✦</h2>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border2)" }}>
        <div className="accent-bar" />
        <div style={{ padding: "18px 32px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: "0.18em", color: "var(--text3)", textTransform: "uppercase" }}>KPL FUTURE GAZETTE · EDICIÓN {article.year}</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: "0.12em", color: "var(--cyan)", textTransform: "uppercase" }}>Publicado desde el futuro · Mérida, Yucatán</span>
        </div>
        <div style={{ padding: "32px 32px 24px" }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--lime)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 18, height: 1, background: "var(--lime)", display: "inline-block" }} />{article.category}
          </div>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(28px,5vw,56px)", lineHeight: 0.95, letterSpacing: "0.02em", marginBottom: 16 }}>{article.headline}</h2>
          <div style={{ display: "flex", gap: 10, fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: "0.1em", color: "var(--text3)", marginBottom: 24, paddingBottom: 18, borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}>
            <span>Por <strong style={{ color: "var(--lime)" }}>{article.author}</strong></span>
            <span style={{ color: "var(--border2)" }}>·</span><span>{article.role || "Equipo KPL"}</span>
            <span style={{ color: "var(--border2)" }}>·</span><span>{article.year}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px", position: "relative" }}>
            <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "var(--border)" }} />
            <div>
              {paras.slice(0, mid).map((p, i) => (
                <p key={i} className={i === 0 ? "first-letter-drop" : ""} style={{ fontFamily: "'DM Serif Display',serif", fontSize: 15, lineHeight: 1.8, color: i === 0 ? "var(--text)" : "var(--text2)", marginBottom: 14 }}>{p}</p>
              ))}
            </div>
            <div>
              {pullQuote && <div style={{ borderTop: "1px solid var(--border2)", borderBottom: "1px solid var(--border2)", padding: "18px 0", fontFamily: "'DM Serif Display',serif", fontStyle: "italic", fontSize: 17, lineHeight: 1.4, color: "var(--cyan)", textAlign: "center", marginBottom: 18, background: "rgba(60,245,224,0.03)" }}>"{pullQuote}"</div>}
              {paras.slice(mid).map((p, i) => (
                <p key={i} style={{ fontFamily: "'DM Serif Display',serif", fontSize: 15, lineHeight: 1.8, color: "var(--text2)", marginBottom: 14 }}>{p}</p>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", padding: "16px 32px", borderTop: "1px solid var(--border)" }}>
          {[{ t: article.category, lime: true }, { t: "KPL" }, { t: `${article.year}` }, { t: article.author.split(" ")[0].toUpperCase() }].map(({ t, lime }) => (
            <span key={t} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 10px", border: `1px solid ${lime ? "var(--lime)" : "var(--border2)"}`, color: lime ? "var(--lime)" : "var(--text3)" }}>{t}</span>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
        <button className="btn-primary" style={{ ...S.btn, ...S.bP }} onClick={async () => { await onPublish(article); go("wall"); }}>📰 Publicar en portada →</button>
        <button className="btn-ghost" style={{ ...S.btn, ...S.bG }} onClick={() => go("write")}>← Editar</button>
        <button className="btn-ghost" style={{ ...S.btn, ...S.bG }} onClick={() => go("wall")}>Ver portada</button>
      </div>
    </div>
  );
}

// ── WALL ──
function StepWall({ go }) {
  const [articles, setArticles] = useState([]);
  const [newIds, setNewIds] = useState(new Set());
  const [loadingWall, setLoadingWall] = useState(true);
  const [modal, setModal] = useState(null);
  const [synthesis, setSynthesis] = useState(null);
  const [synthLoading, setSynthLoading] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const pollRef = useRef(null);
  const isFirstLoad = useRef(true);

  const fetchArticles = async (silent = false) => {
    if (!silent) setSyncing(true);
    try {
      const arts = await loadArticles();
      setArticles(prev => {
        if (!isFirstLoad.current && arts.length > prev.length) {
          const existingIds = new Set(prev.map(a => a.id));
          const incoming = arts.filter(a => !existingIds.has(a.id)).map(a => a.id);
          if (incoming.length > 0) {
            setNewIds(ids => new Set([...ids, ...incoming]));
            setTimeout(() => setNewIds(ids => {
              const next = new Set(ids);
              incoming.forEach(id => next.delete(id));
              return next;
            }), 2000);
          }
        }
        isFirstLoad.current = false;
        return arts;
      });
      setLastSync(new Date());
    } catch(e) { console.error(e); }
    setSyncing(false);
    setLoadingWall(false);
  };

  useEffect(() => {
    fetchArticles(false);
    pollRef.current = setInterval(() => fetchArticles(true), 5000);
    return () => clearInterval(pollRef.current);
  }, []);

  const generateSynthesis = async () => {
    if (!articles.length) return;
    setSynthLoading(true); setSynthesis(null);
    const summaries = articles.map((a, i) => `${i+1}. [${a.author}${a.role ? " · " + a.role : ""}] "${a.headline}" (${a.category}, ${a.year}) — ${a.body.substring(0,250)}`).join("\n\n");
    const prompt = `Eres un facilitador experto en estrategia y cultura de equipos.
El equipo de KPL escribió estas noticias del futuro. KPL es un despacho contable en Mérida, Yucatán que integró inteligencia artificial a sus servicios.

${summaries}

Crea una SÍNTESIS COLECTIVA con esta estructura:

**TEMAS EN COMÚN**
2-3 patrones que emergen de los artículos del equipo.

**LA VISIÓN COLECTIVA DE KPL**
Párrafo inspirador (3-4 oraciones) que captura el futuro co-imaginado.

**TENSIONES CREATIVAS**
1-2 diferencias interesantes entre las visiones que vale explorar en equipo.

**PREGUNTAS ESTRATÉGICAS**
3 preguntas concretas que KPL debería responder para hacer realidad esta visión.

Español. Tono estratégico, cálido y accionable. Máx 350 palabras. **negritas** solo para títulos de sección.`;
    try {
      const text = await callClaude(prompt);
      setSynthesis(text);
    } catch { setSynthesis("Error al generar la síntesis. Intenta de nuevo."); }
    setSynthLoading(false);
  };

  const fmtTime = d => d ? d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—";
  const tickerItems = articles.length ? articles.map(a => a.headline) : ["Imagina el futuro de KPL","¿Qué noticia escribirías?","Contabilidad + IA desde Mérida, Yucatán"];

  return (
    <div className="fadeUp" style={S.con}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", overflow: "hidden", marginBottom: 32 }}>
        <div className="ticker-track">
          {[...tickerItems,...tickerItems].map((t,i) => <span key={i}>{t}</span>)}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 18, flexWrap: "wrap", gap: 14 }}>
        <div>
          <div style={S.ey}>
            <span style={{ width: 24, height: 1, background: "var(--lime)", display: "inline-block" }} />
            Portada colectiva
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: "0.15em", color: syncing ? "var(--lime)" : "var(--text3)", transition: "color 0.3s" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: syncing ? "var(--lime)" : "var(--text3)", display: "block", transition: "background 0.3s" }} />
              {syncing ? "SINCRONIZANDO..." : `SYNC ${fmtTime(lastSync)}`}
            </span>
          </div>
          <h2 style={S.ttl}>KPL FUTURES</h2>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 52, color: "var(--lime)", opacity: 0.22, lineHeight: 1 }}>{articles.length}</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <button className="btn-primary" style={{ ...S.btn, ...S.bP }} onClick={() => go("write")}>+ Nueva noticia</button>
            <button className="btn-cyan" style={{ ...S.btn, ...S.bC }} onClick={generateSynthesis} disabled={!articles.length || synthLoading}>✦ Generar síntesis</button>
          </div>
        </div>
      </div>

      {loadingWall ? (
        <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--text3)", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: "0.2em" }}>Cargando portada...</div>
      ) : !articles.length ? (
        <div style={{ padding: "72px 20px", textAlign: "center", border: "2px dashed var(--border2)", color: "var(--text3)", fontFamily: "'JetBrains Mono',monospace", fontSize: 12, letterSpacing: "0.15em" }}>
          <div style={{ fontSize: 38, marginBottom: 14, opacity: 0.2 }}>◯</div>
          Aún no hay artículos · ¡Sé el primero del equipo!
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 1, background: "var(--border)", border: "1px solid var(--border)", marginBottom: 44 }}>
          {articles.map(art => (
            <div key={art.id}
              className={`wall-card popIn${newIds.has(art.id) ? " new-card" : ""}`}
              onClick={() => setModal(art)}
              style={{ background: "var(--surface)", padding: 22, cursor: "pointer" }}>
              {newIds.has(art.id) && (
                <div style={{ position: "absolute", top: 8, right: 8, fontFamily: "'JetBrains Mono',monospace", fontSize: 8, letterSpacing: "0.2em", color: "var(--lime)", border: "1px solid var(--lime)", padding: "2px 6px", textTransform: "uppercase" }}>nuevo</div>
              )}
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--lime)", marginBottom: 9, opacity: 0.7 }}>{art.category}</div>
              <div className="card-hl" style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 19, lineHeight: 1.1, letterSpacing: "0.02em", marginBottom: 9, transition: "color 0.2s" }}>{art.headline}</div>
              <div style={{ fontSize: 12, lineHeight: 1.6, color: "var(--text3)", marginBottom: 12, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>{art.body.substring(0,150)}…</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: "0.1em", color: "var(--text3)", paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{art.author}{art.role ? ` · ${art.role}` : ""}</span>
                <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, color: "var(--border2)" }}>{art.year}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {synthLoading && (
        <div style={{ background: "var(--surface)", border: "1px solid rgba(200,245,60,0.2)", padding: 56, textAlign: "center" }}>
          <div className="loading-orb" style={{ margin: "0 auto 20px" }} />
          <p className="loading-headline">Analizando la visión colectiva de KPL...</p>
        </div>
      )}

      {synthesis && !synthLoading && (
        <div style={{ background: "var(--surface)", border: "1px solid rgba(200,245,60,0.2)", padding: "36px 36px 32px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at top left,rgba(200,245,60,0.04),transparent 60%)", pointerEvents: "none" }} />
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--lime)", marginBottom: 22, display: "flex", alignItems: "center", gap: 12 }}>
            ✦ Síntesis colectiva KPL · {articles.length} artículo{articles.length > 1 ? "s" : ""}
            <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(200,245,60,0.3),transparent)", display: "inline-block" }} />
          </div>
          <div>
            {synthesis.replace(/\*\*(.+?)\*\*/g, "§§$1§§").split("\n").filter(l => l.trim()).map((l, i) => {
              const parts = l.split("§§");
              return (
                <p key={i} style={{ fontFamily: "'DM Serif Display',serif", fontSize: 15, lineHeight: 1.8, color: "var(--text2)", marginBottom: 14 }}>
                  {parts.map((part, j) => j % 2 === 1
                    ? <strong key={j} style={{ color: "var(--lime)", fontFamily: "'Syne',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginTop: 18, marginBottom: 4 }}>{part}</strong>
                    : <span key={j}>{part}</span>
                  )}
                </p>
              );
            })}
          </div>
        </div>
      )}

      {modal && (
        <div onClick={e => e.target === e.currentTarget && setModal(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(8,11,16,0.9)", backdropFilter: "blur(14px)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div className="popIn" style={{ background: "var(--surface)", border: "1px solid var(--border2)", maxWidth: 620, width: "100%", maxHeight: "88vh", overflowY: "auto" }}>
            <div style={{ height: 2, background: "linear-gradient(90deg,var(--lime),var(--cyan))" }} />
            <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: "0.2em", color: "var(--text3)", textTransform: "uppercase" }}>Artículo completo</span>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", color: "var(--text3)", fontSize: 18, cursor: "pointer", lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ padding: "26px 22px" }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: "0.22em", color: "var(--lime)", textTransform: "uppercase", marginBottom: 9 }}>{modal.category}</div>
              <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: "0.02em", lineHeight: 1, marginBottom: 12 }}>{modal.headline}</h2>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: "0.1em", color: "var(--text3)", marginBottom: 22, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
                Por <strong style={{ color: "var(--lime)" }}>{modal.author}</strong> · {modal.role || "Equipo KPL"} · {modal.year}
              </div>
              {modal.body.split(/\n\n+/).filter(p => p.trim()).map((p, i) => (
                <p key={i} style={{ fontFamily: "'DM Serif Display',serif", fontSize: 15, lineHeight: 1.8, color: "var(--text2)", marginBottom: 14 }}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── APP ──
export default function Home() {
  const [step, setStep] = useState("intro");
  const [currentArticle, setCurrentArticle] = useState(null);

  const publish = async (art) => { await saveArticle(art); };

  const tickerItems = ["Imagina el futuro de KPL","¿Qué noticia escribirías?","Contabilidad + IA desde Mérida, Yucatán"];

  return (
    <>
      <Head>
        <title>KPL Future Gazette</title>
        <meta name="description" content="Actividad de equipo KPL — Imagina el futuro" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)", fontFamily: "'Syne',sans-serif" }}>
        <header style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(8,11,16,0.93)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 58, gap: 16 }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, letterSpacing: "0.08em", color: "var(--lime)", textShadow: "0 0 30px rgba(200,245,60,0.3)", flexShrink: 0, lineHeight: 1, cursor: "pointer" }} onClick={() => setStep("intro")}>
            KPL<span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, letterSpacing: "0.3em", color: "var(--text3)", display: "block", marginTop: 2 }}>FUTURE GAZETTE</span>
          </div>
          <div style={{ flex: 1, overflow: "hidden", maxWidth: 460 }}>
            <div className="ticker-track">
              {[...tickerItems,...tickerItems].map((t,i) => <span key={i}>{t}</span>)}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: "0.2em", color: "var(--red)", textTransform: "uppercase", flexShrink: 0 }}>
            <div className="live-dot" /><span>EN VIVO</span>
          </div>
        </header>

        {step === "intro"   && <StepIntro go={setStep} />}
        {step === "write"   && <StepWrite go={setStep} onGenerated={setCurrentArticle} />}
        {step === "article" && <StepArticle article={currentArticle} go={setStep} onPublish={publish} />}
        {step === "wall"    && <StepWall go={setStep} />}
      </div>
    </>
  );
}
