import { useState, useEffect, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { BASELINE, SERIES_META, STORAGE_KEY, pct, fmt } from "./data.js";

// ── Storage (localStorage) ──
const store = {
  get: (k) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

// ── Custom chart tooltip ──
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#1C2B3A", border:"1px solid #3D5166", borderRadius:8, padding:"10px 14px", fontSize:12 }}>
      <div style={{ color:"#C9A84C", fontWeight:700, marginBottom:6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color:"#fff", marginBottom:2 }}>
          <span style={{ color:p.stroke }}>■</span> {SERIES_META[p.dataKey]?.label}: <b>{fmt(p.value)} €</b>
        </div>
      ))}
    </div>
  );
};

const TABS = [
  { id:"ranking",  icon:"📊", label:"Ranking"  },
  { id:"chart",    icon:"📈", label:"Comparar" },
  { id:"trend",    icon:"〰️", label:"Evolução" },
  { id:"variacao", icon:"📉", label:"Variação" },
];

export default function App() {
  const [data,         setData]         = useState(null);
  const [tab,          setTab]          = useState("ranking");
  const [loading,      setLoading]      = useState(false);
  const [log,          setLog]          = useState([]);
  const [activeSeries, setActiveSeries] = useState(new Set(["EU","PT","DE","FR"]));
  const [sortBy,       setSortBy]       = useState("cur");
  const [search,       setSearch]       = useState("");
  const [filterAbove,  setFilterAbove]  = useState(false);

  useEffect(() => {
    const saved = store.get(STORAGE_KEY);
    setData(saved || BASELINE);
  }, []);

  // ── AI Update — via Netlify function (secure) ──
  const runUpdate = useCallback(async () => {
    setLoading(true);
    addLog("⏳ A consultar fontes oficiais…");

    const prompt = `Fornece os preços mais recentes do leite cru ao produtor (€/100kg) para os países da UE, com base no Milk Market Observatory da Comissão Europeia.
Responde APENAS com JSON válido sem texto extra nem backticks:
{"lastUpdated":"mês ano","source":"fonte","euAvg":número,"note":"nota breve","countries":[{"code":"PT","name":"Portugal","flag":"🇵🇹","cur":número,"prev":número}]}
Inclui os 26 países: BE,BG,CZ,DK,DE,EE,IE,GR,ES,FR,HR,IT,CY,LV,LT,HU,MT,NL,AT,PL,PT,RO,SI,SK,FI,SE.
Valores confirmados Abril 2026: PT=44.43, EU=42.79, CY=66.82, LT=37.46, RO=40.05.
Se não tiveres dados mais recentes usa estes valores de referência.`;

    try {
      // Call our secure Netlify function instead of Anthropic directly
      const r = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }]
        })
      });

      if (!r.ok) throw new Error(`Servidor respondeu: ${r.status}`);

      const json = await r.json();
      const text = json.content?.find(b => b.type === "text")?.text || "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());

      const merged = {
        ...BASELINE,
        ...parsed,
        trend: data?.trend || BASELINE.trend,
        fetchedAt: new Date().toISOString()
      };
      setData(merged);
      store.set(STORAGE_KEY, merged);
      addLog(`✅ Atualizado — ${parsed.lastUpdated}`);
    } catch (e) {
      addLog(`❌ Erro: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [data]);

  const addLog = (msg) => setLog(p => [{ ts: new Date().toLocaleTimeString("pt-PT", { hour:"2-digit", minute:"2-digit" }), msg }, ...p.slice(0, 4)]);
  const reset  = () => { setData(BASELINE); store.set(STORAGE_KEY, BASELINE); addLog("🔄 Dados repostos para Abril 2026"); };
  const toggleSeries = (c) => setActiveSeries(p => { const s = new Set(p); s.has(c) ? (s.size > 1 && s.delete(c)) : s.add(c); return s; });

  if (!data) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", flexDirection:"column", gap:16, background:"#F7F3EC" }}>
      <div style={{ width:40, height:40, border:"3px solid #D6CEBD", borderTop:"3px solid #C9A84C", borderRadius:"50%", animation:"spin 1s linear infinite" }} />
      <div style={{ color:"#8EA6BB", fontSize:14 }}>A carregar…</div>
    </div>
  );

  const ptData = data.countries.find(c => c.code === "PT");
  const ptRank = [...data.countries].sort((a, b) => b.cur - a.cur).findIndex(c => c.code === "PT") + 1;
  const maxCur = Math.max(...data.countries.map(c => c.cur));

  const sorted = [...data.countries]
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()))
    .filter(c => !filterAbove || c.cur >= data.euAvg)
    .sort((a, b) =>
      sortBy === "cur" ? b.cur - a.cur :
      sortBy === "prev" ? b.prev - a.prev :
      parseFloat(pct(a.cur, a.prev)) - parseFloat(pct(b.cur, b.prev))
    );

  const chartData = (data.trend?.months || BASELINE.trend.months).map((m, i) => {
    const obj = { month: m };
    Object.keys(SERIES_META).forEach(code => {
      const s = (data.trend || BASELINE.trend).series[code];
      if (s?.[i] != null) obj[code] = s[i];
    });
    return obj;
  });

  const safeTop    = "env(safe-area-inset-top, 0px)";
  const safeBottom = "env(safe-area-inset-bottom, 16px)";

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:"#F7F3EC", fontFamily:"'Inter',system-ui,sans-serif" }}>

      {/* HEADER */}
      <div style={{ background:"#1C2B3A", paddingTop:`calc(${safeTop} + 12px)`, paddingBottom:12, paddingLeft:16, paddingRight:16, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, background:"#C9A84C", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>🥛</div>
            <div>
              <div style={{ fontFamily:"Georgia,serif", fontSize:16, color:"#fff", fontWeight:700, lineHeight:1.2 }}>Preços do Leite <span style={{ color:"#C9A84C" }}>UE</span></div>
              <div style={{ fontSize:10, color:"#8EA6BB", letterSpacing:"0.06em", textTransform:"uppercase" }}>{data.lastUpdated} · MMO Comissão Europeia</div>
            </div>
          </div>
          <button onClick={runUpdate} disabled={loading}
            style={{ background:"#C9A84C", border:"none", borderRadius:20, padding:"8px 14px", fontSize:13, fontWeight:700, color:"#1C2B3A", cursor:"pointer", display:"flex", alignItems:"center", gap:6, flexShrink:0, opacity:loading ? 0.7 : 1 }}>
            {loading
              ? <><div style={{ width:12, height:12, border:"2px solid rgba(28,43,58,0.3)", borderTop:"2px solid #1C2B3A", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />…</>
              : "⟳ Actualizar"}
          </button>
        </div>
        {log.length > 0 && (
          <div style={{ marginTop:8, fontSize:11, color:"#8EA6BB", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            <span style={{ color:"#C9A84C" }}>{log[0].ts}</span> {log[0].msg}
          </div>
        )}
      </div>

      {/* KPI STRIP */}
      <div style={{ background:"#FDFAF5", borderBottom:"1px solid #D6CEBD", padding:"10px 16px", display:"flex", gap:12, overflowX:"auto", flexShrink:0 }}>
        {[
          { label:"Média UE",     val:`${fmt(data.euAvg)} €`,           sub:"Abr 2026",                              color:"#C9A84C" },
          { label:"🇵🇹 Portugal", val:`${fmt(ptData?.cur || 0)} €`,      sub:`${ptRank}.º lugar · ${pct(ptData?.cur, ptData?.prev)}%`, color:"#C0392B" },
          { label:"Mais alto",    val:`${fmt(maxCur)} €`,               sub:data.countries[0]?.name,                 color:"#3D7A55" },
          { label:"Mais baixo",   val:`${fmt(data.countries[data.countries.length-1]?.cur || 0)} €`, sub:data.countries[data.countries.length-1]?.name, color:"#8EA6BB" },
        ].map((k, i) => (
          <div key={i} style={{ flexShrink:0, minWidth:110, background:"#F7F3EC", border:"1px solid #D6CEBD", borderRadius:8, padding:"8px 12px" }}>
            <div style={{ fontSize:10, color:"#8EA6BB", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:3 }}>{k.label}</div>
            <div style={{ fontFamily:"Georgia,serif", fontSize:18, color:"#1C2B3A", lineHeight:1 }}>{k.val}</div>
            <div style={{ fontSize:10, fontWeight:700, color:k.color, marginTop:3 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{ flex:1, overflowY:"auto", padding:"14px 16px 8px" }}>

        {/* ── RANKING ── */}
        {tab === "ranking" && (
          <div style={{ animation:"fadeIn 0.25s ease" }}>
            <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap", alignItems:"center" }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 País…"
                style={{ flex:1, minWidth:120, padding:"8px 12px", border:"1px solid #D6CEBD", borderRadius:8, fontSize:13, background:"#FDFAF5", outline:"none" }} />
              <button onClick={() => setFilterAbove(p => !p)}
                style={{ padding:"8px 12px", border:`1.5px solid ${filterAbove ? "#C9A84C" : "#D6CEBD"}`, borderRadius:20, background:filterAbove ? "#C9A84C" : "transparent", color:filterAbove ? "#fff" : "#3D5166", fontSize:12, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}>
                ≥ Média UE
              </button>
            </div>
            <div style={{ display:"flex", gap:6, marginBottom:10 }}>
              <span style={{ fontSize:11, color:"#8EA6BB", alignSelf:"center" }}>Ordenar:</span>
              {[["cur","Preço atual"], ["prev","Ano anterior"], ["var","Variação"]].map(([k, l]) => (
                <button key={k} onClick={() => setSortBy(k)}
                  style={{ padding:"5px 10px", border:`1.5px solid ${sortBy === k ? "#1C2B3A" : "#D6CEBD"}`, borderRadius:20, background:sortBy === k ? "#1C2B3A" : "transparent", color:sortBy === k ? "#fff" : "#3D5166", fontSize:11, fontWeight:600, cursor:"pointer" }}>
                  {l}
                </button>
              ))}
            </div>
            <div style={{ background:"#FDFAF5", border:"1px solid #D6CEBD", borderRadius:12, overflow:"hidden" }}>
              <div style={{ display:"grid", gridTemplateColumns:"30px 1fr 80px 70px", padding:"8px 12px", background:"#1C2B3A", fontSize:10, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", color:"#8EA6BB", gap:6 }}>
                <div>#</div><div>País</div><div style={{ textAlign:"right" }}>Abr 2026</div><div style={{ textAlign:"right" }}>Variação</div>
              </div>
              {sorted.map((c, i) => {
                const v = parseFloat(pct(c.cur, c.prev));
                const isPT = c.code === "PT";
                return (
                  <div key={c.code} style={{ display:"grid", gridTemplateColumns:"30px 1fr 80px 70px", padding:"10px 12px", borderBottom:"1px solid #D6CEBD", alignItems:"center", gap:6, background:isPT ? "#FEF9EC" : "", borderLeft:isPT ? "3px solid #C9A84C" : "3px solid transparent" }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"#8EA6BB" }}>{i + 1}</div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:20 }}>{c.flag}</span>
                      <div>
                        <div style={{ fontWeight:600, fontSize:14, color:"#1C2B3A" }}>{c.name}</div>
                        <div style={{ height:3, width:80, background:"#D6CEBD", borderRadius:2, marginTop:3 }}>
                          <div style={{ height:3, borderRadius:2, background:isPT ? "#C9A84C" : c.cur >= data.euAvg ? "#3D7A55" : "#8EA6BB", width:`${(c.cur / maxCur * 100).toFixed(0)}%` }} />
                        </div>
                      </div>
                    </div>
                    <div style={{ fontFamily:"Georgia,serif", fontSize:15, textAlign:"right", fontWeight:700 }}>{fmt(c.cur)} €</div>
                    <div style={{ textAlign:"right", fontSize:12, fontWeight:700, color:v >= 0 ? "#C0392B" : "#3D7A55" }}>{v >= 0 ? "▲" : "▼"}{Math.abs(v)}%</div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize:10, color:"#8EA6BB", marginTop:10, lineHeight:1.6 }}>Fonte: {data.source}. ° Estimativas: Malta, Grécia.</div>
          </div>
        )}

        {/* ── COMPARAÇÃO ── */}
        {tab === "chart" && (
          <div style={{ animation:"fadeIn 0.25s ease" }}>
            <div style={{ fontFamily:"Georgia,serif", fontSize:17, marginBottom:4 }}>Comparação Visual</div>
            <div style={{ fontSize:12, color:"#8EA6BB", marginBottom:14 }}>{data.lastUpdated} · Verde = acima da média UE ({fmt(data.euAvg)} €)</div>
            <div style={{ background:"#FDFAF5", border:"1px solid #D6CEBD", borderRadius:12, padding:"14px 16px" }}>
              {[...data.countries].sort((a, b) => b.cur - a.cur).map(c => {
                const isPT = c.code === "PT", above = c.cur >= data.euAvg;
                const color = isPT ? "#C9A84C" : above ? "#3D7A55" : "#8EA6BB";
                const w = (c.cur / maxCur * 100).toFixed(1);
                const v = parseFloat(pct(c.cur, c.prev));
                return (
                  <div key={c.code} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7 }}>
                    <div style={{ width:90, fontSize:12, color:"#3D5166", textAlign:"right", flexShrink:0, fontWeight:isPT ? 700 : 400 }}>{c.flag} {c.name}</div>
                    <div style={{ flex:1, height:22, background:"#D6CEBD", borderRadius:4, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${w}%`, background:color, borderRadius:4, display:"flex", alignItems:"center", paddingLeft:6 }}>
                        <span style={{ fontSize:11, fontWeight:700, color:"#fff", textShadow:"0 1px 2px rgba(0,0,0,.3)", whiteSpace:"nowrap" }}>{fmt(c.cur)} €</span>
                      </div>
                    </div>
                    <div style={{ width:44, fontSize:11, fontWeight:700, color:v >= 0 ? "#C0392B" : "#3D7A55", textAlign:"right" }}>{v >= 0 ? "▲" : "▼"}{Math.abs(v)}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── EVOLUÇÃO ── */}
        {tab === "trend" && (
          <div style={{ animation:"fadeIn 0.25s ease" }}>
            <div style={{ fontFamily:"Georgia,serif", fontSize:17, marginBottom:4 }}>Evolução Temporal</div>
            <div style={{ fontSize:12, color:"#8EA6BB", marginBottom:10 }}>Jan 2024 – Mai 2026 · €/100kg</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
              {Object.entries(SERIES_META).map(([code, meta]) => (
                <button key={code} onClick={() => toggleSeries(code)}
                  style={{ padding:"5px 10px", border:`1.5px solid ${activeSeries.has(code) ? meta.color : "#D6CEBD"}`, borderRadius:20, background:activeSeries.has(code) ? meta.color : "transparent", color:activeSeries.has(code) ? "#fff" : "#3D5166", fontSize:11, fontWeight:600, cursor:"pointer" }}>
                  {meta.label}
                </button>
              ))}
            </div>
            <div style={{ background:"#FDFAF5", border:"1px solid #D6CEBD", borderRadius:12, padding:"12px 8px" }}>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData} margin={{ top:8, right:8, left:-20, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D6CEBD" />
                  <XAxis dataKey="month" tick={{ fontSize:9, fill:"#8EA6BB" }} interval={5} />
                  <YAxis domain={["auto","auto"]} tick={{ fontSize:10, fill:"#8EA6BB" }} tickFormatter={v => `${v}€`} />
                  <Tooltip content={<ChartTip />} />
                  <ReferenceLine y={data.euAvg} stroke="#C9A84C" strokeDasharray="4 3" strokeWidth={1} />
                  {Object.keys(SERIES_META).filter(c => activeSeries.has(c)).map(code => (
                    <Line key={code} type="monotone" dataKey={code} stroke={SERIES_META[code].color}
                      strokeWidth={code === "PT" || code === "EU" ? 2.5 : 1.8} dot={false} activeDot={{ r:3 }} connectNulls />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ fontSize:10, color:"#8EA6BB", marginTop:8 }}>Linha dourada = média UE ({fmt(data.euAvg)} €/100kg)</div>
          </div>
        )}

        {/* ── VARIAÇÃO ── */}
        {tab === "variacao" && (
          <div style={{ animation:"fadeIn 0.25s ease" }}>
            <div style={{ fontFamily:"Georgia,serif", fontSize:17, marginBottom:4 }}>Variação Anual</div>
            <div style={{ fontSize:12, color:"#8EA6BB", marginBottom:14 }}>Abr 2026 vs Abr 2025 · Ordenado da maior queda</div>
            <div style={{ background:"#FDFAF5", border:"1px solid #D6CEBD", borderRadius:12, padding:"14px 16px" }}>
              {[...data.countries].map(c => ({ ...c, v:parseFloat(pct(c.cur, c.prev)) })).sort((a, b) => a.v - b.v).map(c => {
                const isPT = c.code === "PT";
                const color = isPT ? "#C9A84C" : c.v < -20 ? "#C0392B" : c.v < -10 ? "#E67E22" : c.v > 0 ? "#3D7A55" : "#8EA6BB";
                const w = (Math.abs(c.v) / 28 * 100).toFixed(1);
                return (
                  <div key={c.code} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7 }}>
                    <div style={{ width:90, fontSize:12, color:"#3D5166", textAlign:"right", flexShrink:0, fontWeight:isPT ? 700 : 400 }}>{c.flag} {c.name}</div>
                    <div style={{ flex:1, height:22, background:"#D6CEBD", borderRadius:4, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${w}%`, background:color, borderRadius:4, display:"flex", alignItems:"center", paddingLeft:6 }}>
                        <span style={{ fontSize:11, fontWeight:700, color:"#fff", textShadow:"0 1px 2px rgba(0,0,0,.3)" }}>{c.v >= 0 ? "▲" : "▼"}{Math.abs(c.v)}%</span>
                      </div>
                    </div>
                    <div style={{ width:56, fontSize:10, color:"#8EA6BB", textAlign:"right" }}>{fmt(c.prev)}→{fmt(c.cur)}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize:10, color:"#8EA6BB", marginTop:10, lineHeight:1.6 }}>🔴 &gt;20% · 🟠 10–20% · ⚫ &lt;10% · 🟢 Subida · 🟡 Portugal</div>
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={{ background:"#FDFAF5", borderTop:"1px solid #D6CEBD", display:"flex", paddingBottom:`calc(${safeBottom})`, flexShrink:0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex:1, padding:"10px 4px 8px", border:"none", background:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
            <span style={{ fontSize:20 }}>{t.icon}</span>
            <span style={{ fontSize:10, fontWeight:600, color:tab === t.id ? "#C9A84C" : "#8EA6BB" }}>{t.label}</span>
            {tab === t.id && <div style={{ width:20, height:2, background:"#C9A84C", borderRadius:1 }} />}
          </button>
        ))}
        <button onClick={reset}
          style={{ flex:1, padding:"10px 4px 8px", border:"none", background:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
          <span style={{ fontSize:20 }}>↩</span>
          <span style={{ fontSize:10, fontWeight:600, color:"#8EA6BB" }}>Repor</span>
        </button>
      </div>
    </div>
  );
}
