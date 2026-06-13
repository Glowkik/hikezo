import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile, sendEmailVerification } from "firebase/auth";

export default function Auth({ onAuth, t, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState("");

  // ESC key to close
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape" && onClose) onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      onAuth({ name: result.user.displayName, email: result.user.email });
    } catch (e) {
      setError("Google login failed. Please try again.");
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    setError("");
    setVerifyMsg("");
    if (!email || !password) { setError("Email and password are required!"); return; }
    if (!isLogin && !name) { setError("Name is required!"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters!"); return; }
    setLoading(true);
    try {
      if (isLogin) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        if (!result.user.emailVerified) {
          await auth.signOut();
          setError("Please verify your email first. Check your inbox for the verification link.");
          setLoading(false);
          return;
        }
        onAuth({ name: result.user.displayName || email, email: result.user.email });
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name });
        await sendEmailVerification(result.user);
        await auth.signOut();
        setVerifyMsg("Account created! Please check your email and verify before logging in.");
        setLoading(false);
        return;
      }
    } catch (e) {
      if (e.code === "auth/user-not-found") setError("No account found with this email!");
      else if (e.code === "auth/wrong-password") setError("Wrong password. Please try again!");
      else if (e.code === "auth/invalid-credential") setError("Wrong email or password!");
      else if (e.code === "auth/email-already-in-use") setError("This email is already registered!");
      else if (e.code === "auth/invalid-email") setError("Please enter a valid email address!");
      else if (e.code === "auth/too-many-requests") setError("Too many attempts. Please wait a few minutes.");
      else setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose && onClose()}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:"1rem" }}
    >
      <div style={{ position:"relative", background:"#0f1729", border:"1px solid rgba(255,255,255,0.1)", borderRadius:16, padding:32, width:"100%", maxWidth:400 }}>

        {/* Close button */}
        <button
          onClick={() => onClose && onClose()}
          style={{ position:"absolute", top:12, right:12, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"#94a3b8", cursor:"pointer", width:30, height:30, borderRadius:"6px", fontSize:"1rem", display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1 }}
        >&#x2715;</button>

        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:800, fontSize:"1.5rem", color:"#f1f5f9" }}>
            hike<span style={{ background:"linear-gradient(135deg,#0ea5e9,#6366f1)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>zo</span>
          </span>
        </div>

        <h2 style={{ color:"#fff", marginBottom:6, fontSize:"1.3rem", fontFamily:"'Inter',sans-serif", fontWeight:700 }}>
          {isLogin ? "Welcome Back" : "Create Free Account"}
        </h2>
        <p style={{ color:"#64748b", marginBottom:24, fontSize:"0.88rem", fontFamily:"'Inter',sans-serif" }}>
          {isLogin ? "Login to continue your career journey" : "Free - No credit card needed"}
        </p>

        {/* Google Button */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{ width:"100%", padding:"11px", borderRadius:8, border:"1px solid rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.04)", color:"#f1f5f9", cursor:"pointer", marginBottom:16, fontSize:"0.9rem", fontFamily:"'Inter',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}
        >
          <img src="https://www.google.com/favicon.ico" style={{ width:16, height:16 }} alt="Google" />
          Continue with Google
        </button>

        {/* Divider */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
          <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.08)" }}/>
          <span style={{ color:"#475569", fontSize:"0.8rem", fontFamily:"'Inter',sans-serif" }}>or</span>
          <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.08)" }}/>
        </div>

        {/* Name field signup only */}
        {!isLogin && (
          <input
            placeholder="Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ width:"100%", padding:12, borderRadius:8, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.05)", color:"#fff", marginBottom:12, boxSizing:"border-box", fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", outline:"none" }}
          />
        )}

        <input
          placeholder="Email Address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          style={{ width:"100%", padding:12, borderRadius:8, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.05)", color:"#fff", marginBottom:12, boxSizing:"border-box", fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", outline:"none" }}
        />

        <input
          placeholder="Password (min 6 characters)"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          style={{ width:"100%", padding:12, borderRadius:8, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.05)", color:"#fff", marginBottom:12, boxSizing:"border-box", fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", outline:"none" }}
        />

        {/* Error */}
        {error && (
          <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:8, padding:"10px 12px", marginBottom:12 }}>
            <p style={{ color:"#fca5a5", fontSize:"0.83rem", fontFamily:"'Inter',sans-serif", margin:0 }}>{error}</p>
          </div>
        )}

        {/* Verify success */}
        {verifyMsg && (
          <div style={{ background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:8, padding:"10px 12px", marginBottom:12 }}>
            <p style={{ color:"#6ee7b7", fontSize:"0.83rem", fontFamily:"'Inter',sans-serif", margin:0 }}>&#10003; {verifyMsg}</p>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width:"100%", padding:12, borderRadius:8, background:"linear-gradient(135deg,#0ea5e9,#6366f1)", color:"#fff", border:"none", cursor:loading ? "not-allowed" : "pointer", fontSize:"0.95rem", fontWeight:600, fontFamily:"'Inter',sans-serif", opacity:loading ? 0.7 : 1 }}
        >
          {loading ? "Please wait..." : isLogin ? "Login & Continue \u2192" : "Create Account & Start \u2192"}
        </button>

        {/* Switch */}
        <p style={{ color:"#64748b", textAlign:"center", marginTop:16, fontSize:"0.85rem", fontFamily:"'Inter',sans-serif" }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => { setIsLogin(!isLogin); setError(""); setVerifyMsg(""); }} style={{ color:"#0ea5e9", cursor:"pointer", fontWeight:600 }}>
            {isLogin ? "Sign Up Free" : "Login"}
          </span>
        </p>

        <p style={{ color:"#1e293b", textAlign:"center", marginTop:10, fontSize:"0.72rem", fontFamily:"'Inter',sans-serif" }}>
          Your data is secure. We never spam or sell your information.
        </p>

      </div>
    </div>
  );
}
