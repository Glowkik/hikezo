import { useState, useRef } from "react";

const FREE_RESUME_KEY = "hz_resume_used";

function ScoreRing({ score, size = 80, color = "#0ea5e9" }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (score / 10) * circ;
  return (
    <svg width={size} height={size} style={{ transform:"rotate(-90deg)", flexShrink:0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth="6"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
        style={{ transition:"stroke-dasharray 1s ease" }}/>
    </svg>
  );
}

export default function ResumeUpload({ onClose, user, onShowAuth, onStartChat }) {
  const [step, setStep] = useState("upload");
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const isMobile = window.innerWidth < 640;

  const alreadyUsed = () => { try { return localStorage.getItem(FREE_RESUME_KEY) === "1"; } catch { return false; } };
  const markUsed = () => { try { localStorage.setItem(FREE_RESUME_KEY, "1"); } catch {} };

  const handleFile = (f) => {
    if (!f) return;
    if (!f.name.match(/\.(pdf|doc|docx|txt)$/i)) { setError("Please upload a PDF, DOC, DOCX, or TXT file."); return; }
    if (f.size > 5 * 1024 * 1024) { setError("File too large. Max 5MB."); return; }
    setFile(f); setError("");
  };

  const analyze = async () => {
    if (!user) { onShowAuth && onShowAuth(); return; }
    if (!file) return;
    if (alreadyUsed()) { setStep("upgrade"); return; }
    setStep("analyzing");
    try {
      let messages;
      if (file.type === "application/pdf") {
        const base64 = await new Promise((res) => {
          const r = new FileReader();
          r.onload = e => res(e.target.result.split(",")[1]);
          r.readAsDataURL(file);
        });
        messages = [{ role:"user", content:[
          { type:"document", source:{ type:"base64", media_type:"application/pdf", data:base64 } },
          { type:"text", text:`You are an expert Indian career consultant. Analyze this resume and respond ONLY in JSON:
{"score":7.2,"role":"Software Engineer","experience":"3 years","strengths":["strength1","strength2","strength3"],"issues":[{"title":"Issue","desc":"Description","impact":"high"},{"title":"Issue","desc":"Description","impact":"medium"},{"title":"Issue","desc":"Description","impact":"medium"},{"title":"Issue","desc":"Description","impact":"low"},{"title":"Issue","desc":"Description","impact":"low"}],"salaryRange":"₹8-12 LPA","topSkillMissing":"Missing skill","quickWin":"One immediate improvement","summary":"2-3 line honest assessment for Indian job market"}` }
        ]}];
      } else {
        const text = await new Promise((res) => {
          const r = new FileReader();
          r.onload = e => res(e.target.result);
          r.readAsText(file);
        });
        messages = [{ role:"user", content:`You are an expert Indian career consultant. Analyze this resume and respond ONLY in JSON:
{"score":7.2,"role":"Software Engineer","experience":"3 years","strengths":["strength1","strength2","strength3"],"issues":[{"title":"Issue","desc":"Description","impact":"high"},{"title":"Issue","desc":"Description","impact":"medium"},{"title":"Issue","desc":"Description","impact":"medium"},{"title":"Issue","desc":"Description","impact":"low"},{"title":"Issue","desc":"Description","impact":"low"}],"salaryRange":"₹8-12 LPA","topSkillMissing":"Missing skill","quickWin":"One immediate improvement","summary":"2-3 line honest assessment for Indian job market"}

Resume:
${text.slice(0, 8000)}` }];
      }
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ model:"claude-sonnet-4-6", max_tokens:1000, messages })
      });
      const data = await res.json();
      const raw = data.content.map(c => c.text || "").join("").replace(/```json|```/g,"").trim();
      setResult(JSON.parse(raw));
      markUsed();
      setStep("result");
    } catch(e) {
      setError("Analysis failed. Please try again.");
      setStep("upload");
    }
  };

  const scoreColor = s => s >= 8 ? "#10b981" : s >= 6 ? "#f59e0b" : "#ef4444";
  const scoreLabel = s => s >= 8 ? "Strong" : s >= 6 ? "Average" : "Needs Work";
  const impactColor = { high:"#ef4444", medium:"#f59e0b", low:"#64748b" };
  const impactBg = { high:"rgba(239,68,68,0.06)", medium:"rgba(245,158,11,0.06)", low:"rgba(100,116,139,0.06)" };

  return (
    <div onClick={e => { if(e.target===e.currentTarget) onClose&&onClose(); }}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(8px)", display:"flex", alignItems:"flex-start", justifyContent:"center", zIndex:500, padding:isMobile?"0.5rem":"1rem", overflowY:"auto" }}>
      <div style={{ background:"#fff", borderRadius:isMobile?"14px":"18px", width:"100%", maxWidth:"620px", padding:isMobile?"1.2rem":"2rem", marginTop:isMobile?"0.5rem":"1rem", marginBottom:"2rem", position:"relative", boxShadow:"0 24px 60px rgba(0,0,0,0.15)" }}>

        <button onClick={onClose} style={{ position:"absolute", top:"0.8rem", right:"0.8rem", background:"#f1f5f9", border:"none", borderRadius:"8px", width:30, height:30, cursor:"pointer", fontSize:"0.9rem", color:"#64748b", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>

        {/* UPLOAD STEP */}
        {step === "upload" && (
          <>
            <div style={{ marginBottom:"1.2rem", paddingRight:"2rem" }}>
              <div style={{ display:"inline-block", background:"rgba(14,165,233,0.08)", color:"#0ea5e9", fontSize:"0.62rem", fontWeight:700, letterSpacing:"0.1em", padding:"3px 10px", borderRadius:"4px", fontFamily:"'Inter',sans-serif", marginBottom:"0.5rem" }}>RESUME ANALYSIS</div>
              <h2 style={{ fontFamily:"'Inter',sans-serif", fontSize:isMobile?"1.25rem":"1.5rem", fontWeight:800, color:"#0f172a", margin:"0 0 0.3rem", letterSpacing:"-0.02em" }}>Get Your Free Resume Score</h2>
              <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.83rem", color:"#64748b", margin:0 }}>AI will analyze your resume and tell you exactly what's holding you back.</p>
            </div>

            {/* Drop zone */}
            <div onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
              style={{ border:`2px dashed ${dragOver?"#0ea5e9":file?"#10b981":"#e2e8f0"}`, borderRadius:"12px", padding:isMobile?"1.5rem 1rem":"2rem 1.5rem", textAlign:"center", cursor:"pointer", background:file?"rgba(16,185,129,0.03)":"#f8fafc", transition:"all .2s", marginBottom:"1rem" }}>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" style={{ display:"none" }} onChange={e => handleFile(e.target.files[0])}/>
              {file ? (
                <>
                  <div style={{ fontSize:"1.8rem", marginBottom:"0.4rem" }}>✅</div>
                  <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:"0.88rem", color:"#0f172a", marginBottom:"0.2rem", wordBreak:"break-all" }}>{file.name}</div>
                  <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.72rem", color:"#64748b" }}>{(file.size/1024).toFixed(1)} KB · Tap to change</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize:"2rem", marginBottom:"0.6rem" }}>📄</div>
                  <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:"0.9rem", color:"#0f172a", marginBottom:"0.2rem" }}>
                    {isMobile ? "Tap to upload resume" : "Drop your resume here"}
                  </div>
                  <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.72rem", color:"#94a3b8" }}>PDF, DOC, DOCX, TXT · Max 5MB</div>
                </>
              )}
            </div>

            {error && (
              <div style={{ background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.15)", borderRadius:"8px", padding:"10px 12px", marginBottom:"0.8rem", fontFamily:"'Inter',sans-serif", fontSize:"0.8rem", color:"#dc2626" }}>{error}</div>
            )}

            {/* What you get */}
            <div style={{ background:"#f8fafc", borderRadius:"10px", padding:"0.9rem", marginBottom:"1rem" }}>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.65rem", fontWeight:700, color:"#64748b", letterSpacing:"0.08em", marginBottom:"0.5rem" }}>WHAT YOU GET FREE</div>
              {["Resume score out of 10", "Top 3 strengths identified", "Key issues found (solutions unlocked with Pro)", "Estimated salary range for your profile"].map((t,i) => (
                <div key={i} style={{ display:"flex", gap:"7px", marginBottom:"0.35rem", alignItems:"flex-start" }}>
                  <span style={{ color:"#10b981", fontSize:"0.78rem", flexShrink:0, marginTop:"1px" }}>✓</span>
                  <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.8rem", color:"#374151", lineHeight:1.4 }}>{t}</span>
                </div>
              ))}
            </div>

            <button onClick={analyze} disabled={!file}
              style={{ width:"100%", padding:"13px", borderRadius:"10px", background:file?"linear-gradient(135deg,#0ea5e9,#6366f1)":"#e2e8f0", border:"none", color:file?"#fff":"#94a3b8", cursor:file?"pointer":"not-allowed", fontFamily:"'Inter',sans-serif", fontSize:"0.92rem", fontWeight:700, transition:"all .2s", WebkitTapHighlightColor:"transparent" }}>
              {user ? "Analyze My Resume →" : "Login & Analyze Free →"}
            </button>
            <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.68rem", color:"#94a3b8", textAlign:"center", marginTop:"0.6rem" }}>1 free analysis · Upgrade Pro for unlimited</p>
          </>
        )}

        {/* ANALYZING STEP */}
        {step === "analyzing" && (
          <div style={{ textAlign:"center", padding:isMobile?"1.5rem 0":"3rem 0" }}>
            <div style={{ fontSize:"2.5rem", marginBottom:"0.8rem" }}>🔍</div>
            <h3 style={{ fontFamily:"'Inter',sans-serif", fontWeight:800, fontSize:"1.1rem", color:"#0f172a", marginBottom:"0.5rem" }}>Analyzing your resume...</h3>
            <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.82rem", color:"#64748b", marginBottom:"1.2rem" }}>AI is reviewing for the Indian job market</p>
            <div style={{ background:"#f1f5f9", borderRadius:"100px", height:"5px", overflow:"hidden", maxWidth:"280px", margin:"0 auto 1.2rem" }}>
              <div style={{ height:"100%", background:"linear-gradient(135deg,#0ea5e9,#6366f1)", borderRadius:"100px", width:"100%", animation:"shimmerSlide 1.5s infinite", backgroundSize:"200% 100%" }}/>
            </div>
            {["Checking ATS compatibility...","Analyzing keyword density...","Reviewing impact statements...","Calculating salary range..."].map((t,i)=>(
              <div key={i} style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.75rem", color:"#94a3b8", marginBottom:"0.3rem" }}>✓ {t}</div>
            ))}
          </div>
        )}

        {/* RESULT STEP */}
        {step === "result" && result && (
          <>
            {/* Score header */}
            <div style={{ display:"flex", alignItems:isMobile?"flex-start":"center", gap:"1rem", marginBottom:"1.2rem", background:"#f8fafc", borderRadius:"12px", padding:isMobile?"0.9rem":"1.2rem", flexDirection:isMobile?"row":"row" }}>
              <div style={{ position:"relative", flexShrink:0, width:72, height:72 }}>
                <ScoreRing score={result.score} size={72} color={scoreColor(result.score)}/>
                <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                  <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"1.1rem", fontWeight:800, color:scoreColor(result.score), lineHeight:1 }}>{result.score}</div>
                  <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.5rem", color:"#94a3b8" }}>/10</div>
                </div>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:"6px", flexWrap:"wrap", marginBottom:"0.2rem" }}>
                  <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.95rem", fontWeight:700, color:"#0f172a" }}>{scoreLabel(result.score)}</span>
                  <span style={{ background:`${scoreColor(result.score)}15`, color:scoreColor(result.score), fontSize:"0.62rem", fontWeight:700, padding:"2px 8px", borderRadius:"100px", fontFamily:"'Inter',sans-serif" }}>{result.role}</span>
                </div>
                <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.75rem", color:"#64748b", marginBottom:"0.3rem" }}>
                  {result.experience} · Est: <strong style={{ color:"#0f172a" }}>{result.salaryRange}</strong>
                </div>
                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.75rem", color:"#475569", margin:0, lineHeight:1.5 }}>{result.summary}</p>
              </div>
            </div>

            {/* Strengths */}
            <div style={{ marginBottom:"1rem" }}>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.65rem", fontWeight:700, color:"#10b981", letterSpacing:"0.08em", marginBottom:"0.5rem" }}>✓ STRENGTHS</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem" }}>
                {result.strengths.map((s,i) => (
                  <span key={i} style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.75rem", color:"#059669", background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.15)", borderRadius:"100px", padding:"4px 10px" }}>{s}</span>
                ))}
              </div>
            </div>

            {/* Issues */}
            <div style={{ marginBottom:"1rem" }}>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.65rem", fontWeight:700, color:"#ef4444", letterSpacing:"0.08em", marginBottom:"0.5rem" }}>⚠ ISSUES FOUND</div>
              <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
                {result.issues.slice(0,2).map((issue,i) => (
                  <div key={i} style={{ background:impactBg[issue.impact], border:`1px solid ${impactColor[issue.impact]}22`, borderRadius:"10px", padding:"0.75rem" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"0.2rem", flexWrap:"wrap" }}>
                      <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.8rem", fontWeight:700, color:"#0f172a" }}>{issue.title}</span>
                      <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.58rem", fontWeight:700, color:impactColor[issue.impact], background:`${impactColor[issue.impact]}15`, padding:"2px 6px", borderRadius:"100px", textTransform:"uppercase" }}>{issue.impact}</span>
                    </div>
                    <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.76rem", color:"#64748b", margin:0, lineHeight:1.5 }}>{issue.desc}</p>
                  </div>
                ))}
                {/* Blurred issues */}
                {result.issues.slice(2).map((issue,i) => (
                  <div key={i} style={{ position:"relative", borderRadius:"10px", overflow:"hidden" }}>
                    <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:"10px", padding:"0.75rem", filter:"blur(3px)", userSelect:"none" }}>
                      <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.8rem", fontWeight:700, color:"#0f172a", marginBottom:"0.2rem" }}>{issue.title}</div>
                      <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.76rem", color:"#64748b", margin:0 }}>{issue.desc}</p>
                    </div>
                    <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:"8px", padding:"5px 12px", fontFamily:"'Inter',sans-serif", fontSize:"0.7rem", fontWeight:700, color:"#0ea5e9", boxShadow:"0 2px 8px rgba(0,0,0,0.08)" }}>🔒 Upgrade to see fix</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick win */}
            <div style={{ background:"rgba(14,165,233,0.05)", border:"1px solid rgba(14,165,233,0.15)", borderRadius:"10px", padding:"0.85rem", marginBottom:"1rem" }}>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.65rem", fontWeight:700, color:"#0ea5e9", letterSpacing:"0.08em", marginBottom:"0.3rem" }}>⚡ QUICK WIN</div>
              <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.8rem", color:"#0f172a", margin:0, lineHeight:1.5 }}>{result.quickWin}</p>
            </div>

            {/* CTA */}
            <div style={{ background:"linear-gradient(135deg,#050B18,#0A1628)", borderRadius:"12px", padding:isMobile?"1rem":"1.3rem", textAlign:"center" }}>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", fontWeight:700, color:"#f8fafc", marginBottom:"0.3rem" }}>
                Want to fix all {result.issues.length} issues?
              </div>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.75rem", color:"#64748b", marginBottom:"0.9rem" }}>
                Talk to a consultant — get a personalized plan + salary script.
              </div>
              <div style={{ display:"flex", gap:"0.6rem", justifyContent:"center", flexWrap:"wrap" }}>
                <button onClick={() => { onClose&&onClose(); onStartChat&&onStartChat(); }}
                  style={{ padding:"10px 20px", borderRadius:"8px", background:"linear-gradient(135deg,#0ea5e9,#6366f1)", border:"none", color:"#fff", cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:"0.85rem", fontWeight:700, WebkitTapHighlightColor:"transparent" }}>
                  Talk to Consultant — Free →
                </button>
                <button onClick={() => window.open("https://rzp.io/rzp/DNfBx2L3","_blank")}
                  style={{ padding:"10px 16px", borderRadius:"8px", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", color:"#94a3b8", cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:"0.8rem", fontWeight:500, WebkitTapHighlightColor:"transparent" }}>
                  Upgrade Pro — ₹399/mo
                </button>
              </div>
            </div>
          </>
        )}

        {/* UPGRADE STEP */}
        {step === "upgrade" && (
          <div style={{ textAlign:"center", padding:"2rem 0" }}>
            <div style={{ fontSize:"2.5rem", marginBottom:"0.8rem" }}>🔒</div>
            <h3 style={{ fontFamily:"'Inter',sans-serif", fontWeight:800, fontSize:"1.1rem", color:"#0f172a", margin:"0 0 0.5rem" }}>Free Analysis Used</h3>
            <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.83rem", color:"#64748b", margin:"0 0 1.5rem", lineHeight:1.6 }}>
              You've used your 1 free resume analysis.<br/>
              Upgrade to Pro for <strong>unlimited analyses</strong> + consultant chat.
            </p>
            <div style={{ display:"flex", gap:"0.7rem", justifyContent:"center", flexWrap:"wrap" }}>
              <button onClick={() => window.open("https://rzp.io/rzp/DNfBx2L3","_blank")}
                style={{ padding:"11px 22px", borderRadius:"8px", background:"linear-gradient(135deg,#0ea5e9,#6366f1)", border:"none", color:"#fff", cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", fontWeight:700 }}>
                Upgrade to Pro — ₹399/mo →
              </button>
              <button onClick={onClose}
                style={{ padding:"11px 16px", borderRadius:"8px", background:"transparent", border:"1px solid #e2e8f0", color:"#64748b", cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:"0.82rem" }}>
                Maybe later
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
