import { useState } from "react";
import { auth } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from "firebase/auth";

export default function Auth({ onAuth, t }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      onAuth({ name: result.user.displayName, email: result.user.email });
    } catch (e) {
      setError("Google login failed. Try again.");
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) { setError("Email and password are required!"); return; }
    if (!isLogin && !name) { setError("Name is required!"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters!"); return; }
    setLoading(true);
    try {
      if (isLogin) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        onAuth({ name: result.user.displayName || email, email: result.user.email });
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name });
        await result.user.sendEmailVerification(); await result.user.sendEmailVerification(); onAuth({ name, email: result.user.email });
      }
    } catch (e) {
      if (e.code === "auth/user-not-found") setError("Email not registered!");
      else if (e.code === "auth/wrong-password") setError("Wrong password!");
      else if (e.code === "auth/email-already-in-use") setError("Email already registered!");
      else if (e.code === "auth/invalid-email") setError("Invalid email format!");
      else setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
      <div style={{ background:"#0f1729", border:"1px solid rgba(255,255,255,0.1)", borderRadius:16, padding:32, width:"100%", maxWidth:400 }}>
        <h2 style={{ color:"#fff", marginBottom:8, fontSize:"1.4rem" }}>{isLogin ? "Welcome Back" : "Create Free Account"}</h2>
        <p style={{ color:"#64748b", marginBottom:24, fontSize:"0.9rem" }}>{isLogin ? "Login to continue" : "Free - No credit card needed"}</p>

        <button onClick={handleGoogle} disabled={loading} style={{ width:"100%", padding:"12px", borderRadius:8, border:"1px solid rgba(255,255,255,0.2)", background:"transparent", color:"#fff", cursor:"pointer", marginBottom:16, fontSize:"0.95rem" }}>
          <img src="https://www.google.com/favicon.ico" style={{width:18,height:18,marginRight:8,verticalAlign:"middle"}}/> Continue with Google
        </button>

        <div style={{ textAlign:"center", color:"#64748b", marginBottom:16 }}>— ya —</div>

        {!isLogin && <input placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)} style={{ width:"100%", padding:12, borderRadius:8, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.05)", color:"#fff", marginBottom:12, boxSizing:"border-box" }} />}
        
        <input placeholder="Email Address" value={email} onChange={e=>setEmail(e.target.value)} style={{ width:"100%", padding:12, borderRadius:8, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.05)", color:"#fff", marginBottom:12, boxSizing:"border-box" }} />
        
        <input placeholder="Password (min 6 chars)" type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{ width:"100%", padding:12, borderRadius:8, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.05)", color:"#fff", marginBottom:12, boxSizing:"border-box" }} />

        {error && <p style={{ color:"#ef4444", marginBottom:12, fontSize:"0.85rem" }}>{error}</p>}

        <button onClick={handleSubmit} disabled={loading} style={{ width:"100%", padding:12, borderRadius:8, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"#fff", border:"none", cursor:"pointer", fontSize:"1rem", fontWeight:600 }}>
          {loading ? "Please wait..." : isLogin ? "Login & Continue →" : "Create Account & Start →"}
        </button>

        <p style={{ color:"#64748b", textAlign:"center", marginTop:16, fontSize:"0.85rem" }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={()=>setIsLogin(!isLogin)} style={{ color:"#6366f1", cursor:"pointer" }}>
            {isLogin ? "Sign Up Free" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
}