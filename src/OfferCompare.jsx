import { useState } from "react";

const EMPTY_OFFER = { company: "", role: "", ctc: "", inhand: "", variable: "", location: "", wfh: "office", notice: "", growth: "" };
const STORAGE_KEY = "hz_compare_used";

function Label({ children }) {
  return <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.72rem", fontWeight:600, color:"#64748b", marginBottom:"5px", letterSpacing:"0.04em", textTransform:"uppercase" }}>{children}</div>;
}

function Input({ value, onChange, placeholder, type="text", prefix }) {
  return (
    <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
      {prefix && <span style={{ position:"absolute", left:"10px", color:"#64748b", fontSize:"0.85rem", fontFamily:"'Inter',sans-serif" }}>{prefix}</span>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
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
  const colors = ["#0ea5e9", "#8b5cf6", "#ec4899", "#f59e0b"];
  const labels = ["Offer A", "Offer B", "Offer C", "Offer D"];
  const color = colors[index];
  return (
    <div style={{ background:"#fff", border:`1.5px solid ${color}22`, borderRadius:"14px", padding:"1.4rem", boxShadow:"0 2px 8px rgba(0,0,0,0.04)", flex:1, minWidth:"240px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:color }}/>
          <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:"0.9rem", color:"#0f172a" }}>{labels[index]}</span>
        </div>
        {total > 2 && <button onClick={onRemove} style={{ background:"none", border:"none", color:"#94a3b8", cursor:"pointer", fontSize:"0.9rem", padding:"2px 6px", borderRadius:"4px" }}>✕</button>}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
        <div><Label>Company</Label><Input value={offer.company} onChange={v => onChange("company", v)} placeholder="e.g. Infosys"/></div>
        <div><Label>Role</Label><Input value={offer.role} onChange={v => onChange("role", v)} placeholder="e.g. Senior Engineer"/></div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.5rem" }}>
          <div><Label>CTC (LPA)</Label><Input value={offer.ctc} onChange={v => onChange("ctc", v)} placeholder="14" type="number" prefix="₹"/></div>
          <div><Label>In-hand/mo</Label><Input value={offer.inhand} onChange={v => onChange("inhand", v)} placeholder="95K" type="number" prefix="₹"/></div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.5rem" }}>
          <div><Label>Variable %</Label><Input value={offer.variable} onChange={v => onChange("variable", v)} placeholder="10" type="number" prefix="%"/></div>
          <div><Label>Notice Period</Label><Input value={offer.notice} onChange={v => onChange("notice", v)} placeholder="30 days"/></div>
        </div>
        <div><Label>Location</Label><Input value={offer.location} onChange={v => onChange("location", v)} placeholder="Bengaluru"/></div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.5rem" }}>
          <div><Label>Work Mode</Label>
            <Select value={offer.wfh} onChange={v => onChange("wfh", v)} options={[
              { value:"office", label:"Full Office" },
              { value:"hybrid", label:"Hybrid" },
              { value:"remote", label:"Remote" },
            ]}/>
          </div>
          <div><Label>Growth</Label>
            <Select value={offer.growth} onChange={v => onChange("growth", v)} options={[
              { value:"", label:"Select..." },
              { value:"high", label:"High" },
              { value:"medium", label:"Medium" },
              { value:"low", label:"Low" },
            ]}/>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultCard({ result, index }) {
  const colors = ["#0ea5e9", "#8b5cf6", "#ec4899", "#f59e0b"];
  const labels = ["Offer A", "Offer B", "Offer C", "Offer D"];
  const color = colors[index];
  const isWinner = result.winner;
  return (
    <div style={{ background: isWinner ? `linear-gradient(135deg, ${color}11, ${color}05)` : "#fff", border:`1.5px solid ${isWinner ? color : "#e2e8f0"}`, borderRadius:"14px", padding:"1.4rem", flex:1, minWidth:"200px", position:"relative" }}>
      {isWinner && <div style={{ position:"absolute", top:"-11px", left:"50%", transform:"translateX(-50%)", background:color, color:"#fff", fontSize:"0.62rem", fontWeight:700, padding:"3px 10px", borderRadius:"20px", letterSpacing:"0.06em", fontFamily:"'Inter',sans-serif", whiteSpace:"nowrap" }}>⭐ RECOMMENDED</div>}
      <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"0.8rem" }}>
        <div style={{ width:7, height:7, borderRadius:"50%", background:color }}/>
        <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:"0.85rem", color:"#0f172a" }}>{labels[index]} — {result.company}</span>
      </div>
      <div style={{ background: isWinner ? `${color}15` : "#f8fafc", borderRadius:"8px", padding:"0.6rem", marginBottom:"0.8rem", textAlign:"center" }}>
        <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"1.5rem", fontWeight:800, color: isWinner ? color : "#0f172a" }}>{result.score}<span style={{ fontSize:"0.82rem", fontWeight:500, color:"#64748b" }}>/10</span></div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:"0.4rem", marginBottom:"0.8rem" }}>
        {result.pros.map((p, i) => <div key={i} style={{ display:"flex", gap:"5px" }}><span style={{ color:"#10b981", fontSize:"0.75rem" }}>✓</span><span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.76rem", color:"#374151", lineHeight:1.5 }}>{p}</span></div>)}
        {result.cons.map((c, i) => <div key={i} style={{ display:"flex", gap:"5px" }}><span style={{ color:"#ef4444", fontSize:"0.75rem" }}>✗</span><span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.76rem", color:"#374151", lineHeight:1.5 }}>{c}</span></div>)}
      </div>
      <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.76rem", color:"#475569", lineHeight:1.6, borderTop:"1px solid #f1f5f9", paddingTop:"0.7rem", margin:0 }}>{result.verdict}</p>
    </div>
  );
}

export default function OfferCompare({ onClose, user, isPro, onShowAuth }) {
  const [offers, setOffers] = useState([{ ...EMPTY_OFFER }, { ...EMPTY_OFFER }]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);

  const compareUsed = () => { try { return localStorage.getItem(STORAGE_KEY) === "1"; } catch { return false; } };
  const markCompareUsed = () => { try { localStorage.setItem(STORAGE_KEY, "1"); } catch {} };

  const updateOffer = (index, field, value) => setOffers(prev => prev.map((o, i) => i === index ? { ...o, [field]: value } : o));
  const addOffer = () => { if (offers.length < 4) setOffers(prev => [...prev, { ...EMPTY_OFFER }]); };
  const removeOffer = (index) => setOffers(prev => prev.filter((_, i) => i !== index));

  const analyze = async () => {
    if (!user) { onClose && onClose(); onShowAuth && onShowAuth(); return; }
    if (!isPro && compareUsed()) { setShowUpgrade(true); return; }
    const filled = offers.filter(o => o.company && o.ctc);
    if (filled.length < 2) { setError("Please fill Company and CTC for at least 2 offers."); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: `You are a senior career consultant in India. Analyze these job offers.

Offers:
${offers.map((o, i) => `Offer ${String.fromCharCode(65+i)}: Company: ${o.company||"Unknown"}, Role: ${o.role||"N/A"}, CTC: ${o.ctc||"N/A"} LPA, In-hand: ₹${o.inhand||"N/A"}/mo, Variable: ${o.variable||"0"}%, Location: ${o.location||"N/A"}, Work: ${o.wfh}, Notice: ${o.notice||"N/A"}, Growth: ${o.growth||"N/A"}`).join("\n")}

Respond ONLY in this exact JSON format:
{"offers":[{"company":"name","score":8.5,"winner":true,"pros":["pro1","pro2"],"cons":["con1"],"verdict":"2 line verdict"}],"summary":"2 line overall recommendation"}

Rules: score out of 10, only one winner:true, simple English, be honest.` }]
        })
      });
      const data = await response.json();
      const text = data.content.map(c => c.text || "").join("").replace(/```json|```/g, "").trim();
      setResult(JSON.parse(text));
      if (!isPro) markCompareUsed();
    } catch { setError("Something went wrong. Please try again."); }
    setLoading(false);
  };

  // Not logged in — show login prompt
  if (!user) return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose && onClose(); }}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:500, padding:"1rem" }}>
      <div style={{ background:"#fff", borderRadius:"18px", padding:"2.5rem", maxWidth:"400px", width:"100%", textAlign:"center" }}>
        <div style={{ fontSize:"2rem", marginBottom:"0.8rem" }}>🔐</div>
        <h3 style={{ fontFamily:"'Inter',sans-serif", fontWeight:800, fontSize:"1.2rem", color:"#0f172a", margin:"0 0 0.5rem" }}>Login Required</h3>
        <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.85rem", color:"#64748b", margin:"0 0 1.5rem", lineHeight:1.6 }}>Please login to use the Job Offer Compare tool.</p>
        <div style={{ display:"flex", gap:"0.8rem", justifyContent:"center" }}>
          <button onClick={() => { onClose && onClose(); onShowAuth && onShowAuth(); }} style={{ padding:"11px 24px", borderRadius:"8px", background:"linear-gradient(135deg,#0ea5e9,#6366f1)", border:"none", color:"#fff", cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", fontWeight:700 }}>Login / Sign Up →</button>
          <button onClick={onClose} style={{ padding:"11px 18px", borderRadius:"8px", background:"transparent", border:"1px solid #e2e8f0", color:"#64748b", cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:"0.85rem" }}>Cancel</button>
        </div>
      </div>
    </div>
  );

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose && onClose(); }}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"flex-start", justifyContent:"center", zIndex:500, padding:"1rem", overflowY:"auto" }}>
      <div style={{ background:"#f8fafc", borderRadius:"18px", width:"100%", maxWidth:"960px", padding:"1.8rem", marginTop:"1rem", marginBottom:"2rem", position:"relative" }}>

        <button onClick={onClose} style={{ position:"absolute", top:"1rem", right:"1rem", background:"rgba(0,0,0,0.06)", border:"none", borderRadius:"8px", width:30, height:30, cursor:"pointer", fontSize:"1rem", color:"#64748b" }}>✕</button>

        {/* Header */}
        <div style={{ marginBottom:"1.5rem" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"0.5rem", flexWrap:"wrap" }}>
            <div style={{ background:"rgba(14,165,233,0.1)", color:"#0ea5e9", fontSize:"0.65rem", fontWeight:700, letterSpacing:"0.1em", padding:"3px 10px", borderRadius:"4px", fontFamily:"'Inter',sans-serif" }}>JOB OFFER COMPARE</div>
            {!isPro && !compareUsed() && <div style={{ background:"rgba(16,185,129,0.1)", color:"#10b981", fontSize:"0.65rem", fontWeight:700, padding:"3px 10px", borderRadius:"4px", fontFamily:"'Inter',sans-serif" }}>1 FREE COMPARISON</div>}
            {!isPro && compareUsed() && <div style={{ background:"rgba(239,68,68,0.1)", color:"#ef4444", fontSize:"0.65rem", fontWeight:700, padding:"3px 10px", borderRadius:"4px", fontFamily:"'Inter',sans-serif" }}>FREE LIMIT REACHED — UPGRADE</div>}
            {isPro && <div style={{ background:"rgba(99,102,241,0.1)", color:"#6366f1", fontSize:"0.65rem", fontWeight:700, padding:"3px 10px", borderRadius:"4px", fontFamily:"'Inter',sans-serif" }}>PRO — UNLIMITED</div>}
          </div>
          <h2 style={{ fontFamily:"'Inter',sans-serif", fontSize:"1.4rem", fontWeight:800, color:"#0f172a", margin:"0 0 0.25rem", letterSpacing:"-0.02em" }}>Which offer should you take?</h2>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.82rem", color:"#64748b", margin:0 }}>
            {isPro ? "Compare up to 4 offers — AI will recommend the best one." : "Free: 1 comparison with 2 offers. Upgrade Pro for unlimited & up to 4 offers."}
          </p>
        </div>

        {/* Upgrade wall */}
        {!isPro && compareUsed() && !result ? (
          <div style={{ background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:"14px", padding:"2rem", textAlign:"center" }}>
            <div style={{ fontSize:"2rem", marginBottom:"0.8rem" }}>🔒</div>
            <h3 style={{ fontFamily:"'Inter',sans-serif", fontWeight:800, fontSize:"1.1rem", color:"#0f172a", margin:"0 0 0.5rem" }}>Free comparison used</h3>
            <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.83rem", color:"#64748b", margin:"0 0 1.2rem", lineHeight:1.6 }}>Upgrade to Pro for unlimited comparisons and up to 4 offers at once.</p>
            <div style={{ display:"flex", gap:"0.8rem", justifyContent:"center" }}>
              <button onClick={() => window.open("https://rzp.io/rzp/DNfBx2L3","_blank")} style={{ padding:"10px 22px", borderRadius:"8px", background:"linear-gradient(135deg,#0ea5e9,#6366f1)", border:"none", color:"#fff", cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", fontWeight:700 }}>Upgrade to Pro — ₹399/mo →</button>
              <button onClick={onClose} style={{ padding:"10px 16px", borderRadius:"8px", background:"transparent", border:"1px solid #e2e8f0", color:"#64748b", cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:"0.83rem" }}>Maybe later</button>
            </div>
          </div>
        ) : (
          <>
            {/* Offer Cards */}
            <div style={{ display:"flex", gap:"0.8rem", flexWrap:"wrap", marginBottom:"1rem" }}>
              {offers.map((offer, i) => (
                <OfferCard key={i} offer={offer} index={i} onChange={(f, v) => updateOffer(i, f, v)} onRemove={() => removeOffer(i)} total={offers.length}/>
              ))}
            </div>

            {/* Actions row */}
            <div style={{ display:"flex", gap:"0.7rem", alignItems:"center", marginBottom:"1.2rem", flexWrap:"wrap" }}>
              {isPro && offers.length < 4 && (
                <button onClick={addOffer} style={{ padding:"9px 16px", borderRadius:"8px", border:"1.5px dashed #cbd5e1", background:"transparent", color:"#64748b", cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:"0.82rem", fontWeight:500 }}
                  onMouseEnter={e=>{e.target.style.borderColor="#0ea5e9";e.target.style.color="#0ea5e9";}} onMouseLeave={e=>{e.target.style.borderColor="#cbd5e1";e.target.style.color="#64748b";}}>
                  + Add Offer {offers.length + 1}
                </button>
              )}
              {!isPro && (
                <button onClick={() => setShowUpgrade(true)} style={{ padding:"9px 16px", borderRadius:"8px", border:"1.5px dashed #6366f1", background:"rgba(99,102,241,0.04)", color:"#6366f1", cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:"0.82rem", fontWeight:600 }}>
                  🔒 Compare 3-4 offers (Pro)
                </button>
              )}
              <button onClick={analyze} disabled={loading} style={{ padding:"10px 26px", borderRadius:"8px", background:"linear-gradient(135deg,#0ea5e9,#6366f1)", border:"none", color:"#fff", cursor:loading?"not-allowed":"pointer", fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", fontWeight:700, opacity:loading?0.8:1 }}>
                {loading ? "Analyzing..." : "Compare Now →"}
              </button>
              {error && <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.78rem", color:"#ef4444" }}>{error}</span>}
            </div>

            {/* Loading */}
            {loading && (
              <div style={{ textAlign:"center", padding:"1.5rem", background:"#fff", borderRadius:"12px", marginBottom:"1rem" }}>
                <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.85rem", color:"#64748b", marginBottom:"0.6rem" }}>AI is analyzing your offers...</div>
                <div style={{ height:"3px", background:"#f1f5f9", borderRadius:"2px", overflow:"hidden" }}>
                  <div style={{ height:"100%", background:"linear-gradient(135deg,#0ea5e9,#6366f1)", animation:"ld 1.5s infinite", width:"40%", borderRadius:"2px" }}/>
                </div>
                <style>{`@keyframes ld{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}`}</style>
              </div>
            )}

            {/* Results */}
            {result && (
              <div>
                <div style={{ display:"flex", gap:"0.8rem", flexWrap:"wrap", marginBottom:"1rem" }}>
                  {result.offers.map((r, i) => <ResultCard key={i} result={r} index={i}/>)}
                </div>
                <div style={{ background:"linear-gradient(135deg,#0ea5e911,#6366f111)", border:"1px solid #0ea5e933", borderRadius:"12px", padding:"1rem", marginBottom: !isPro ? "0.8rem" : 0 }}>
                  <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.68rem", fontWeight:700, color:"#0ea5e9", letterSpacing:"0.08em", marginBottom:"0.3rem" }}>AI RECOMMENDATION</div>
                  <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.85rem", color:"#0f172a", lineHeight:1.7, margin:0 }}>{result.summary}</p>
                </div>
                {!isPro && (
                  <div style={{ background:"rgba(99,102,241,0.05)", border:"1px solid rgba(99,102,241,0.15)", borderRadius:"12px", padding:"0.9rem", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"0.7rem" }}>
                    <div>
                      <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:"0.82rem", color:"#0f172a" }}>Want to compare again or add more offers?</div>
                      <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.75rem", color:"#64748b" }}>Pro — unlimited comparisons & up to 4 offers.</div>
                    </div>
                    <button onClick={() => window.open("https://rzp.io/rzp/DNfBx2L3","_blank")} style={{ padding:"8px 18px", borderRadius:"8px", background:"linear-gradient(135deg,#0ea5e9,#6366f1)", border:"none", color:"#fff", cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:"0.82rem", fontWeight:700, whiteSpace:"nowrap" }}>Upgrade — ₹399/mo →</button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Upgrade popup */}
        {showUpgrade && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:600, padding:"1rem" }}>
            <div style={{ background:"#fff", borderRadius:"16px", padding:"2rem", maxWidth:"400px", width:"100%", textAlign:"center" }}>
              <div style={{ fontSize:"2rem", marginBottom:"0.8rem" }}>🔒</div>
              <h3 style={{ fontFamily:"'Inter',sans-serif", fontWeight:800, fontSize:"1.1rem", color:"#0f172a", margin:"0 0 0.4rem" }}>Pro Feature</h3>
              <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.83rem", color:"#64748b", margin:"0 0 1.2rem", lineHeight:1.6 }}>
                Free plan: 1 comparison, 2 offers only.<br/>
                Pro: <strong>Unlimited comparisons</strong> + up to <strong>4 offers</strong>.
              </p>
              <div style={{ display:"flex", gap:"0.7rem", justifyContent:"center" }}>
                <button onClick={() => window.open("https://rzp.io/rzp/DNfBx2L3","_blank")} style={{ padding:"10px 22px", borderRadius:"8px", background:"linear-gradient(135deg,#0ea5e9,#6366f1)", border:"none", color:"#fff", cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:"0.87rem", fontWeight:700 }}>Upgrade — ₹399/mo →</button>
                <button onClick={() => setShowUpgrade(false)} style={{ padding:"10px 16px", borderRadius:"8px", background:"transparent", border:"1px solid #e2e8f0", color:"#64748b", cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:"0.83rem" }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
