import { useState } from "react";

const EMPTY_OFFER = { company: "", role: "", ctc: "", inhand: "", variable: "", location: "", wfh: "office", notice: "", growth: "" };

function Label({ children }) {
  return <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.72rem", fontWeight:600, color:"#64748b", marginBottom:"5px", letterSpacing:"0.04em", textTransform:"uppercase" }}>{children}</div>;
}

function Input({ value, onChange, placeholder, type="text", prefix }) {
  return (
    <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
      {prefix && <span style={{ position:"absolute", left:"10px", color:"#64748b", fontSize:"0.85rem", fontFamily:"'Inter',sans-serif" }}>{prefix}</span>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width:"100%", padding: prefix ? "9px 10px 9px 22px" : "9px 10px", borderRadius:"7px", border:"1px solid #e2e8f0", background:"#f8fafc", color:"#0f172a", fontFamily:"'Inter',sans-serif", fontSize:"0.85rem", outline:"none", boxSizing:"border-box", transition:"border-color .2s" }}
        onFocus={e => e.target.style.borderColor="#0ea5e9"}
        onBlur={e => e.target.style.borderColor="#e2e8f0"}
      />
    </div>
  );
}

function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width:"100%", padding:"9px 10px", borderRadius:"7px", border:"1px solid #e2e8f0", background:"#f8fafc", color:"#0f172a", fontFamily:"'Inter',sans-serif", fontSize:"0.85rem", outline:"none", cursor:"pointer" }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function OfferCard({ offer, index, onChange, onRemove, total }) {
  const colors = ["#0ea5e9", "#8b5cf6", "#ec4899"];
  const labels = ["Offer A", "Offer B", "Offer C"];
  const color = colors[index];
  return (
    <div style={{ background:"#fff", border:`1.5px solid ${color}22`, borderRadius:"14px", padding:"1.4rem", boxShadow:"0 2px 12px rgba(0,0,0,0.05)", flex:1, minWidth:"260px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.2rem" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:color }}/>
          <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:"0.9rem", color:"#0f172a" }}>{labels[index]}</span>
        </div>
        {total > 2 && <button onClick={onRemove} style={{ background:"none", border:"none", color:"#94a3b8", cursor:"pointer", fontSize:"1rem", padding:"2px 6px", borderRadius:"4px" }}>✕</button>}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:"0.85rem" }}>
        <div><Label>Company Name</Label><Input value={offer.company} onChange={v => onChange("company", v)} placeholder="e.g. Infosys"/></div>
        <div><Label>Role</Label><Input value={offer.role} onChange={v => onChange("role", v)} placeholder="e.g. Senior Engineer"/></div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.6rem" }}>
          <div><Label>CTC (LPA)</Label><Input value={offer.ctc} onChange={v => onChange("ctc", v)} placeholder="14" type="number" prefix="₹"/></div>
          <div><Label>In-hand/mo</Label><Input value={offer.inhand} onChange={v => onChange("inhand", v)} placeholder="95000" type="number" prefix="₹"/></div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.6rem" }}>
          <div><Label>Variable %</Label><Input value={offer.variable} onChange={v => onChange("variable", v)} placeholder="10" type="number" prefix="%"/></div>
          <div><Label>Notice Period</Label><Input value={offer.notice} onChange={v => onChange("notice", v)} placeholder="30 days"/></div>
        </div>
        <div><Label>Location</Label><Input value={offer.location} onChange={v => onChange("location", v)} placeholder="Bengaluru"/></div>
        <div><Label>Work Mode</Label>
          <Select value={offer.wfh} onChange={v => onChange("wfh", v)} options={[
            { value:"office", label:"Full Office" },
            { value:"hybrid", label:"Hybrid (2-3 days)" },
            { value:"remote", label:"Full Remote" },
          ]}/>
        </div>
        <div><Label>Growth Potential</Label>
          <Select value={offer.growth} onChange={v => onChange("growth", v)} options={[
            { value:"", label:"Select..." },
            { value:"high", label:"High — startup / fast track" },
            { value:"medium", label:"Medium — steady growth" },
            { value:"low", label:"Low — stable but slow" },
          ]}/>
        </div>
      </div>
    </div>
  );
}

function ResultCard({ result, index }) {
  const colors = ["#0ea5e9", "#8b5cf6", "#ec4899"];
  const labels = ["Offer A", "Offer B", "Offer C"];
  const color = colors[index];
  const isWinner = result.winner;
  return (
    <div style={{ background: isWinner ? `linear-gradient(135deg, ${color}11, ${color}05)` : "#fff", border:`1.5px solid ${isWinner ? color : "#e2e8f0"}`, borderRadius:"14px", padding:"1.4rem", flex:1, minWidth:"220px", position:"relative" }}>
      {isWinner && <div style={{ position:"absolute", top:"-12px", left:"50%", transform:"translateX(-50%)", background:color, color:"#fff", fontSize:"0.65rem", fontWeight:700, padding:"3px 10px", borderRadius:"20px", letterSpacing:"0.06em", fontFamily:"'Inter',sans-serif", whiteSpace:"nowrap" }}>⭐ RECOMMENDED</div>}
      <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"1rem" }}>
        <div style={{ width:8, height:8, borderRadius:"50%", background:color }}/>
        <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:"0.9rem", color:"#0f172a" }}>{labels[index]} — {result.company}</span>
      </div>
      <div style={{ background: isWinner ? `${color}15` : "#f8fafc", borderRadius:"8px", padding:"0.8rem", marginBottom:"1rem", textAlign:"center" }}>
        <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"1.6rem", fontWeight:800, color: isWinner ? color : "#0f172a" }}>{result.score}<span style={{ fontSize:"0.9rem", fontWeight:500, color:"#64748b" }}>/10</span></div>
        <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.72rem", color:"#64748b", marginTop:"2px" }}>Overall Score</div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem", marginBottom:"1rem" }}>
        {result.pros.map((p, i) => (
          <div key={i} style={{ display:"flex", gap:"6px", alignItems:"flex-start" }}>
            <span style={{ color:"#10b981", fontSize:"0.8rem", marginTop:"1px" }}>✓</span>
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.78rem", color:"#374151", lineHeight:1.5 }}>{p}</span>
          </div>
        ))}
        {result.cons.map((c, i) => (
          <div key={i} style={{ display:"flex", gap:"6px", alignItems:"flex-start" }}>
            <span style={{ color:"#ef4444", fontSize:"0.8rem", marginTop:"1px" }}>✗</span>
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.78rem", color:"#374151", lineHeight:1.5 }}>{c}</span>
          </div>
        ))}
      </div>
      <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.78rem", color:"#475569", lineHeight:1.6, borderTop:"1px solid #f1f5f9", paddingTop:"0.8rem", margin:0 }}>{result.verdict}</p>
    </div>
  );
}

export default function OfferCompare({ onClose }) {
  const [offers, setOffers] = useState([{ ...EMPTY_OFFER }, { ...EMPTY_OFFER }]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateOffer = (index, field, value) => {
    setOffers(prev => prev.map((o, i) => i === index ? { ...o, [field]: value } : o));
  };

  const addOffer = () => {
    if (offers.length < 3) setOffers(prev => [...prev, { ...EMPTY_OFFER }]);
  };

  const removeOffer = (index) => {
    setOffers(prev => prev.filter((_, i) => i !== index));
  };

  const analyze = async () => {
    const filled = offers.filter(o => o.company && o.ctc);
    if (filled.length < 2) { setError("Kam se kam 2 offers mein Company aur CTC bharo."); return; }
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const prompt = `You are a senior career consultant in India. Analyze these job offers and give a detailed comparison.

Offers:
${offers.map((o, i) => `
Offer ${String.fromCharCode(65+i)}:
- Company: ${o.company || "Unknown"}
- Role: ${o.role || "Not specified"}
- CTC: ${o.ctc ? o.ctc + " LPA" : "Not given"}
- In-hand: ${o.inhand ? "₹" + o.inhand + "/month" : "Not given"}
- Variable: ${o.variable ? o.variable + "%" : "Not given"}
- Location: ${o.location || "Not given"}
- Work mode: ${o.wfh}
- Notice period: ${o.notice || "Not given"}
- Growth potential: ${o.growth || "Not specified"}
`).join("")}

Respond ONLY in this exact JSON format, no extra text:
{
  "offers": [
    {
      "company": "company name",
      "score": 8.5,
      "winner": true,
      "pros": ["pro 1", "pro 2", "pro 3"],
      "cons": ["con 1", "con 2"],
      "verdict": "2-3 line summary in simple Hinglish about this offer"
    }
  ],
  "summary": "2-3 line overall recommendation in simple Hinglish — which to pick and why"
}

Rules:
- Score out of 10 based on CTC, growth, work mode, location
- Only one offer should have winner: true
- Keep pros/cons short and specific
- verdict and summary in simple Hinglish (mix of Hindi and English)
- Be honest, not sugar-coated`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });

      const data = await response.json();
      const text = data.content.map(c => c.text || "").join("").replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(text);
      setResult(parsed);
    } catch (e) {
      setError("Kuch problem aayi. Dobara try karo.");
    }
    setLoading(false);
  };

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose && onClose(); }}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"flex-start", justifyContent:"center", zIndex:500, padding:"1rem", overflowY:"auto" }}>
      <div style={{ background:"#f8fafc", borderRadius:"18px", width:"100%", maxWidth:"980px", padding:"2rem", marginTop:"1rem", marginBottom:"2rem", position:"relative" }}>

        {/* Header */}
        <button onClick={onClose} style={{ position:"absolute", top:"1rem", right:"1rem", background:"rgba(0,0,0,0.06)", border:"none", borderRadius:"8px", width:32, height:32, cursor:"pointer", fontSize:"1rem", color:"#64748b", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>

        <div style={{ marginBottom:"1.8rem" }}>
          <div style={{ display:"inline-block", background:"rgba(14,165,233,0.1)", color:"#0ea5e9", fontSize:"0.68rem", fontWeight:700, letterSpacing:"0.1em", padding:"3px 10px", borderRadius:"4px", fontFamily:"'Inter',sans-serif", marginBottom:"0.6rem" }}>JOB OFFER COMPARE</div>
          <h2 style={{ fontFamily:"'Inter',sans-serif", fontSize:"1.6rem", fontWeight:800, color:"#0f172a", margin:"0 0 0.3rem", letterSpacing:"-0.03em" }}>Konsa offer lein?</h2>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.85rem", color:"#64748b", margin:0 }}>Offers ka details bharo — AI batayega konsa best hai aur kyun.</p>
        </div>

        {/* Offer Cards */}
        <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap", marginBottom:"1.2rem" }}>
          {offers.map((offer, i) => (
            <OfferCard key={i} offer={offer} index={i} onChange={(f, v) => updateOffer(i, f, v)} onRemove={() => removeOffer(i)} total={offers.length}/>
          ))}
        </div>

        {/* Add offer + Analyze */}
        <div style={{ display:"flex", gap:"0.8rem", alignItems:"center", marginBottom:"1.5rem", flexWrap:"wrap" }}>
          {offers.length < 3 && (
            <button onClick={addOffer} style={{ padding:"10px 18px", borderRadius:"8px", border:"1.5px dashed #cbd5e1", background:"transparent", color:"#64748b", cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:"0.85rem", fontWeight:500, transition:"all .2s" }}
              onMouseEnter={e => { e.target.style.borderColor="#0ea5e9"; e.target.style.color="#0ea5e9"; }}
              onMouseLeave={e => { e.target.style.borderColor="#cbd5e1"; e.target.style.color="#64748b"; }}>
              + Teen offer compare karo
            </button>
          )}
          <button onClick={analyze} disabled={loading} style={{ padding:"10px 28px", borderRadius:"8px", background:"linear-gradient(135deg,#0ea5e9,#6366f1)", border:"none", color:"#fff", cursor:loading ? "not-allowed" : "pointer", fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", fontWeight:700, opacity:loading ? 0.8 : 1, transition:"opacity .2s" }}>
            {loading ? "Analyzing..." : "Compare Karo →"}
          </button>
          {error && <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.8rem", color:"#ef4444" }}>{error}</span>}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign:"center", padding:"2rem", background:"#fff", borderRadius:"12px" }}>
            <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", color:"#64748b" }}>AI offers analyze kar raha hai...</div>
            <div style={{ marginTop:"0.8rem", height:"3px", background:"#f1f5f9", borderRadius:"2px", overflow:"hidden" }}>
              <div style={{ height:"100%", background:"linear-gradient(135deg,#0ea5e9,#6366f1)", animation:"loading 1.5s infinite", width:"40%", borderRadius:"2px" }}/>
            </div>
            <style>{`@keyframes loading { 0%{transform:translateX(-100%)} 100%{transform:translateX(350%)} }`}</style>
          </div>
        )}

        {/* Results */}
        {result && (
          <div>
            <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap", marginBottom:"1.2rem" }}>
              {result.offers.map((r, i) => <ResultCard key={i} result={r} index={i}/>)}
            </div>
            <div style={{ background:"linear-gradient(135deg,#0ea5e911,#6366f111)", border:"1px solid #0ea5e933", borderRadius:"12px", padding:"1.2rem" }}>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.72rem", fontWeight:700, color:"#0ea5e9", letterSpacing:"0.08em", marginBottom:"0.4rem" }}>AI RECOMMENDATION</div>
              <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", color:"#0f172a", lineHeight:1.7, margin:0 }}>{result.summary}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
