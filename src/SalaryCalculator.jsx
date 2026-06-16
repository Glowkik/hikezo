import { useState, useRef } from "react";

function calcSalary(ctc, city, regime) {
  const annual = parseFloat(ctc) * 100000;
  if (!annual || annual <= 0) return null;

  // Real CTC structure — employer PF + gratuity are PART of CTC
  // CTC = Gross Salary + Employer PF + Gratuity
  // Employer PF = 12% of basic (capped at ₹1800/mo = ₹21600/yr)
  // Gratuity = 4.81% of basic

  // Step 1: Find basic from CTC
  // Basic is typically 40-50% of gross salary
  // Gross = CTC - Employer PF - Gratuity
  // Let basic = X, then:
  // Employer PF = min(X*0.12, 21600)
  // Gratuity = X*0.0481
  // Gross = CTC - EmployerPF - Gratuity
  // Basic = Gross * 0.40

  // Simplified: Basic = CTC * 0.35 (accounts for employer contributions)
  const basic = Math.round(annual * 0.35);
  const pf_employer = Math.min(Math.round(basic * 0.12), 21600);
  const gratuity = Math.round(basic * 0.0481);

  // Gross = CTC - employer contributions
  const gross_annual = annual - pf_employer - gratuity;

  // Salary components (must add up to gross)
  const hra = city === "metro" ? Math.round(basic * 0.50) : Math.round(basic * 0.40);
  const lta = Math.round(annual * 0.04);
  const special = gross_annual - basic - hra - lta; // Special = whatever is left

  // Employee deductions
  const pf_employee = Math.min(Math.round(basic * 0.12), 21600);
  const professional_tax = 2400; // ₹200/month annual

  // Taxable income for TDS
  let tax = 0;

  if (regime === "new") {
    // New Regime FY 2025-26
    const std_deduction = 75000;
    const net_taxable = Math.max(0, gross_annual - pf_employee - professional_tax - std_deduction);
    // Rebate u/s 87A — nil tax upto ₹12L in new regime
    if (net_taxable <= 1200000) {
      tax = 0;
    } else if (net_taxable <= 1500000) {
      // Slab: compute properly
      let t = 0;
      if (net_taxable > 300000) t += Math.min(net_taxable - 300000, 300000) * 0.05;
      if (net_taxable > 600000) t += Math.min(net_taxable - 600000, 300000) * 0.10;
      if (net_taxable > 900000) t += Math.min(net_taxable - 900000, 300000) * 0.15;
      if (net_taxable > 1200000) t += Math.min(net_taxable - 1200000, 300000) * 0.20;
      tax = t;
    } else {
      let t = 0;
      if (net_taxable > 300000) t += Math.min(net_taxable - 300000, 300000) * 0.05;
      if (net_taxable > 600000) t += Math.min(net_taxable - 600000, 300000) * 0.10;
      if (net_taxable > 900000) t += Math.min(net_taxable - 900000, 300000) * 0.15;
      if (net_taxable > 1200000) t += Math.min(net_taxable - 1200000, 300000) * 0.20;
      if (net_taxable > 1500000) t += (net_taxable - 1500000) * 0.30;
      tax = t;
    }
  } else {
    // Old Regime
    const std_deduction = 50000;
    // HRA exemption: min of actual HRA, 50%/40% of basic, HRA - 10% of basic
    const hra_exempt = Math.max(0, Math.min(hra, city==="metro" ? basic*0.50 : basic*0.40, hra - basic*0.10));
    const section_80c = Math.min(pf_employee + 50000, 150000);
    const net_taxable = Math.max(0, gross_annual - pf_employee - professional_tax - std_deduction - hra_exempt - section_80c);
    if (net_taxable <= 250000) tax = 0;
    else if (net_taxable <= 500000) tax = (net_taxable - 250000) * 0.05;
    else if (net_taxable <= 1000000) tax = 12500 + (net_taxable - 500000) * 0.20;
    else tax = 112500 + (net_taxable - 1000000) * 0.30;
    // Rebate 87A for income upto 5L
    if (net_taxable <= 500000) tax = 0;
  }

  const cess = tax * 0.04;
  const total_tax = Math.round(tax + cess);
  const tds_monthly = Math.round(total_tax / 12);

  const monthly_basic = Math.round(basic / 12);
  const monthly_hra = Math.round(hra / 12);
  const monthly_special = Math.max(0, Math.round(special / 12));
  const monthly_lta = Math.round(lta / 12);
  const monthly_pf = Math.round(pf_employee / 12);
  const monthly_pt = Math.round(professional_tax / 12);

  // In-hand = earnings - deductions
  const inhand_monthly = monthly_basic + monthly_hra + monthly_special + monthly_lta - monthly_pf - monthly_pt - tds_monthly;
  const inhand_annual = inhand_monthly * 12;
  const deduction_pct = Math.round(((annual - inhand_annual) / annual) * 100);

  return {
    annual, gross_annual,
    monthly: {
      basic: monthly_basic,
      hra: monthly_hra,
      special: Math.max(0, monthly_special),
      lta: monthly_lta,
      pf: monthly_pf,
      pt: monthly_pt,
      tds: tds_monthly,
      inhand: Math.max(0, inhand_monthly),
    },
    employer_pf_monthly: Math.round(pf_employer / 12),
    gratuity_monthly: Math.round(gratuity / 12),
    deduction_pct: Math.max(0, deduction_pct),
    total_tax,
    pf_annual_total: (pf_employee + pf_employer),
  };
}

function fmt(n) {
  if (n >= 100000) return "₹" + (n/100000).toFixed(1) + "L";
  if (n >= 1000) return "₹" + Math.round(n/1000) + "K";
  return "₹" + n;
}
function fmtFull(n) {
  return "₹" + n.toLocaleString("en-IN");
}

export default function SalaryCalculator({ onClose, onStartChat, user, onShowAuth }) {
  const [ctc, setCtc] = useState("");
  const [city, setCity] = useState("metro");
  const [regime, setRegime] = useState("new");
  const [result, setResult] = useState(null);
  const [calculated, setCalculated] = useState(false);
  const resultRef = useRef(null);

  const calculate = () => {
    const r = calcSalary(ctc, city, regime);
    if (!r) return;
    setResult(r);
    setCalculated(true);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const share = () => {
    if (!result) return;
    const text = `My CTC is ₹${ctc} LPA but my actual in-hand salary is ${fmt(result.monthly.inhand)}/month 😮\n\nCheck yours at hikezo.in`;
    if (navigator.share) {
      navigator.share({ title: "My Salary Breakdown", text });
    } else {
      navigator.clipboard.writeText(text);
      alert("Copied to clipboard! Share it on WhatsApp 🚀");
    }
  };

  const handleChat = () => {
    onClose && onClose();
    if (!user) { onShowAuth && onShowAuth(); }
    else { onStartChat && onStartChat(); }
  };

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose && onClose(); }}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"flex-start", justifyContent:"center", zIndex:500, padding:"1rem", overflowY:"auto" }}>
      <div style={{ background:"#f8fafc", borderRadius:"18px", width:"100%", maxWidth:"640px", padding:"1.8rem", marginTop:"1rem", marginBottom:"2rem", position:"relative" }}>

        <button onClick={onClose} style={{ position:"absolute", top:"1rem", right:"1rem", background:"rgba(0,0,0,0.06)", border:"none", borderRadius:"8px", width:30, height:30, cursor:"pointer", fontSize:"1rem", color:"#64748b" }}>✕</button>

        {/* Header */}
        <div style={{ marginBottom:"1.5rem" }}>
          <div style={{ background:"rgba(14,165,233,0.1)", color:"#0ea5e9", fontSize:"0.65rem", fontWeight:700, letterSpacing:"0.1em", padding:"3px 10px", borderRadius:"4px", fontFamily:"'Inter',sans-serif", display:"inline-block", marginBottom:"0.5rem" }}>SALARY CALCULATOR</div>
          <h2 style={{ fontFamily:"'Inter',sans-serif", fontSize:"1.4rem", fontWeight:800, color:"#0f172a", margin:"0 0 0.25rem", letterSpacing:"-0.02em" }}>What's your actual in-hand salary?</h2>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.82rem", color:"#64748b", margin:0 }}>Enter your CTC — see exactly how much you take home every month.</p>
        </div>

        {/* Input section */}
        <div style={{ background:"#fff", borderRadius:"14px", padding:"1.4rem", border:"1px solid #e2e8f0", marginBottom:"1.2rem" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"1rem" }}>
            {/* CTC */}
            <div style={{ gridColumn:"1/-1" }}>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.72rem", fontWeight:600, color:"#64748b", marginBottom:"5px", letterSpacing:"0.04em", textTransform:"uppercase" }}>Your CTC</div>
              <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
                <span style={{ position:"absolute", left:"12px", fontFamily:"'Inter',sans-serif", fontSize:"0.85rem", color:"#64748b" }}>₹</span>
                <input type="number" value={ctc} onChange={e => {
                  const val = parseFloat(e.target.value);
                  if (e.target.value === "" || (val > 0 && val <= 500)) setCtc(e.target.value);
                }} placeholder="e.g. 8"
                  onKeyDown={e => e.key === "Enter" && calculate()}
                  min="1" max="500" step="0.5"
                  style={{ width:"100%", padding:"11px 80px 11px 28px", borderRadius:"8px", border:"1.5px solid #e2e8f0", background:"#f8fafc", color:"#0f172a", fontFamily:"'Inter',sans-serif", fontSize:"1.1rem", fontWeight:700, outline:"none", boxSizing:"border-box" }}
                  onFocus={e => e.target.style.borderColor="#0ea5e9"} onBlur={e => e.target.style.borderColor="#e2e8f0"}/>
                <span style={{ position:"absolute", right:"12px", fontFamily:"'Inter',sans-serif", fontSize:"0.82rem", color:"#94a3b8", fontWeight:600 }}>LPA</span>
              </div>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.68rem", color:"#94a3b8", marginTop:"4px" }}>Enter in Lakhs Per Annum — e.g. type "8" for ₹8 LPA (₹8,00,000/year). Max 500 LPA.</div>
            </div>

            {/* City */}
            <div>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.72rem", fontWeight:600, color:"#64748b", marginBottom:"5px", letterSpacing:"0.04em", textTransform:"uppercase" }}>City</div>
              <select value={city} onChange={e => setCity(e.target.value)}
                style={{ width:"100%", padding:"9px 10px", borderRadius:"8px", border:"1px solid #e2e8f0", background:"#f8fafc", color:"#0f172a", fontFamily:"'Inter',sans-serif", fontSize:"0.85rem", outline:"none" }}>
                <option value="metro">Metro (Delhi/Mumbai/Bengaluru)</option>
                <option value="nonmetro">Non-Metro</option>
              </select>
            </div>

            {/* Tax Regime */}
            <div style={{ gridColumn:"span 2" }}>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.72rem", fontWeight:600, color:"#64748b", marginBottom:"5px", letterSpacing:"0.04em", textTransform:"uppercase" }}>Tax Regime</div>
              <div style={{ display:"flex", gap:"0.5rem" }}>
                {[["new","New Regime (Default)"],["old","Old Regime"]].map(([v,l]) => (
                  <button key={v} onClick={() => setRegime(v)}
                    style={{ flex:1, padding:"9px 10px", borderRadius:"8px", border:`1.5px solid ${regime===v?"#0ea5e9":"#e2e8f0"}`, background: regime===v?"rgba(14,165,233,0.08)":"#f8fafc", color: regime===v?"#0ea5e9":"#64748b", cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:"0.8rem", fontWeight: regime===v?700:500, transition:"all .2s" }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={calculate} disabled={!ctc}
            style={{ width:"100%", marginTop:"1rem", padding:"12px", borderRadius:"8px", background: ctc ? "linear-gradient(135deg,#0ea5e9,#6366f1)" : "#e2e8f0", border:"none", color: ctc ? "#fff" : "#94a3b8", cursor: ctc ? "pointer" : "not-allowed", fontFamily:"'Inter',sans-serif", fontSize:"0.92rem", fontWeight:700, transition:"all .2s" }}>
            Calculate My In-Hand Salary →
          </button>
        </div>

        {/* Result */}
        {result && (
          <div ref={resultRef}>
            {/* Big number */}
            <div style={{ background:"linear-gradient(135deg,#020817,#0a1628)", borderRadius:"14px", padding:"1.6rem", marginBottom:"1rem", textAlign:"center", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:"-30px", right:"-30px", width:"120px", height:"120px", borderRadius:"50%", background:"rgba(14,165,233,0.08)" }}/>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.72rem", fontWeight:600, color:"#64748b", letterSpacing:"0.1em", marginBottom:"0.4rem" }}>YOUR ACTUAL IN-HAND SALARY</div>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"3rem", fontWeight:800, background:"linear-gradient(135deg,#0ea5e9,#6366f1)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", lineHeight:1.1 }}>
                {fmtFull(result.monthly.inhand)}
              </div>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.85rem", color:"#64748b", marginTop:"0.3rem" }}>per month</div>
              <div style={{ marginTop:"0.8rem", display:"inline-block", background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:"6px", padding:"4px 12px" }}>
                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.78rem", color:"#fca5a5" }}>
                  {result.deduction_pct}% of your CTC is deducted before you get paid
                </span>
              </div>
            </div>

            {/* Breakdown */}
            <div style={{ background:"#fff", borderRadius:"14px", padding:"1.4rem", border:"1px solid #e2e8f0", marginBottom:"1rem" }}>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.8rem", fontWeight:700, color:"#0f172a", marginBottom:"1rem" }}>Monthly Breakdown</div>

              {/* Earnings */}
              <div style={{ marginBottom:"0.8rem" }}>
                <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.68rem", fontWeight:700, color:"#10b981", letterSpacing:"0.08em", marginBottom:"0.4rem" }}>EARNINGS ✓</div>
                {[
                  ["Basic Salary", result.monthly.basic, "Core salary — forms basis of PF, gratuity"],
                  ["HRA", result.monthly.hra, city==="metro"?"50% of basic (metro city)":"40% of basic (non-metro)"],
                  ["Special Allowance", result.monthly.special, "Flexible component — fully taxable"],
                  ["LTA", result.monthly.lta, "Leave Travel Allowance — tax exempt on actual travel"],
                ].map(([label, val, tip]) => (
                  <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:"1px solid #f8fafc" }}>
                    <div>
                      <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.82rem", color:"#374151", fontWeight:500 }}>{label}</div>
                      <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.68rem", color:"#94a3b8" }}>{tip}</div>
                    </div>
                    <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", fontWeight:700, color:"#10b981" }}>+{fmtFull(val)}</div>
                  </div>
                ))}
              </div>

              {/* Deductions */}
              <div style={{ marginBottom:"0.8rem" }}>
                <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.68rem", fontWeight:700, color:"#ef4444", letterSpacing:"0.08em", marginBottom:"0.4rem" }}>DEDUCTIONS ✗</div>
                {[
                  ["PF (Your Contribution)", result.monthly.pf, "12% of basic — goes to your PF account (yours!)"],
                  ["Professional Tax", result.monthly.pt, "State government tax — varies by state"],
                  ["TDS (Income Tax)", result.monthly.tds, `${regime==="new"?"New":"Old"} tax regime — deducted at source`],
                ].map(([label, val, tip]) => (
                  <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:"1px solid #f8fafc" }}>
                    <div>
                      <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.82rem", color:"#374151", fontWeight:500 }}>{label}</div>
                      <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.68rem", color:"#94a3b8" }}>{tip}</div>
                    </div>
                    <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", fontWeight:700, color:"#ef4444" }}>-{fmtFull(val)}</div>
                  </div>
                ))}
              </div>

              {/* Hidden employer costs */}
              <div style={{ background:"#f8fafc", borderRadius:"8px", padding:"0.8rem" }}>
                <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.68rem", fontWeight:700, color:"#64748b", letterSpacing:"0.08em", marginBottom:"0.4rem" }}>EMPLOYER PAYS (part of your CTC but you don't see it)</div>
                {[
                  ["PF (Employer)", result.employer_pf_monthly, "Goes to your PF — withdraw after exit"],
                  ["Gratuity", result.gratuity_monthly, "Paid after 5 years of service"],
                ].map(([label, val, tip]) => (
                  <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 0" }}>
                    <div>
                      <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.78rem", color:"#374151", fontWeight:500 }}>{label}</div>
                      <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.65rem", color:"#94a3b8" }}>{tip}</div>
                    </div>
                    <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.82rem", fontWeight:600, color:"#64748b" }}>{fmtFull(val)}/mo</div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"1rem", paddingTop:"0.8rem", borderTop:"2px solid #f1f5f9" }}>
                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", fontWeight:700, color:"#0f172a" }}>In-Hand (Monthly)</span>
                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"1.1rem", fontWeight:800, color:"#0ea5e9" }}>{fmtFull(result.monthly.inhand)}</span>
              </div>
            </div>

            {/* Quick stats */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0.6rem", marginBottom:"1rem" }}>
              {[
                ["Annual In-Hand", fmtFull(result.monthly.inhand * 12), "#10b981"],
                ["Annual Tax", fmtFull(result.total_tax), "#ef4444"],
                ["Annual PF Saved", fmtFull(result.pf_annual_total), "#6366f1"],
              ].map(([label, val, color]) => (
                <div key={label} style={{ background:"#fff", borderRadius:"10px", padding:"0.9rem", border:"1px solid #e2e8f0", textAlign:"center" }}>
                  <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"1rem", fontWeight:800, color }}>{val}</div>
                  <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.65rem", color:"#64748b", marginTop:"2px" }}>{label}</div>
                </div>
              ))}
            </div>

            {/* CTA section */}
            <div style={{ background:"linear-gradient(135deg,#020817,#0a1628)", borderRadius:"14px", padding:"1.4rem" }}>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.85rem", fontWeight:700, color:"#f1f5f9", marginBottom:"0.3rem" }}>
                Is your salary fair? 🤔
              </div>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.78rem", color:"#64748b", marginBottom:"1rem", lineHeight:1.6 }}>
                Talk to a hikezo consultant — find out your market value and how to negotiate a better package.
              </div>
              <div style={{ display:"flex", gap:"0.7rem", flexWrap:"wrap" }}>
                <button onClick={handleChat}
                  style={{ padding:"10px 20px", borderRadius:"8px", background:"linear-gradient(135deg,#0ea5e9,#6366f1)", border:"none", color:"#fff", cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:"0.85rem", fontWeight:700 }}>
                  Talk to Consultant — Free →
                </button>
                <button onClick={share}
                  style={{ padding:"10px 18px", borderRadius:"8px", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", color:"#94a3b8", cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:"0.82rem", fontWeight:500 }}>
                  📤 Share Result
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
