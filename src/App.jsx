import { useState, useEffect, useRef } from "react";

function useBreakpoint() {
  const get = () => window.innerWidth < 640 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop";
  const [bp, setBp] = useState(get());
  useEffect(() => { const fn = () => setBp(get()); window.addEventListener("resize", fn); return () => window.removeEventListener("resize", fn); }, []);
  return { isMobile: bp === "mobile", isTablet: bp === "tablet", isDesktop: bp === "desktop" };
}

function useInView(ref, threshold = 0.1) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return v;
}

// Scroll progress for parallax
function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const fn = () => setY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return y;
}

// Animated number counter
function useCounter(target, duration = 1500, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target]);
  return val;
}
const FREE_LIMIT = 3;
function getLimitData() { try { const t = new Date().toDateString(), r = sessionStorage.getItem("hz_usage"); const d = r ? JSON.parse(r) : { date: t, count: 0, plan: "free" }; return d.date !== t ? { date: t, count: 0, plan: d.plan } : d; } catch { return { date: new Date().toDateString(), count: 0, plan: "free" }; } }
function saveLimitData(d) { try { sessionStorage.setItem("hz_usage", JSON.stringify(d)); } catch {} }

// -- SCROLL REVEAL + COUNTER ---------------------------------------------------
function SR({ children, cls="sr", delay=0, style={}, onMouseEnter, onMouseLeave }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => el.classList.add("in"), delay); obs.disconnect(); }
    }, { threshold: 0.08 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return <div ref={ref} className={cls} style={style} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>{children}</div>;
}

function AnimCounter({ to, suffix="", prefix="", start, dur=1400 }) {
  const val = useCounter(to, dur, start);
  return <>{prefix}{val >= 1000 ? (val/1000).toFixed(0)+"K" : val}{suffix}</>;
}
const CONSULTANTS = [
  { name: "Priya Sharma", role: "Senior Career Consultant", exp: "8 yrs - 2400+ sessions", emoji: "PS", specialty: "Salary Negotiation", color: "#0ea5e9", persona: "You are Priya Sharma, a warm Senior Career Consultant at Hikezo specializing in salary negotiation with 8 years helping Indian professionals." },
  { name: "Arjun Mehta", role: "Career Growth Specialist", exp: "6 yrs - 1800+ sessions", emoji: "AM", specialty: "Career Roadmap", color: "#8b5cf6", persona: "You are Arjun Mehta, an enthusiastic Career Growth Specialist at Hikezo with 6 years creating career roadmaps for Indian professionals." },
  { name: "Neha Gupta", role: "LinkedIn & Resume Expert", exp: "5 yrs - 1600+ sessions", emoji: "NG", specialty: "Resume & LinkedIn", color: "#ec4899", persona: "You are Neha Gupta, a creative LinkedIn and Resume Expert at Hikezo with 5 years transforming Indian professionals' career presence." },
  { name: "Rahul Verma", role: "Interview Coach", exp: "7 yrs - 2100+ sessions", emoji: "RV", specialty: "Interview Prep", color: "#f59e0b", persona: "You are Rahul Verma, a confident Interview Coach at Hikezo with 7 years preparing Indian professionals for top company interviews." },
];
function getRandConsultant() { return CONSULTANTS[Math.floor(Math.random() * CONSULTANTS.length)]; }

const T = {
  en: {
    nav: { features: "Features", pricing: "Pricing", cta: "Get Started" },
    hero: {
      badge: "India's #1 Career Growth Platform",
      h1a: "Accelerate Your", h1b: "Career Growth",
      sub: "Expert career consultants available 24/7 -- salary negotiation, career roadmaps, skills gap analysis, interview prep, and resume building. All in one place.",
      cta: "Talk to a Consultant", demo: "See How It Works",
      social: "professionals trust Hikezo",
    },
    how: { label: "PROCESS", title: "4 Steps to Career Transformation", sub: "Simple. Fast. Effective.", cta: "Get Started Free ->",
      steps: [
        { title: "Create Account", desc: "Sign up free in 30 seconds. No credit card needed." },
        { title: "Meet Your Consultant", desc: "Get matched with a specialized career expert instantly." },
        { title: "Get Your Strategy", desc: "Receive a personalized negotiation script & career plan." },
        { title: "Land the Hike", desc: "Execute your strategy and claim the salary you deserve." },
      ]
    },
    features: { label: "WHAT WE OFFER", title: "Everything You Need to Grow",
      items: [
        { title: "Salary Negotiation", desc: "Word-for-word scripts tailored to your role, company, and experience level." },
        { title: "Career Roadmap", desc: "A 6-12 month plan covering skills, milestones, and job switch timing." },
        { title: "Skills Gap Analysis", desc: "Pinpoint exactly what's holding you back and how to bridge the gap fast." },
        { title: "Resume Overhaul", desc: "Transform bullet points into achievement statements that get callbacks." },
        { title: "Interview Coaching", desc: "Role-specific Q&A with STAR-format answers and live feedback." },
        { title: "Salary Benchmarking", desc: "Real market data from India's top companies -- by role, city, and experience." },
      ]
    },
    testi: { label: "SUCCESS STORIES", title: "Real Results from Real Professionals",
      items: [
        { name: "Rahul Sharma", role: "Software Engineer, Bengaluru", text: "Got a 40% hike using Hikezo's negotiation script. But the career roadmap was equally valuable -- I finally knew exactly where I was headed in the next 2 years.", av: "RS" },
        { name: "Priya Menon", role: "Product Manager, Mumbai", text: "The skills gap analysis was eye-opening. I was missing 3 key competencies for a senior role. Followed the roadmap, built those skills, and got promoted in 5 months.", av: "PM" },
        { name: "Arjun Kapoor", role: "Data Analyst, Hyderabad", text: "Interview prep was a game changer -- role-specific questions with STAR format answers. Went from nervous to confident. Got 2 competing offers in 3 weeks.", av: "AK" },
      ]
    },
    pricing: { label: "PRICING", title: "Simple, Transparent Pricing", sub: "No hidden charges. Billed monthly.",
      plans: [
        { name: "Free", price: "₹0", period: "forever", features: ["3 consultations/day", "Basic salary range", "General career advice"], bonuses: [], cta: "Start Free", highlight: false },
        { name: "Pro", price: "₹399", originalPrice: "₹649", discount: "38% OFF", period: "per month", features: ["Unlimited consultations", "Salary negotiation script", "Skills gap analysis", "6/12-month career roadmap", "Resume review", "Interview prep Q&A"], bonuses: ["Free Resume Template", "Salary Negotiation PDF Guide", "LinkedIn Profile Checklist"], cta: "Start Pro", highlight: true },
        { name: "Elite", price: "₹799", originalPrice: "₹1,299", discount: "38% OFF", period: "per month", features: ["Everything in Pro", "Mock interview sessions", "LinkedIn profile review", "Priority access", "Weekly progress reports"], bonuses: ["Free Resume Template", "Salary Negotiation PDF Guide", "LinkedIn Profile Checklist", "Top 50 Interview Questions PDF", "30-Day Career Acceleration Plan"], cta: "Start Elite", highlight: false },
      ]
    },
    faq: { title: "Frequently Asked Questions",
      items: [
        { q: "Who are Hikezo's consultants?", a: "Experienced career professionals with backgrounds in HR, recruitment, and coaching -- all specialized for India's job market." },
        { q: "How does billing work?", a: "Plans are billed monthly and renew automatically. You can manage your subscription from account settings." },
        { q: "How soon will I see results?", a: "Most users get a clear action plan and negotiation strategy in their very first session." },
        { q: "Is my data safe?", a: "All conversations are encrypted with 256-bit SSL. We never share or sell your personal data." },
        { q: "What's the difference between Pro and Elite?", a: "Pro covers all core tools. Elite adds mock interviews, LinkedIn review, priority access, and weekly progress reports." },
        { q: "Is this relevant for the Indian market?", a: "Yes -- built specifically for Indian professionals with India-specific salary data, company context, and negotiation culture." },
        { q: "Is payment secure?", a: "All payments are processed through Razorpay -- India's most trusted payment gateway." },
      ]
    },
    cta: { title: "Ready to Take Your Career to the Next Level?", sub: "Join 10,000+ Indian professionals who've already transformed their careers.", btn: "Talk to a Consultant -- Free ->" },
    footer: "(c) 2025 Hikezo.in -- India's Career Growth Platform",
    auth: { signupTitle: "Create Free Account", loginTitle: "Welcome Back", signupSub: "Free - No credit card needed", loginSub: "Login to continue your career journey", namePh: "Full Name", emailPh: "Email Address", mobilePh: "Mobile Number (10 digits)", passPh: "Password (min 6 chars)", signupBtn: "Create Account & Start ->", loginBtn: "Login & Continue ->", thinking: "Please wait...", toLogin: "Already have an account?", toSignup: "Don't have an account?", loginLink: "Login", signupLink: "Sign Up Free", privacy: "[Secure] Your data is secure. We never spam or sell your information.", success: "Opening your consultation..." },
    chat: { thinking: " is typing...", inputPh: "Type your message...", badge: "AI-Assisted", upgrade: "Upgrade ->", freeLeft: (n) => `${n} free message${n !== 1 ? "s" : ""} remaining today`, upgradeTitle: "Free Limit Reached", upgradeSub: `You've used all ${FREE_LIMIT} free messages for today. Upgrade for unlimited access.`, upgradeBtn: "Upgrade Now ->", later: "Maybe later" },
    connect: { title: "Finding Your Consultant...", steps: (name) => ["Checking consultant availability...", "Matching you with the best fit...", `${name} is ready for you!`] },
  },
  hi: {
    nav: { features: "फीचर्स", pricing: "प्राइसिंग", cta: "शुरू करो" },
    hero: {
      badge: "India का #1 Career Growth Platform",
      h1a: "अपना Career", h1b: "Accelerate करो",
      sub: "Expert career consultants 24/7 available -- salary negotiation, career roadmap, skills gap analysis, interview prep, aur resume building. Sab ek jagah.",
      cta: "Consultant से बात करो", demo: "कैसे काम करता है देखो",
      social: "professionals ने Hikezo trust किया",
    },
    how: { label: "PROCESS", title: "4 Steps में Career Transform करो", sub: "Simple. Fast. Effective.", cta: "Free में शुरू करो ->",
      steps: [
        { title: "Account बनाओ", desc: "30 seconds में free signup -- कोई credit card नहीं।" },
        { title: "Consultant से मिलो", desc: "Specialist career expert से instantly match हो जाओ।" },
        { title: "Strategy पाओ", desc: "Personalized negotiation script और career plan मिलेगा।" },
        { title: "Hike लो", desc: "Strategy use करो और deserve की salary claim करो।" },
      ]
    },
    features: { label: "हम क्या देते हैं", title: "Grow करने के लिए सब कुछ",
      items: [
        { title: "Salary Negotiation", desc: "आपकी role, company और experience के हिसाब से word-for-word script।" },
        { title: "Career Roadmap", desc: "6-12 month plan -- skills, milestones और job switch timing सब clear।" },
        { title: "Skills Gap Analysis", desc: "Exactly पता करो क्या रोक रहा है और fast fix कैसे करें।" },
        { title: "Resume Overhaul", desc: "Bullet points को achievement statements में convert करो जो callbacks दिलाएं।" },
        { title: "Interview Coaching", desc: "Role-specific Q&A with STAR answers और live feedback।" },
        { title: "Salary Benchmarking", desc: "India की top companies की real market data -- role, city और experience के हिसाब से।" },
      ]
    },
    testi: { label: "सक्सेस स्टोरीज़", title: "Real Professionals के Real Results",
      items: [
        { name: "राहुल शर्मा", role: "Software Engineer, बेंगलुरु", text: "Priya की negotiation script से 40% hike मिला। इतना straightforward होगा यह नहीं सोचा था।", av: "RS" },
        { name: "प्रिया मेनन", role: "Product Manager, मुंबई", text: "पहले session में career roadmap crystal clear हो गया। अगला step exactly पता चल गया।", av: "PM" },
        { name: "अर्जुन कपूर", role: "Data Analyst, हैदराबाद", text: "आखिरकार market value समझ आई। Plan follow करके 3 हफ्ते में 2 competing offers मिले।", av: "AK" },
      ]
    },
    pricing: { label: "प्राइसिंग", title: "Simple, Transparent Pricing", sub: "कोई hidden charges नहीं। Monthly billing।",
      plans: [
        { name: "फ्री", price: "₹0", period: "हमेशा के लिए", features: ["3 consultations/दिन", "Basic salary range", "General career advice"], bonuses: [], cta: "Free शुरू करो", highlight: false },
        { name: "प्रो", price: "₹399", originalPrice: "₹649", discount: "38% OFF", period: "प्रति महीना", features: ["Unlimited consultations", "Salary negotiation script", "Skills gap analysis", "6/12-month career roadmap", "Resume review", "Interview prep Q&A"], bonuses: ["Free Resume Template", "Salary Negotiation PDF Guide", "LinkedIn Profile Checklist"], cta: "Pro शुरू करो", highlight: true },
        { name: "एलीट", price: "₹799", originalPrice: "₹1,299", discount: "38% OFF", period: "प्रति महीना", features: ["Pro सब कुछ", "Mock interview sessions", "LinkedIn profile review", "Priority access", "Weekly progress reports"], bonuses: ["Free Resume Template", "Salary Negotiation PDF Guide", "LinkedIn Profile Checklist", "Top 50 Interview Questions PDF", "30-Day Career Acceleration Plan"], cta: "Elite शुरू करो", highlight: false },
      ]
    },
    faq: { title: "अक्सर पूछे जाने वाले सवाल",
      items: [
        { q: "Hikezo के consultants कौन हैं?", a: "Experienced career professionals -- HR, recruitment और coaching background के साथ, Indian job market के लिए specially trained।" },
        { q: "Billing कैसे काम करती है?", a: "Plans monthly bill होते हैं और automatically renew होते हैं। Account settings से subscription manage करें।" },
        { q: "Result कब आएगा?", a: "ज़्यादातर users को पहले session में ही clear action plan और negotiation strategy मिल जाती है।" },
        { q: "क्या मेरा data safe है?", a: "सभी conversations 256-bit SSL से encrypted हैं। हम कभी personal data share या sell नहीं करते।" },
        { q: "Pro और Elite में क्या फर्क है?", a: "Pro में सभी core tools। Elite में mock interviews, LinkedIn review, priority access और weekly reports भी।" },
        { q: "क्या यह Indian market के लिए relevant है?", a: "हां -- specifically Indian professionals के लिए बना है -- Indian salary data, company context और negotiation culture के साथ।" },
        { q: "Payment secure है?", a: "सभी payments Razorpay के through -- India का सबसे trusted payment gateway।" },
      ]
    },
    cta: { title: "Career को Next Level पर ले जाने के लिए Ready हो?", sub: "10,000+ Indian professionals पहले से अपना career transform कर चुके हैं।", btn: "Consultant से बात करो -- Free ->" },
    footer: "(c) 2025 Hikezo.in -- India's Career Growth Platform",
    auth: { signupTitle: "Free Account बनाओ", loginTitle: "Welcome Back", signupSub: "Free - कोई credit card नहीं", loginSub: "अपना career journey continue करो", namePh: "पूरा नाम", emailPh: "Email Address", mobilePh: "Mobile Number (10 digits)", passPh: "Password (min 6 chars)", signupBtn: "Account बनाओ और शुरू करो ->", loginBtn: "Login करो ->", thinking: "Please wait...", toLogin: "Already account है?", toSignup: "Account नहीं है?", loginLink: "Login", signupLink: "Free Sign Up", privacy: "[Secure] आपका data secure है। हम कभी spam या sell नहीं करते।", success: "Consultation open हो रहा है..." },
    chat: { thinking: " type कर रहे हैं...", inputPh: "अपना message लिखो...", badge: "AI-Assisted", upgrade: "Upgrade ->", freeLeft: (n) => `${n} free message${n !== 1 ? "s" : ""} बचे आज के लिए`, upgradeTitle: "Free Limit पूरी हो गई", upgradeSub: `आपने आज के ${FREE_LIMIT} free messages use कर लिए हैं।`, upgradeBtn: "Upgrade करो ->", later: "बाद में" },
    connect: { title: "आपका Consultant ढूंढ रहे हैं...", steps: (name) => ["Consultant availability check हो रही है...", "आपके लिए best match ढूंढा जा रहा है...", `${name} आपके लिए तैयार हैं!`] },
  }
};

// SVG Icons
const Icon = {
  salary: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  map: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  search: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  doc: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>,
  user: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>,
  chart: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  check: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="rgba(16,185,129,0.15)"/><path d="M4 7l2 2 4-4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  wasvg: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
  lisvg: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  igsvg: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
  ytsvg: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>,
};
const FEAT_ICONS = [Icon.salary, Icon.map, Icon.search, Icon.doc, Icon.user, Icon.chart];

// -- CUSTOM CURSOR -------------------------------------------------------------
function CustomCursor() {
  const cursorRef = useRef(null);
  const glowRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const glowPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX - 6}px, ${e.clientY - 6}px)`;
      }
    };

    let rafId;
    const animateGlow = () => {
      glowPos.current.x += (pos.current.x - glowPos.current.x) * 0.08;
      glowPos.current.y += (pos.current.y - glowPos.current.y) * 0.08;
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${glowPos.current.x - 200}px, ${glowPos.current.y - 200}px)`;
      }
      rafId = requestAnimationFrame(animateGlow);
    };
    rafId = requestAnimationFrame(animateGlow);

    const mouseDown = () => {
      if (cursorRef.current) { cursorRef.current.style.transform += " scale(0.7)"; cursorRef.current.style.opacity = "1"; }
    };
    const mouseUp = () => {
      if (cursorRef.current) cursorRef.current.style.opacity = "0.85";
    };
    const mouseEnterBtn = (e) => {
      if (e.target.tagName === "BUTTON" || e.target.tagName === "A" || e.target.closest("button") || e.target.closest("a")) {
        if (cursorRef.current) { cursorRef.current.style.width = "40px"; cursorRef.current.style.height = "40px"; cursorRef.current.style.border = "2px solid rgba(14,165,233,0.8)"; cursorRef.current.style.background = "rgba(14,165,233,0.1)"; }
      }
    };
    const mouseLeaveBtn = () => {
      if (cursorRef.current) { cursorRef.current.style.width = "12px"; cursorRef.current.style.height = "12px"; cursorRef.current.style.border = "2px solid rgba(14,165,233,0.9)"; cursorRef.current.style.background = "rgba(14,165,233,0.3)"; }
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mousemove", mouseEnterBtn);
    window.addEventListener("mousedown", mouseDown);
    window.addEventListener("mouseup", mouseUp);
    document.addEventListener("mouseleave", mouseLeaveBtn);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousemove", mouseEnterBtn);
      window.removeEventListener("mousedown", mouseDown);
      window.removeEventListener("mouseup", mouseUp);
      document.removeEventListener("mouseleave", mouseLeaveBtn);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Only show on desktop
  if (typeof window !== "undefined" && window.innerWidth < 768) return null;

  return (
    <>
      {/* Small dot cursor */}
      <div ref={cursorRef} style={{
        position: "fixed", top: 0, left: 0, zIndex: 9999,
        width: "12px", height: "12px", borderRadius: "50%",
        background: "rgba(14,165,233,0.3)",
        border: "2px solid rgba(14,165,233,0.9)",
        pointerEvents: "none",
        transition: "width .2s ease, height .2s ease, background .2s ease, border .2s ease",
        willChange: "transform",
      }} />
      {/* Large glow trail */}
      <div ref={glowRef} style={{
        position: "fixed", top: 0, left: 0, zIndex: 9998,
        width: "400px", height: "400px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(14,165,233,0.06) 0%, rgba(99,102,241,0.03) 40%, transparent 70%)",
        pointerEvents: "none",
        willChange: "transform",
      }} />
    </>
  );
}
function UpgradePopup({ onClose, onUpgrade, tc }) {
  return (
    <div style={{ position:"absolute",inset:0,zIndex:10,background:"rgba(15,23,42,0.97)",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"20px",padding:"2rem",animation:"fadeIn .3s ease" }}>
      <div style={{ textAlign:"center",maxWidth:"300px",width:"100%" }}>
        <div style={{ width:56,height:56,borderRadius:"16px",background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.2)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1.2rem" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <h3 style={{ fontFamily:"'Inter',sans-serif",color:"#f1f5f9",fontWeight:700,fontSize:"1.15rem",marginBottom:"0.5rem" }}>{tc.upgradeTitle}</h3>
        <p style={{ fontFamily:"'Inter',sans-serif",color:"#64748b",fontSize:"0.85rem",lineHeight:1.6,marginBottom:"1.5rem" }}>{tc.upgradeSub}</p>
        {[{n:"Pro",p:"₹399/mo",h:true},{n:"Elite",p:"₹799/mo",h:false}].map(pl=>(
          <div key={pl.n} onClick={onUpgrade} style={{ padding:"0.85rem 1rem",marginBottom:"0.6rem",background:pl.h?"rgba(16,185,129,0.06)":"rgba(255,255,255,0.03)",border:`1px solid ${pl.h?"rgba(16,185,129,0.25)":"rgba(255,255,255,0.08)"}`,borderRadius:"10px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",transition:"all .2s" }}
            onMouseEnter={e=>e.currentTarget.style.transform="scale(1.02)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
            <span style={{ fontFamily:"'Inter',sans-serif",color:"#f1f5f9",fontWeight:600,fontSize:"0.9rem" }}>{pl.n}</span>
            <span style={{ fontFamily:"'Inter',sans-serif",color:"#10b981",fontWeight:700 }}>{pl.p}</span>
          </div>
        ))}
        <button onClick={onUpgrade} style={{ width:"100%",padding:"12px",background:"linear-gradient(135deg,#10b981,#0ea5e9)",border:"none",borderRadius:"10px",color:"#fff",fontWeight:700,fontSize:"0.9rem",cursor:"pointer",fontFamily:"'Inter',sans-serif",marginTop:"0.5rem",marginBottom:"0.6rem" }}>{tc.upgradeBtn}</button>
        <button onClick={onClose} style={{ background:"none",border:"none",color:"#475569",cursor:"pointer",fontFamily:"'Inter',sans-serif",fontSize:"0.8rem" }}>{tc.later}</button>
      </div>
    </div>
  );
}

// -- CONNECTING SCREEN ---------------------------------------------------------
function ConnectingScreen({ c, lang, onDone }) {
  const [step,setStep]=useState(0);
  const [prog,setProg]=useState(0);
  const steps = lang==="hi" ? c.hiSteps(c.name) : c.steps(c.name);
  useEffect(()=>{
    const ts=[8000,14000,24000].map((d,i)=>setTimeout(()=>setStep(i),d));
    const iv=setInterval(()=>setProg(p=>Math.min(p+1.5,100)),450);
    const dn=setTimeout(onDone,30000);
    return()=>{ts.forEach(clearTimeout);clearInterval(iv);clearTimeout(dn);}
  },[]);
  return(
    <div style={{ position:"fixed",inset:0,zIndex:300,background:"rgba(2,8,23,0.97)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",animation:"fadeIn .4s ease" }}>
      <div style={{ textAlign:"center",maxWidth:"360px",width:"100%",animation:"scaleIn .4s ease" }}>
        <div style={{ position:"relative",width:96,height:96,margin:"0 auto 2rem" }}>
          <div style={{ position:"absolute",inset:-12,borderRadius:"50%",border:`2px solid ${c.color}30`,animation:"ringPulse 2s ease-in-out infinite" }}/>
          <div style={{ position:"absolute",inset:-6,borderRadius:"50%",border:`2px solid ${c.color}50`,animation:"ringPulse 2s ease-in-out .4s infinite" }}/>
          <div style={{ width:96,height:96,borderRadius:"50%",background:`linear-gradient(135deg,${c.color},${c.color}99)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2.5rem",boxShadow:`0 8px 32px ${c.color}40`,animation:"consultBob 3s ease-in-out infinite" }}>{c.emoji}</div>
        </div>
        <h2 style={{ fontFamily:"'Inter',sans-serif",color:"#f1f5f9",fontSize:"1.3rem",fontWeight:700,marginBottom:"0.5rem" }}>
          {lang==="hi" ? "आपका Consultant ढूंढ रहे हैं..." : "Finding Your Consultant..."}
        </h2>
        <p style={{ fontFamily:"'Inter',sans-serif",color:"#64748b",fontSize:"0.88rem",marginBottom:"0.3rem",minHeight:"1.4em",transition:"all .5s" }}>{steps[step]}</p>
        {step===2&&<p style={{ fontFamily:"'Inter',sans-serif",color:c.color,fontSize:"0.78rem",marginBottom:"1.4rem" }}>{c.specialty} Specialist</p>}
        {step<2&&<div style={{ marginBottom:"1.4rem" }}/>}
        <div style={{ width:"100%",height:"3px",background:"rgba(255,255,255,0.06)",borderRadius:"3px",overflow:"hidden" }}>
          <div style={{ height:"100%",background:`linear-gradient(90deg,${c.color},${c.color}80)`,width:`${prog}%`,transition:"width .45s ease",borderRadius:"3px" }}/>
        </div>
        <p style={{ fontFamily:"'Inter',sans-serif",color:"#334155",fontSize:"0.7rem",marginTop:"0.5rem" }}>{Math.round(prog)}%</p>
      </div>
    </div>
  );
}

// -- CHAT MODAL ----------------------------------------------------------------
function ChatModal({ onClose, t, lang, user }) {
  const [c]=useState(()=>getRandConsultant());
  const { isMobile }=useBreakpoint();
  const [phase,setPhase]=useState("connecting");
  const [msgs,setMsgs]=useState([]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [showUp,setShowUp]=useState(false);
  const [usage,setUsage]=useState(getLimitData);
  const ref=useRef(null);
  const isPro=usage.plan==="pro"||usage.plan==="elite";
  const rem=isPro?Infinity:Math.max(0,FREE_LIMIT-usage.count);
  const tc=t.chat;

  const welcome=lang==="hi"
    ?`नमस्ते${user?.name?` ${user.name.split(" ")[0]}`:""}! Hi मैं ${c.name} हूं, Hikezo का ${c.role}।\n\nमैं आपकी help कर सकता/सकती हूं:\n Salary negotiation\n Career roadmap\n Skills gap analysis\n Resume improvement\n Interview preparation\n\nआज क्या discuss करना है?`
    :`Hi${user?.name?` ${user.name.split(" ")[0]}`:""}! Hi I'm ${c.name}, ${c.role} at Hikezo.\n\nI'm here to help with:\n Salary negotiation\n Career roadmap\n Skills gap analysis\n Resume improvement\n Interview preparation\n\nWhat's on your mind today?`;

  const sys=`${c.persona}\n\nYou are NOT an AI. You are a human consultant at Hikezo. Speak warmly and professionally. Reference India-specific context (salaries in INR, companies like TCS/Infosys/Flipkart, cities like Bengaluru/Mumbai/Hyderabad). Never say you are AI. Keep responses concise and actionable.\n${lang==="hi"?"Respond in warm Hinglish.":"Respond in English."}`;

  const connected=()=>{ setPhase("chat"); setTimeout(()=>setMsgs([{r:"a",t:welcome}]),600); };
  useEffect(()=>{ ref.current?.scrollIntoView({behavior:"smooth"}); },[msgs]);

  const send=async()=>{
    if(!input.trim()||loading)return;
    if(!isPro&&usage.count>=FREE_LIMIT){setShowUp(true);return;}
    const txt=input.trim(); setInput("");
    setMsgs(p=>[...p,{r:"u",t:txt}]); setLoading(true);
    const nd={...usage,count:usage.count+1}; setUsage(nd); saveLimitData(nd);
    try{
      const hist=msgs.map(m=>({role:m.r==="a"?"assistant":"user",content:m.t}));
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:sys,messages:[...hist,{role:"user",content:txt}]})});
      const d=await res.json();
      const rep=d.content?.map(x=>x.text||"").join("")||"Sorry, connection issue. Give me a moment! ";
      setMsgs(p=>[...p,{r:"a",t:rep}]);
      if(!isPro&&nd.count>=FREE_LIMIT)setTimeout(()=>setShowUp(true),1500);
    }catch{ setMsgs(p=>[...p,{r:"a",t:"Sorry, connection issue. Give me a moment! "}]); }
    setLoading(false);
  };

  const isSmall=isMobile;
  const cObj={...c,hiSteps:t.connect.steps,steps:t.connect.steps};

  return(
    <>
      {phase==="connecting"&&<ConnectingScreen c={{...c,steps:T.en.connect.steps,hiSteps:T.hi.connect.steps}} lang={lang} onDone={connected}/>}
      {phase==="chat"&&(
        <div style={{ position:"fixed",inset:0,zIndex:200,background:isSmall?"#0f172a":"rgba(2,8,23,0.9)",backdropFilter:isSmall?"none":"blur(12px)",display:"flex",alignItems:isSmall?"stretch":"center",justifyContent:"center",padding:isSmall?"0":"1rem",animation:"fadeIn .3s ease" }}
          onClick={e=>!isSmall&&e.target===e.currentTarget&&onClose()}>
          <div style={{ width:"100%",maxWidth:isSmall?"100%":"560px",height:isSmall?"100%":"660px",background:"#0f172a",border:isSmall?"none":"1px solid rgba(255,255,255,0.08)",borderRadius:isSmall?"0":"20px",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 32px 80px rgba(0,0,0,0.6)",animation:isSmall?"none":"scaleIn .35s ease",position:"relative" }}>
            {showUp&&<UpgradePopup onClose={()=>setShowUp(false)} onUpgrade={()=>{onClose();document.getElementById("pricing")?.scrollIntoView({behavior:"smooth"});}} tc={tc}/>}
            {/* Header */}
            <div style={{ padding:"1rem 1.2rem",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(255,255,255,0.02)",flexShrink:0 }}>
              <div style={{ display:"flex",alignItems:"center",gap:"10px" }}>
                <div style={{ position:"relative" }}>
                  <div style={{ width:40,height:40,borderRadius:"50%",background:`linear-gradient(135deg,${c.color},${c.color}80)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.2rem" }}>{c.emoji}</div>
                  <div style={{ position:"absolute",bottom:1,right:1,width:9,height:9,borderRadius:"50%",background:"#10b981",border:"2px solid #0f172a" }}/>
                </div>
                <div>
                  <div style={{ fontFamily:"'Inter',sans-serif",color:"#f1f5f9",fontWeight:600,fontSize:"0.9rem" }}>{c.name}</div>
                  <div style={{ fontFamily:"'Inter',sans-serif",color:"#475569",fontSize:"0.68rem" }}>{c.role} - {c.exp}</div>
                </div>
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:"8px" }}>
                <span style={{ fontFamily:"'Inter',sans-serif",fontSize:"0.62rem",color:"#334155",border:"1px solid rgba(255,255,255,0.07)",padding:"2px 7px",borderRadius:"4px" }}>{tc.badge}</span>
                <button onClick={onClose} style={{ background:"rgba(255,255,255,0.05)",border:"none",color:"#475569",cursor:"pointer",width:28,height:28,borderRadius:"6px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.9rem",transition:"background .2s" }}
                  onMouseEnter={e=>e.target.style.background="rgba(255,255,255,0.1)"} onMouseLeave={e=>e.target.style.background="rgba(255,255,255,0.05)"}>x</button>
              </div>
            </div>
            {/* Messages */}
            <div style={{ flex:1,overflowY:"auto",padding:"1.2rem",display:"flex",flexDirection:"column",gap:"0.8rem" }}>
              {msgs.map((m,i)=>(
                <div key={i} style={{ display:"flex",justifyContent:m.r==="u"?"flex-end":"flex-start",gap:"8px",alignItems:"flex-end",animation:"fadeUp .3s ease" }}>
                  {m.r==="a"&&<div style={{ width:26,height:26,borderRadius:"50%",flexShrink:0,background:`linear-gradient(135deg,${c.color},${c.color}80)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.78rem" }}>{c.emoji}</div>}
                  <div style={{ maxWidth:"82%",padding:"0.75rem 1rem",borderRadius:m.r==="u"?"16px 16px 4px 16px":"16px 16px 16px 4px",background:m.r==="u"?"linear-gradient(135deg,#0ea5e9,#6366f1)":"rgba(255,255,255,0.06)",color:m.r==="u"?"#fff":"#cbd5e1",fontFamily:"'Inter',sans-serif",fontSize:"0.88rem",lineHeight:1.6,whiteSpace:"pre-wrap",fontWeight:m.r==="u"?500:400 }}>{m.t}</div>
                </div>
              ))}
              {loading&&(
                <div style={{ display:"flex",gap:"8px",alignItems:"flex-end" }}>
                  <div style={{ width:26,height:26,borderRadius:"50%",flexShrink:0,background:`linear-gradient(135deg,${c.color},${c.color}80)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.78rem" }}>{c.emoji}</div>
                  <div style={{ padding:"0.75rem 1rem",background:"rgba(255,255,255,0.06)",borderRadius:"16px 16px 16px 4px",display:"flex",gap:"4px",alignItems:"center" }}>
                    {[0,.2,.4].map((d,i)=><div key={i} style={{ width:6,height:6,borderRadius:"50%",background:"#475569",animation:`dot 1.3s infinite ${d}s` }}/>)}
                  </div>
                </div>
              )}
              <div ref={ref}/>
            </div>
            {/* Input */}
            <div style={{ padding:"0.8rem 1rem",borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",flexDirection:"column",gap:"6px",background:"rgba(0,0,0,0.2)",flexShrink:0,paddingBottom:isSmall?"calc(0.8rem + env(safe-area-inset-bottom))":"0.8rem" }}>
              {!isPro&&(
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 10px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"6px" }}>
                  <span style={{ fontFamily:"'Inter',sans-serif",fontSize:"0.7rem",color:"#475569" }}>{tc.freeLeft(rem)}</span>
                  <button onClick={()=>setShowUp(true)} style={{ background:"linear-gradient(135deg,#10b981,#0ea5e9)",border:"none",borderRadius:"5px",color:"#fff",fontWeight:600,fontSize:"0.66rem",padding:"2px 8px",cursor:"pointer",fontFamily:"'Inter',sans-serif" }}>{tc.upgrade}</button>
                </div>
              )}
              <div style={{ display:"flex",gap:"8px" }}>
                <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}
                  placeholder={tc.inputPh}
                  style={{ flex:1,padding:"11px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"10px",color:"#e2e8f0",fontFamily:"'Inter',sans-serif",fontSize:isSmall?"16px":"0.88rem",outline:"none",transition:"border-color .2s" }}
                  onFocus={e=>e.target.style.borderColor="rgba(14,165,233,0.4)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.08)"}/>
                <button onClick={send} disabled={loading||!input.trim()} style={{ padding:"11px 16px",background:"linear-gradient(135deg,#0ea5e9,#6366f1)",border:"none",borderRadius:"10px",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:"1rem",opacity:(loading||!input.trim())?.4:1,transition:"opacity .2s",minWidth:44 }}>&#8594;</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// -- AUTH WALL -----------------------------------------------------------------
function AuthWall({ onAuth, ta, isMobile }) {
  const [mode,setMode]=useState("signup");
  const [form,setForm]=useState({name:"",email:"",mobile:"",password:""});
  const [errs,setErrs]=useState({});
  const [loading,setLoading]=useState(false);
  const [ok,setOk]=useState(false);

  const validate=()=>{
    const e={};
    if(mode==="signup"&&!form.name.trim())e.name="Required";
    if(!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))e.email="Valid email required";
    if(mode==="signup"&&!form.mobile.match(/^[6-9]\d{9}$/))e.mobile="Valid 10-digit mobile";
    if(form.password.length<6)e.password="Min 6 characters";
    return e;
  };
  const submit=()=>{
    const e=validate(); if(Object.keys(e).length){setErrs(e);return;}
    setLoading(true);
    setTimeout(()=>{
      const d={name:form.name||"User",email:form.email,mobile:form.mobile,plan:"free",joinedAt:new Date().toISOString()};
      try{sessionStorage.setItem("hz_user",JSON.stringify(d));}catch{}
      setOk(true); setTimeout(()=>onAuth(d),1000);
    },1000);
  };
  const inp=(field,ph,type="text")=>(
    <div style={{ display:"flex",flexDirection:"column",gap:"3px" }}>
      <input type={type} placeholder={ph} value={form[field]} onChange={e=>{setForm(p=>({...p,[field]:e.target.value}));setErrs(p=>({...p,[field]:""}));}} onKeyDown={e=>e.key==="Enter"&&submit()}
        style={{ padding:"11px 14px",borderRadius:"8px",background:"rgba(255,255,255,0.05)",border:`1px solid ${errs[field]?"rgba(239,68,68,0.5)":"rgba(255,255,255,0.1)"}`,color:"#f1f5f9",fontFamily:"'Inter',sans-serif",fontSize:isMobile?"16px":"0.88rem",outline:"none",transition:"border-color .2s" }}
        onFocus={e=>e.target.style.borderColor="rgba(14,165,233,0.5)"} onBlur={e=>e.target.style.borderColor=errs[field]?"rgba(239,68,68,0.5)":"rgba(255,255,255,0.1)"}/>
      {errs[field]&&<span style={{ fontFamily:"'Inter',sans-serif",fontSize:"0.68rem",color:"#ef4444" }}>{errs[field]}</span>}
    </div>
  );

  return(
    <div style={{ width:"100%",maxWidth:"400px",background:"#0f172a",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"20px",padding:isMobile?"1.8rem 1.4rem":"2.2rem",boxShadow:"0 32px 80px rgba(0,0,0,0.6)",animation:"scaleIn .4s ease" }}>
      <div style={{ display:"flex",alignItems:"center",gap:"10px",marginBottom:"1.8rem",justifyContent:"center" }}>
<span style={{ fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:"1.15rem",color:"#f1f5f9" }}>hike<span style={{ background:"linear-gradient(135deg,#0ea5e9,#6366f1)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>zo</span></span>
      </div>
      <h2 style={{ fontFamily:"'Inter',sans-serif",color:"#f1f5f9",fontWeight:700,fontSize:"1.2rem",textAlign:"center",marginBottom:"0.3rem" }}>
        {ok?"[!] Account Created!":(mode==="signup"?ta.signupTitle:ta.loginTitle)}
      </h2>
      <p style={{ fontFamily:"'Inter',sans-serif",color:"#64748b",fontSize:"0.8rem",textAlign:"center",marginBottom:"1.5rem" }}>
        {ok?ta.success:(mode==="signup"?ta.signupSub:ta.loginSub)}
      </p>
      {ok?(
        <div style={{ textAlign:"center",padding:"1rem" }}><div style={{ fontSize:"2.5rem",marginBottom:"0.5rem" }}>[OK]</div></div>
      ):(
        <div style={{ display:"flex",flexDirection:"column",gap:"0.75rem" }}>
          {mode==="signup"&&inp("name",ta.namePh)}
          {inp("email",ta.emailPh,"email")}
          {mode==="signup"&&inp("mobile",ta.mobilePh,"tel")}
          {inp("password",ta.passPh,"password")}
          <button onClick={submit} disabled={loading} style={{ padding:"12px",borderRadius:"8px",background:"linear-gradient(135deg,#0ea5e9,#6366f1)",border:"none",color:"#fff",fontWeight:600,fontSize:"0.9rem",cursor:loading?"not-allowed":"pointer",fontFamily:"'Inter',sans-serif",marginTop:"0.3rem",opacity:loading?.7:1,transition:"opacity .2s" }}>
            {loading?ta.thinking:(mode==="signup"?ta.signupBtn:ta.loginBtn)}
          </button>
          <p style={{ fontFamily:"'Inter',sans-serif",color:"#475569",fontSize:"0.78rem",textAlign:"center" }}>
            {mode==="signup"?ta.toLogin+" ":ta.toSignup+" "}
            <span onClick={()=>{setMode(mode==="signup"?"login":"signup");setErrs({});}} style={{ color:"#0ea5e9",cursor:"pointer",fontWeight:600 }}>
              {mode==="signup"?ta.loginLink:ta.signupLink}
            </span>
          </p>
          <p style={{ fontFamily:"'Inter',sans-serif",color:"#334155",fontSize:"0.68rem",textAlign:"center" }}>{ta.privacy}</p>
        </div>
      )}
    </div>
  );
}

// -- URGENCY BANNER ------------------------------------------------------------
function UrgencyBanner({ onCTA, lang, onClose }) {
  const [show, setShow] = useState(true);
  const [mins, setMins] = useState(23);
  const [secs, setSecs] = useState(47);
  useEffect(()=>{
    const iv = setInterval(()=>{
      setSecs(s=>{ if(s===0){ setMins(m=>m===0?59:m-1); return 59; } return s-1; });
    }, 1000);
    return ()=>clearInterval(iv);
  },[]);
  if(!show) return null;
  return(
    <div style={{ position:"fixed",top:0,left:0,right:0,zIndex:200,background:"linear-gradient(90deg,#0f172a,#1e293b,#0f172a)",borderBottom:"1px solid rgba(14,165,233,0.2)",padding:"8px 1rem",display:"flex",alignItems:"center",justifyContent:"center",gap:"0.75rem",flexWrap:"wrap" }}>
      <div style={{ display:"flex",alignItems:"center",gap:"6px",flexWrap:"wrap",justifyContent:"center" }}>
        <div style={{ width:6,height:6,borderRadius:"50%",background:"#10b981",animation:"pulse 1.5s infinite",flexShrink:0 }}/>
        <span style={{ fontFamily:"'Inter',sans-serif",color:"#94a3b8",fontSize:"0.72rem" }}>Limited Offer:</span>
        <span style={{ fontFamily:"'Inter',sans-serif",color:"#f1f5f9",fontSize:"0.72rem",fontWeight:600 }}>Pro plan</span>
        <span style={{ fontFamily:"'Inter',sans-serif",color:"#475569",fontSize:"0.72rem",textDecoration:"line-through" }}>₹649/mo</span>
        <span style={{ fontFamily:"'Inter',sans-serif",color:"#10b981",fontSize:"0.75rem",fontWeight:700 }}>₹399/mo</span>
        <span style={{ background:"linear-gradient(135deg,#10b981,#0ea5e9)",borderRadius:"3px",padding:"1px 7px",fontFamily:"'Inter',sans-serif",color:"#fff",fontSize:"0.62rem",fontWeight:700,letterSpacing:"0.04em" }}>38% OFF</span>
      </div>
      <div style={{ display:"flex",alignItems:"center",gap:"4px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:"4px",padding:"2px 8px" }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span style={{ fontFamily:"'Inter',sans-serif",color:"#fca5a5",fontSize:"0.7rem",fontWeight:600 }}>
          {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')} left
        </span>
      </div>
      <button onClick={onCTA} style={{ background:"linear-gradient(135deg,#0ea5e9,#6366f1)",border:"none",borderRadius:"4px",color:"#fff",fontSize:"0.7rem",fontWeight:700,padding:"4px 12px",cursor:"pointer",fontFamily:"'Inter',sans-serif" }}>
        {lang==="hi" ? "Claim karo" : "Claim Offer"}
      </button>
      <button onClick={()=>{setShow(false);onClose&&onClose();}} style={{ background:"none",border:"none",color:"#334155",cursor:"pointer",marginLeft:"0.25rem",fontSize:"0.9rem",lineHeight:1 }}>x</button>
    </div>
  );
}
function Navbar({ onCTA, lang, setLang, t, user, bannerVisible=true }) {
  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  const [menuOpen, setMenuOpen] = useState(false);
  const tn = t.nav;
  return (
    <nav style={{ position:"fixed",top:bannerVisible?"37px":"0px",transition:"top .3s ease",left:0,right:0,zIndex:100,height:isMobile?"56px":"64px",background:"rgba(15,23,42,0.98)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"space-between",padding:isMobile?"0 1rem":isTablet?"0 1.5rem":"0 2.5rem" }}>
      {/* Logo */}
      <div style={{ display:"flex",alignItems:"center",gap:"9px",textDecoration:"none" }}>
<span style={{ fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:"1.05rem",color:"#f1f5f9",letterSpacing:"-0.01em" }}>hike<span style={{ background:"linear-gradient(135deg,#0ea5e9,#6366f1)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>zo</span></span>
      </div>

      {isDesktop ? (
        <div style={{ display:"flex",gap:"0.5rem",alignItems:"center" }}>
          {[["#features",tn.features],["#pricing",tn.pricing]].map(([h,l])=>(
            <a key={h} href={h} style={{ color:"#64748b",textDecoration:"none",fontSize:"0.85rem",fontFamily:"'Inter',sans-serif",fontWeight:500,padding:"6px 12px",borderRadius:"6px",transition:"all .2s" }}
              onMouseEnter={e=>{e.target.style.color="#f1f5f9";e.target.style.background="rgba(255,255,255,0.05)";}} onMouseLeave={e=>{e.target.style.color="#64748b";e.target.style.background="transparent";}}>{l}</a>
          ))}
          <div style={{ width:"1px",height:"20px",background:"rgba(255,255,255,0.08)",margin:"0 0.5rem" }}/>
          <div style={{ display:"flex",background:"rgba(255,255,255,0.05)",borderRadius:"6px",padding:"2px",gap:"1px" }}>
            {["en","hi"].map(l=><button key={l} onClick={()=>setLang(l)} style={{ padding:"4px 10px",borderRadius:"5px",border:"none",background:lang===l?"rgba(14,165,233,0.2)":"transparent",color:lang===l?"#0ea5e9":"#475569",fontWeight:600,fontSize:"0.72rem",cursor:"pointer",fontFamily:"'Inter',sans-serif",transition:"all .2s" }}>{l==="en"?"EN":"हि"}</button>)}
          </div>
          {user&&<div style={{ display:"flex",alignItems:"center",gap:"7px",padding:"5px 10px",background:"rgba(255,255,255,0.05)",borderRadius:"7px",border:"1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ width:24,height:24,borderRadius:"50%",background:"linear-gradient(135deg,#0ea5e9,#6366f1)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:"0.65rem",color:"#fff" }}>{user.name?.charAt(0).toUpperCase()}</div>
            <span style={{ fontFamily:"'Inter',sans-serif",color:"#94a3b8",fontSize:"0.78rem" }}>{user.name?.split(" ")[0]}</span>
          </div>}
          <button onClick={onCTA} style={{ padding:"8px 18px",borderRadius:"7px",background:"linear-gradient(135deg,#0ea5e9,#6366f1)",border:"none",color:"#fff",fontWeight:600,fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Inter',sans-serif",transition:"opacity .2s,transform .2s" }}
            onMouseEnter={e=>{e.target.style.opacity=".88";e.target.style.transform="translateY(-1px)";}} onMouseLeave={e=>{e.target.style.opacity="1";e.target.style.transform="translateY(0)";}}>{tn.cta}</button>
        </div>
      ) : (
        <div style={{ display:"flex",alignItems:"center",gap:"8px" }}>
          {isTablet&&<>
            <a href="#pricing" style={{ color:"#64748b",textDecoration:"none",fontSize:"0.82rem",fontFamily:"'Inter',sans-serif" }}>{tn.pricing}</a>
          </>}
          <div style={{ display:"flex",background:"rgba(255,255,255,0.05)",borderRadius:"6px",padding:"2px",gap:"1px" }}>
            {["en","hi"].map(l=><button key={l} onClick={()=>setLang(l)} style={{ padding:"3px 8px",borderRadius:"4px",border:"none",background:lang===l?"rgba(14,165,233,0.2)":"transparent",color:lang===l?"#0ea5e9":"#475569",fontWeight:600,fontSize:"0.68rem",cursor:"pointer",fontFamily:"'Inter',sans-serif" }}>{l==="en"?"EN":"हि"}</button>)}
          </div>
          {isTablet&&<button onClick={onCTA} style={{ padding:"7px 14px",borderRadius:"7px",background:"linear-gradient(135deg,#0ea5e9,#6366f1)",border:"none",color:"#fff",fontWeight:600,fontSize:"0.78rem",cursor:"pointer",fontFamily:"'Inter',sans-serif" }}>{tn.cta}</button>}
          {isMobile&&<button onClick={()=>setMenuOpen(!menuOpen)} style={{ background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"7px",color:"#94a3b8",cursor:"pointer",width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center" }}>
            {menuOpen?"x":"="}
          </button>}
        </div>
      )}

      {isMobile&&menuOpen&&(
        <div style={{ position:"absolute",top:"56px",left:0,right:0,background:"rgba(15,23,42,0.99)",borderBottom:"1px solid rgba(255,255,255,0.06)",padding:"1rem",display:"flex",flexDirection:"column",gap:"0.5rem",animation:"fadeUp .2s ease" }}>
          {[["#features",tn.features],["#pricing",tn.pricing]].map(([h,l])=>(
            <a key={h} href={h} onClick={()=>setMenuOpen(false)} style={{ color:"#94a3b8",textDecoration:"none",fontFamily:"'Inter',sans-serif",fontSize:"0.95rem",padding:"0.6rem 0.5rem",borderBottom:"1px solid rgba(255,255,255,0.05)" }}>{l}</a>
          ))}
          <button onClick={()=>{onCTA();setMenuOpen(false);}} style={{ padding:"12px",background:"linear-gradient(135deg,#0ea5e9,#6366f1)",border:"none",borderRadius:"8px",color:"#fff",fontWeight:600,fontSize:"0.95rem",cursor:"pointer",fontFamily:"'Inter',sans-serif",marginTop:"0.5rem" }}>{tn.cta}</button>
        </div>
      )}
    </nav>
  );
}

// -- HERO ----------------------------------------------------------------------
function Hero({ onCTA, t, lang }) {
  const { isMobile, isTablet } = useBreakpoint();
  const th = t.hero;
  const [count, setCount] = useState(0);
  const [liveUsers] = useState(()=>Math.floor(Math.random()*80)+120);
  useEffect(()=>{ const iv=setInterval(()=>setCount(c=>{ if(c>=10000){clearInterval(iv);return 10000;} return c+200; }),20); return()=>clearInterval(iv); },[]);
  const [typed, setTyped] = useState("");
  const words = lang==="hi" ? ["Salary Negotiate करो","Skills Gap भरो","Interview Ace करो","Career Roadmap बनाओ","Resume Transform करो"] : ["Negotiate Your Salary","Bridge Your Skills Gap","Ace Every Interview","Build Your Career Roadmap","Transform Your Resume"];
  const [wi, setWi] = useState(0);
  useEffect(()=>{
    let i=0,del=false,cur=words[wi];
    const iv=setInterval(()=>{ if(!del){setTyped(cur.slice(0,i+1));i++;if(i===cur.length){del=true;}} else{setTyped(cur.slice(0,i-1));i--;if(i===0){del=false;setWi(p=>(p+1)%words.length);cur=words[(wi+1)%words.length];}} },del?50:90);
    return()=>clearInterval(iv);
  },[wi]);

  return(
    <section style={{ background:"#020817",minHeight:isMobile?"100vh":"92vh",display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center",padding:isMobile?"7rem 1.5rem 2.5rem":isTablet?"8rem 2rem 3rem":"9rem 2rem 4rem",position:"relative",overflow:"hidden" }}>

      {/* Animated grid */}
      <div style={{ position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(14,165,233,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,0.04) 1px,transparent 1px)",backgroundSize:"50px 50px",pointerEvents:"none",maskImage:"radial-gradient(ellipse 80% 80% at 50% 50%,black 40%,transparent 100%)",WebkitMaskImage:"radial-gradient(ellipse 80% 80% at 50% 50%,black 40%,transparent 100%)" }}/>

      {/* Neon SVG */}
      <div style={{ position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden" }}>
        <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" style={{ position:"absolute",inset:0 }}>
          <defs>
            <filter id="ng1"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="ng2"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="ng3"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <circle r="3" fill="#0ea5e9" filter="url(#ng3)" opacity="0">
            <animate attributeName="cx" values="-60;1260" dur="8s" repeatCount="indefinite"/>
            <animate attributeName="cy" values="220;180" dur="8s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0;0;1;1;0" dur="8s" repeatCount="indefinite"/>
          </circle>
          <circle r="3" fill="#818cf8" filter="url(#ng3)" opacity="0">
            <animate attributeName="cx" values="1260;-60" dur="10s" repeatCount="indefinite"/>
            <animate attributeName="cy" values="580;620" dur="10s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0;0;1;1;0" dur="10s" repeatCount="indefinite"/>
          </circle>
          <circle cx="600" cy="50" r="100" fill="none" stroke="rgba(14,165,233,0.07)" strokeWidth="1" filter="url(#ng1)">
            <animate attributeName="r" values="60;180;60" dur="7s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.1;0.25;0.1" dur="7s" repeatCount="indefinite"/>
          </circle>
          <line x1="0" y1="0" x2="1200" y2="0" stroke="rgba(14,165,233,0.06)" strokeWidth="1.5" filter="url(#ng1)">
            <animate attributeName="y1" values="-10;810;-10" dur="16s" repeatCount="indefinite"/>
            <animate attributeName="y2" values="-10;810;-10" dur="16s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0;0.5;0.5;0;0" dur="16s" repeatCount="indefinite"/>
          </line>
        </svg>
      </div>

      {/* Glows */}
      <div style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:"800px",height:"400px",background:"radial-gradient(ellipse,rgba(14,165,233,0.09) 0%,rgba(99,102,241,0.04) 50%,transparent 70%)",pointerEvents:"none",animation:"glowPulse 5s ease-in-out infinite" }}/>

      <div style={{ position:"relative",zIndex:1,maxWidth:"780px",width:"100%" }}>

        {/* Live users badge -- FOMO */}
        <div style={{ display:"inline-flex",alignItems:"center",gap:"8px",background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:"6px",padding:"5px 14px",marginBottom:"1.2rem",animation:"fadeUp .5s ease both" }}>
          <div style={{ width:7,height:7,borderRadius:"50%",background:"#10b981",animation:"pulse 1.5s infinite" }}/>
          <span style={{ color:"#86efac",fontSize:"0.7rem",fontWeight:600,fontFamily:"'Inter',sans-serif",letterSpacing:"0.06em" }}>
            {liveUsers} professionals getting career help right now
          </span>
        </div>

        {/* Headline -- clear value */}
        <h1 style={{ fontFamily:"'Inter',sans-serif",fontSize:isMobile?"clamp(1.9rem,8vw,2.6rem)":isTablet?"clamp(2.3rem,5vw,3.2rem)":"clamp(2.8rem,4.5vw,3.8rem)",fontWeight:800,lineHeight:1.1,color:"#f8fafc",maxWidth:"700px",margin:"0 auto 0.8rem",letterSpacing:"-0.04em",animation:"fadeUp .7s ease .1s both" }}>
          {th.h1a}{" "}
          <span style={{ background:"linear-gradient(135deg,#0ea5e9,#6366f1,#0ea5e9)",backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"gradShift 3s ease infinite" }}>{th.h1b}</span>
        </h1>

        {/* Typewriter */}
        <div style={{ fontFamily:"'Inter',sans-serif",fontSize:isMobile?"0.88rem":"0.96rem",color:"#64748b",marginBottom:"0.8rem",animation:"fadeUp .7s ease .15s both",minHeight:"1.4em" }}>
          <span style={{ color:"#94a3b8" }}>{typed}</span>
          <span style={{ animation:"blink 1s step-end infinite",color:"#0ea5e9" }}>|</span>
        </div>

        {/* Sub -- specific outcome */}
        <p style={{ fontFamily:"'Inter',sans-serif",fontSize:isMobile?"0.86rem":"0.92rem",color:"#475569",maxWidth:"460px",lineHeight:1.65,margin:"0 auto 1.8rem",animation:"fadeUp .7s ease .2s both" }}>
          {th.sub}
        </p>

        {/* CTAs */}
        <div style={{ display:"flex",gap:"0.75rem",justifyContent:"center",flexWrap:"wrap",animation:"fadeUp .7s ease .3s both" }}>
          <button onClick={onCTA} style={{ padding:isMobile?"13px 26px":"14px 32px",borderRadius:"8px",background:"linear-gradient(135deg,#0ea5e9,#6366f1)",border:"none",color:"#fff",fontWeight:700,fontSize:"0.95rem",cursor:"pointer",fontFamily:"'Inter',sans-serif",boxShadow:"0 4px 20px rgba(14,165,233,0.35)",transition:"all .25s ease",display:"flex",alignItems:"center",gap:"6px" }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 10px 32px rgba(14,165,233,0.5)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 4px 20px rgba(14,165,233,0.35)";}}>
            {th.cta}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
          <button onClick={onCTA} style={{ padding:isMobile?"13px 22px":"14px 24px",borderRadius:"8px",background:"transparent",border:"1px solid rgba(255,255,255,0.1)",color:"#94a3b8",fontWeight:500,fontSize:"0.88rem",cursor:"pointer",fontFamily:"'Inter',sans-serif",transition:"all .25s ease" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(14,165,233,0.4)";e.currentTarget.style.color="#e2e8f0";e.currentTarget.style.background="rgba(14,165,233,0.05)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";e.currentTarget.style.color="#94a3b8";e.currentTarget.style.background="transparent";}}>
            {th.demo}
          </button>
        </div>

        {/* Trust line */}
        <p style={{ fontFamily:"'Inter',sans-serif",color:"#1e293b",fontSize:"0.75rem",marginTop:"1rem",animation:"fadeUp .7s ease .35s both" }}>
          Free to start &nbsp;-&nbsp; No credit card &nbsp;-&nbsp; Results in first session
        </p>

        {/* Social proof */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:"12px",marginTop:"1.8rem",animation:"fadeUp .7s ease .4s both" }}>
          <div style={{ display:"flex" }}>
            {["RS","PM","AK","MK","SJ"].map((a,i)=>(
              <div key={a} style={{ width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,hsl(${200+i*30},70%,45%),hsl(${220+i*30},70%,35%))`,border:"2px solid #020817",marginLeft:i===0?0:"-7px",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:"0.52rem",color:"#fff" }}>{a}</div>
            ))}
          </div>
          <span style={{ fontFamily:"'Inter',sans-serif",color:"#334155",fontSize:"0.76rem" }}>
            <strong style={{ color:"#64748b" }}>{count.toLocaleString()}+</strong> {th.social}
          </span>
          <div style={{ display:"flex",gap:"1px" }}>
            {[1,2,3,4,5].map(s=><span key={s} style={{ color:"#f59e0b",fontSize:"0.75rem" }}>*</span>)}
          </div>
          <span style={{ fontFamily:"'Inter',sans-serif",color:"#334155",fontSize:"0.75rem" }}>4.9/5</span>
        </div>

        {/* Stats */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1px",background:"rgba(255,255,255,0.05)",borderRadius:"10px",overflow:"hidden",marginTop:"2rem",border:"1px solid rgba(255,255,255,0.06)",animation:"fadeUp .7s ease .45s both" }}>
          {[["10,000+","Professionals helped"],["40%","Avg salary hike"],["4.9/5","User rating"]].map(([v,l],i)=>(
            <div key={l} style={{ padding:"0.9rem",background:"rgba(255,255,255,0.02)",textAlign:"center",transition:"background .2s" }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(14,165,233,0.05)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"}>
              <div style={{ fontFamily:"'Inter',sans-serif",fontSize:isMobile?"1rem":"1.2rem",fontWeight:700,color:"#f1f5f9",letterSpacing:"-0.02em" }}>{v}</div>
              <div style={{ fontFamily:"'Inter',sans-serif",fontSize:"0.65rem",color:"#334155",marginTop:"2px" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


// -- HOW IT WORKS --------------------------------------------------------------
function HowItWorks({ t, onCTA }) {
  const ref=useRef(null); const v=useInView(ref);
  const { isMobile }=useBreakpoint();
  const th=t.how;
  const stepIcons=[
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  ];
  return(
    <section style={{ background:"#f8fafc",borderTop:"1px solid #e2e8f0",borderBottom:"1px solid #e2e8f0",padding:isMobile?"4rem 1.5rem":"6rem 2rem",width:"100%" }} ref={ref}>
      <div style={{ maxWidth:"1100px",margin:"0 auto" }}>
        <SR cls="sr" style={{ textAlign:"center",marginBottom:"3.5rem" }}>
          <span style={{ fontFamily:"'Inter',sans-serif",color:"#0ea5e9",fontSize:"0.7rem",fontWeight:700,letterSpacing:"0.14em",background:"rgba(14,165,233,0.08)",padding:"4px 12px",borderRadius:"4px" }}>{th.label}</span>
          <h2 style={{ fontFamily:"'Inter',sans-serif",fontSize:isMobile?"1.7rem":"2.2rem",fontWeight:700,color:"#0f172a",marginTop:"1rem",letterSpacing:"-0.03em" }}>{th.title}</h2>
          <p style={{ fontFamily:"'Inter',sans-serif",color:"#64748b",fontSize:"0.95rem",marginTop:"0.5rem" }}>{th.sub}</p>
        </SR>
        <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:"1.5rem",position:"relative" }}>
          {!isMobile&&<div style={{ position:"absolute",top:"32px",left:"12%",right:"12%",height:"1px",background:"linear-gradient(90deg,transparent,#e2e8f0 20%,#e2e8f0 80%,transparent)",zIndex:0 }}/>}
          {th.steps.map((s,i)=>(
            <SR key={s.title} cls="sr" delay={i*120} style={{ textAlign:"center",position:"relative",zIndex:1,cursor:"default" }}>
              <div className="step-wrap" style={{ cursor:"default" }}
                onMouseEnter={e=>{const ic=e.currentTarget.querySelector(".step-icon");if(ic){ic.style.transform="translateY(-4px)";ic.style.boxShadow="0 8px 24px rgba(14,165,233,0.15)";ic.style.borderColor="rgba(14,165,233,0.4)";}}}
                onMouseLeave={e=>{const ic=e.currentTarget.querySelector(".step-icon");if(ic){ic.style.transform="translateY(0)";ic.style.boxShadow="0 2px 12px rgba(0,0,0,0.06)";ic.style.borderColor="#e2e8f0";}}}>
                <div className="step-icon" style={{ width:60,height:60,borderRadius:"14px",background:"#fff",border:"1px solid #e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1.2rem",color:"#0ea5e9",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",position:"relative",transition:"all .3s ease" }}>
                  {stepIcons[i]}
                  <div style={{ position:"absolute",top:-9,right:-9,width:20,height:20,borderRadius:"50%",background:"linear-gradient(135deg,#0ea5e9,#6366f1)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:"0.6rem",color:"#fff",boxShadow:"0 2px 8px rgba(14,165,233,0.3)" }}>{i+1}</div>
                </div>
                <h3 style={{ fontFamily:"'Inter',sans-serif",color:"#0f172a",fontWeight:600,fontSize:"0.9rem",marginBottom:"0.4rem" }}>{s.title}</h3>
                <p style={{ fontFamily:"'Inter',sans-serif",color:"#64748b",fontSize:"0.8rem",lineHeight:1.6 }}>{s.desc}</p>
              </div>
            </SR>
          ))}
        </div>
        <div style={{ textAlign:"center",marginTop:"3rem" }}>
          <button onClick={onCTA} style={{ padding:"11px 28px",borderRadius:"7px",background:"#0f172a",border:"none",color:"#fff",fontWeight:600,fontSize:"0.88rem",cursor:"pointer",fontFamily:"'Inter',sans-serif",transition:"background .2s" }}
            onMouseEnter={e=>e.target.style.background="#1e293b"} onMouseLeave={e=>e.target.style.background="#0f172a"}>{th.cta}</button>
        </div>
      </div>
    </section>
  );
}

// -- FEATURES -----------------------------------------------------------------
function Features({ t }) {
  const ref=useRef(null); const v=useInView(ref);
  const { isMobile, isTablet }=useBreakpoint();
  const tf=t.features;
  return(
    <section id="features" style={{ background:"#020817",padding:isMobile?"4rem 1.5rem":isTablet?"5rem 2rem":"7rem 3rem",width:"100%" }} ref={ref}>
      <div style={{ maxWidth:"1100px",margin:"0 auto" }}>
        <div style={{ textAlign:"center",marginBottom:"3rem" }}>
          <span style={{ fontFamily:"'Inter',sans-serif",color:"#0ea5e9",fontSize:"0.7rem",fontWeight:700,letterSpacing:"0.14em",background:"rgba(14,165,233,0.08)",padding:"4px 12px",borderRadius:"4px" }}>{tf.label}</span>
          <h2 style={{ fontFamily:"'Inter',sans-serif",fontSize:isMobile?"1.7rem":"2.2rem",fontWeight:700,color:"#f8fafc",marginTop:"1rem",letterSpacing:"-0.03em" }}>{tf.title}</h2>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":isTablet?"repeat(2,1fr)":"repeat(3,1fr)",gap:"1px",background:"rgba(255,255,255,0.06)",borderRadius:"16px",overflow:"hidden",border:"1px solid rgba(255,255,255,0.06)" }}>
          {tf.items.map((f,i)=>(
            <SR key={f.title} cls="sr" delay={i*80}>
              <div style={{ padding:"2rem",background:"rgba(255,255,255,0.02)",transition:"all .3s ease",cursor:"default",height:"100%" }}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(14,165,233,0.06)";const ic=e.currentTarget.querySelector(".feat-icon");if(ic){ic.style.transform="scale(1.1) rotate(-5deg)";ic.style.background="rgba(14,165,233,0.15)";}}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.02)";const ic=e.currentTarget.querySelector(".feat-icon");if(ic){ic.style.transform="scale(1) rotate(0deg)";ic.style.background="rgba(14,165,233,0.1)";}}}> 
                <div className="feat-icon" style={{ width:38,height:38,borderRadius:"10px",background:"rgba(14,165,233,0.1)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"1rem",color:"#0ea5e9",transition:"all .3s ease" }}>{FEAT_ICONS[i]}</div>
                <h3 style={{ fontFamily:"'Inter',sans-serif",color:"#f1f5f9",fontWeight:600,fontSize:"0.92rem",marginBottom:"0.4rem" }}>{f.title}</h3>
                <p style={{ fontFamily:"'Inter',sans-serif",color:"#475569",lineHeight:1.65,fontSize:"0.82rem" }}>{f.desc}</p>
              </div>
            </SR>
          ))}
        </div>
      </div>
    </section>
  );
}

// -- TESTIMONIALS --------------------------------------------------------------
function Testimonials({ t }) {
  const ref=useRef(null); const v=useInView(ref);
  const { isMobile }=useBreakpoint();
  const tt=t.testi;
  return(
    <section style={{ background:"#f8fafc",padding:isMobile?"4rem 1.5rem":"6rem 2rem",width:"100%" }} ref={ref}>
      <div style={{ maxWidth:"1100px",margin:"0 auto" }}>
        <div style={{ textAlign:"center",marginBottom:"3rem" }}>
          <span style={{ fontFamily:"'Inter',sans-serif",color:"#0ea5e9",fontSize:"0.7rem",fontWeight:700,letterSpacing:"0.14em",background:"rgba(14,165,233,0.08)",padding:"4px 12px",borderRadius:"4px" }}>{tt.label}</span>
          <h2 style={{ fontFamily:"'Inter',sans-serif",fontSize:isMobile?"1.7rem":"2.2rem",fontWeight:700,color:"#0f172a",marginTop:"1rem",letterSpacing:"-0.03em" }}>{tt.title}</h2>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(3,1fr)",gap:"1.2rem" }}>
          {tt.items.map((t2,i)=>(
            <SR key={t2.name} cls="sr" delay={i*120}>
              <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:"12px",padding:"1.8rem",boxShadow:"0 1px 4px rgba(0,0,0,0.05)",cursor:"default",position:"relative",height:"100%",display:"flex",flexDirection:"column",transition:"all .3s ease" }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 12px 32px rgba(14,165,233,0.1)";e.currentTarget.style.borderColor="rgba(14,165,233,0.25)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.05)";e.currentTarget.style.borderColor="#e2e8f0";}}>
                <div style={{ position:"absolute",top:"1rem",right:"1.2rem",fontFamily:"Georgia,serif",fontSize:"4rem",color:"rgba(14,165,233,0.08)",lineHeight:1,pointerEvents:"none",userSelect:"none" }}>"</div>
                <div style={{ display:"flex",gap:"2px",marginBottom:"1rem" }}>
                  {[1,2,3,4,5].map(s=><span key={s} style={{ color:"#f59e0b",fontSize:"0.82rem" }}>*</span>)}
                </div>
                <p style={{ fontFamily:"'Inter',sans-serif",color:"#374151",lineHeight:1.7,fontSize:"0.88rem",marginBottom:"1.4rem",flex:1 }}>{t2.text}</p>
                <div style={{ display:"flex",alignItems:"center",gap:"10px",paddingTop:"1rem",borderTop:"1px solid #f1f5f9" }}>
                  <div style={{ width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#0ea5e9,#6366f1)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"0.72rem",color:"#fff",fontFamily:"'Inter',sans-serif",flexShrink:0 }}>{t2.av}</div>
                  <div>
                    <div style={{ fontFamily:"'Inter',sans-serif",color:"#0f172a",fontWeight:600,fontSize:"0.85rem" }}>{t2.name}</div>
                    <div style={{ fontFamily:"'Inter',sans-serif",color:"#94a3b8",fontSize:"0.72rem" }}>{t2.role}</div>
                  </div>
                </div>
              </div>
            </SR>
          ))}
        </div>
      </div>
    </section>
  );
}

// -- PRICING -------------------------------------------------------------------
function Pricing({ onCTA, t, lang }) {
  const ref=useRef(null); const v=useInView(ref);
  const { isMobile, isTablet }=useBreakpoint();
  const tp=t.pricing;
  return(
    <section id="pricing" style={{ background:"#020817",padding:isMobile?"4rem 1.5rem":isTablet?"5rem 2rem":"7rem 3rem",width:"100%" }} ref={ref}>
      <div style={{ maxWidth:"1100px",margin:"0 auto" }}>
        <div style={{ textAlign:"center",marginBottom:"3.5rem" }}>
          <span style={{ fontFamily:"'Inter',sans-serif",color:"#0ea5e9",fontSize:"0.7rem",fontWeight:700,letterSpacing:"0.14em",background:"rgba(14,165,233,0.08)",padding:"4px 12px",borderRadius:"4px" }}>{tp.label}</span>
          <h2 style={{ fontFamily:"'Inter',sans-serif",fontSize:isMobile?"1.7rem":"2.2rem",fontWeight:700,color:"#f8fafc",marginTop:"1rem",letterSpacing:"-0.03em" }}>{tp.title}</h2>
          <p style={{ fontFamily:"'Inter',sans-serif",color:"#475569",marginTop:"0.5rem",fontSize:"0.9rem" }}>{tp.sub}</p>
          <div style={{ display:"inline-flex",alignItems:"center",gap:"6px",background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:"6px",padding:"5px 14px",marginTop:"0.8rem" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            <span style={{ fontFamily:"'Inter',sans-serif",color:"#fca5a5",fontSize:"0.72rem",fontWeight:600 }}>
              {lang==="hi" ? "1,200+ professionals ne is month upgrade kiya" : "1,200+ professionals upgraded this month"}
            </span>
          </div>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":isTablet?"repeat(2,1fr)":"repeat(3,1fr)",gap:"1.2rem",alignItems:"start" }}>
          {tp.plans.map((plan,i)=>(
            <SR key={plan.name} cls="sr-s" delay={i*120}>
              <div style={{ background:plan.highlight?"#fff":"rgba(255,255,255,0.02)",border:plan.highlight?"none":"1px solid rgba(255,255,255,0.06)",borderRadius:"16px",padding:"2rem 1.6rem",position:"relative",display:"flex",flexDirection:"column",boxShadow:plan.highlight?"0 20px 60px rgba(0,0,0,0.25)":"none",transition:"all .3s ease" }}
                onMouseEnter={e=>{ if(!plan.highlight){e.currentTarget.style.border="1px solid rgba(14,165,233,0.2)";e.currentTarget.style.transform="translateY(-4px)";}else{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 28px 70px rgba(0,0,0,0.3)";}}}
                onMouseLeave={e=>{ if(!plan.highlight){e.currentTarget.style.border="1px solid rgba(255,255,255,0.06)";e.currentTarget.style.transform="translateY(0)";}else{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 20px 60px rgba(0,0,0,0.25)";}}}>

              {plan.highlight&&<div style={{ position:"absolute",top:"-1px",left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#0ea5e9,#6366f1)",color:"#fff",fontWeight:600,fontSize:"0.62rem",padding:"3px 18px",borderRadius:"0 0 8px 8px",fontFamily:"'Inter',sans-serif",letterSpacing:"0.08em",whiteSpace:"nowrap" }}>MOST POPULAR</div>}
              <div style={{ marginBottom:"1.5rem",paddingTop:plan.highlight?"0.5rem":0 }}>
                <div style={{ display:"flex",alignItems:"center",gap:"8px",marginBottom:"0.5rem" }}>
                  <div style={{ fontFamily:"'Inter',sans-serif",color:plan.highlight?"#64748b":"#334155",fontSize:"0.72rem",fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase" }}>{plan.name}</div>
                  {plan.discount && <div style={{ background:"linear-gradient(135deg,#10b981,#0ea5e9)",borderRadius:"4px",padding:"2px 8px",fontFamily:"'Inter',sans-serif",color:"#fff",fontSize:"0.62rem",fontWeight:700,letterSpacing:"0.06em" }}>{plan.discount}</div>}
                </div>
                <div style={{ display:"flex",alignItems:"baseline",gap:"6px" }}>
                  <span style={{ fontFamily:"'Inter',sans-serif",fontSize:"2.4rem",fontWeight:800,color:plan.highlight?"#0f172a":"#f1f5f9",letterSpacing:"-0.04em",lineHeight:1 }}>{plan.price}</span>
                  {i>0&&<span style={{ fontFamily:"'Inter',sans-serif",color:plan.highlight?"#94a3b8":"#334155",fontSize:"0.78rem" }}>/{t.lang==="hi"?"माह":"mo"}</span>}
                  {plan.originalPrice && <span style={{ fontFamily:"'Inter',sans-serif",color:"#475569",fontSize:"0.85rem",textDecoration:"line-through",marginLeft:"2px" }}>{plan.originalPrice}</span>}
                </div>
                {i===0&&<div style={{ fontFamily:"'Inter',sans-serif",color:plan.highlight?"#94a3b8":"#334155",fontSize:"0.78rem",marginTop:"2px" }}>{plan.period}</div>}
              </div>
              <div style={{ height:"1px",background:plan.highlight?"#f1f5f9":"rgba(255,255,255,0.06)",marginBottom:"1.5rem" }}/>
              <ul style={{ listStyle:"none",padding:0,marginBottom:"1.5rem",display:"flex",flexDirection:"column",gap:"0.65rem",flex:1 }}>
                {plan.features.map(f=>(
                  <li key={f} style={{ display:"flex",gap:"8px",alignItems:"flex-start",fontFamily:"'Inter',sans-serif",color:plan.highlight?"#374151":"#64748b",fontSize:"0.84rem" }}>
                    <span style={{ flexShrink:0,marginTop:"1px" }}>{Icon.check}</span>{f}
                  </li>
                ))}
              </ul>
              {plan.bonuses?.length>0&&(
                <div style={{ marginBottom:"1.5rem",background:plan.highlight?"rgba(14,165,233,0.05)":"rgba(14,165,233,0.04)",border:`1px solid ${plan.highlight?"rgba(14,165,233,0.2)":"rgba(14,165,233,0.1)"}`,borderRadius:"8px",padding:"0.8rem" }}>
                  <div style={{ fontFamily:"'Inter',sans-serif",color:"#0ea5e9",fontSize:"0.68rem",fontWeight:700,letterSpacing:"0.08em",marginBottom:"0.5rem",display:"flex",alignItems:"center",gap:"5px" }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
                    BONUS INCLUDED
                  </div>
                  {plan.bonuses.map(b=><div key={b} style={{ fontFamily:"'Inter',sans-serif",color:plan.highlight?"#475569":"#475569",fontSize:"0.78rem",display:"flex",gap:"5px",marginTop:"3px" }}><span style={{ color:"#10b981" }}>+</span>{b}</div>)}
                </div>
              )}
              <button onClick={onCTA} style={{ width:"100%",padding:"12px",borderRadius:"8px",background:plan.highlight?"linear-gradient(135deg,#0ea5e9,#6366f1)":"rgba(255,255,255,0.06)",border:plan.highlight?"none":"1px solid rgba(255,255,255,0.08)",color:plan.highlight?"#fff":"#94a3b8",fontWeight:600,fontSize:"0.88rem",cursor:"pointer",fontFamily:"'Inter',sans-serif",transition:"all .2s" }}
                onMouseEnter={e=>{e.target.style.opacity=".88";e.target.style.transform="translateY(-1px)";}} onMouseLeave={e=>{e.target.style.opacity="1";e.target.style.transform="translateY(0)";}}>{plan.cta}</button>
            </div>
            </SR>
          ))}
        </div>
        {/* Trust Badges -- proper SVG icons */}
        <div style={{ marginTop:"2.5rem",display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"0.75rem" }}>
          {[
            { label:"SSL Secured", icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
            { label:"Razorpay Secured", icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
            { label:"Data Privacy", icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
            { label:"256-bit Encryption", icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg> },
          ].map(b=>(
            <div key={b.label} style={{ display:"flex",alignItems:"center",gap:"6px",fontFamily:"'Inter',sans-serif",color:"#64748b",fontSize:"0.75rem",padding:"6px 14px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"6px",transition:"all .2s" }}
              onMouseEnter={e=>{e.currentTarget.style.color="#94a3b8";e.currentTarget.style.borderColor="rgba(255,255,255,0.12)";}}
              onMouseLeave={e=>{e.currentTarget.style.color="#64748b";e.currentTarget.style.borderColor="rgba(255,255,255,0.08)";}}>
              <span style={{ color:"#475569",display:"flex",alignItems:"center" }}>{b.icon}</span>
              {b.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// -- FAQ -----------------------------------------------------------------------
function FAQ({ t }) {
  const [open,setOpen]=useState(null);
  const { isMobile }=useBreakpoint();
  const tf=t.faq;
  return(
    <section style={{ background:"#f8fafc",padding:isMobile?"4rem 1.5rem":"6rem 2rem",width:"100%" }}>
      <div style={{ maxWidth:"680px",margin:"0 auto" }}>
        <div style={{ textAlign:"center",marginBottom:"2.5rem" }}>
          <h2 style={{ fontFamily:"'Inter',sans-serif",fontSize:isMobile?"1.7rem":"2.1rem",fontWeight:700,color:"#0f172a",letterSpacing:"-0.03em" }}>{tf.title}</h2>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:"0.5rem" }}>
          {tf.items.map((f,i)=>(
            <div key={i} style={{ background:"#fff",border:`1px solid ${open===i?"#0ea5e9":"#e2e8f0"}`,borderRadius:"10px",overflow:"hidden",transition:"border-color .2s",boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
              <button onClick={()=>setOpen(open===i?null:i)} style={{ width:"100%",padding:"1rem 1.2rem",background:"transparent",border:"none",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",color:"#0f172a",fontFamily:"'Inter',sans-serif",fontWeight:500,fontSize:isMobile?"0.85rem":"0.9rem",textAlign:"left",gap:"1rem" }}>
                {f.q}
                <span style={{ color:"#0ea5e9",flexShrink:0,fontSize:"1.1rem",transition:"transform .3s",transform:open===i?"rotate(45deg)":"rotate(0)",display:"block",fontWeight:300 }}>+</span>
              </button>
              <div style={{ maxHeight:open===i?"200px":"0",overflow:"hidden",transition:"max-height .35s ease" }}>
                <div style={{ padding:"0 1.2rem 1rem",fontFamily:"'Inter',sans-serif",color:"#64748b",lineHeight:1.7,fontSize:"0.84rem" }}>{f.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// -- APP -----------------------------------------------------------------------
export default function Hikezo() {
  const [showChat,setShowChat]=useState(false);
  const [showAuth,setShowAuth]=useState(false);
  const [showRefund,setShowRefund]=useState(false);
  const [showPrivacy,setShowPrivacy]=useState(false);
  const [lang,setLang]=useState("en");
  const { isMobile, isTablet }=useBreakpoint();
  const t=T[lang]; const ta=t.auth;

  const [user,setUser]=useState(()=>{ try{ const s=sessionStorage.getItem("hz_user"); return s?JSON.parse(s):null; }catch{ return null; }});

  const [showBanner, setShowBanner] = useState(true);
  const handleCTA=()=>{ if(!user){setShowAuth(true);}else{setShowChat(true);} };
  const handleAuth=(d)=>{ setUser(d); setShowAuth(false); setTimeout(()=>setShowChat(true),300); };

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        html,body{width:100%;scroll-behavior:smooth;overflow-x:hidden;}
        body{background:#020817;-webkit-text-size-adjust:100%;font-family:'Inter',sans-serif;}
        #root{width:100%;overflow-x:hidden;background:#020817;}

        @keyframes fadeUp{from{opacity:0;transform:translateY(28px);}to{opacity:1;transform:translateY(0);}}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
        @keyframes scaleIn{from{opacity:0;transform:scale(0.92) translateY(12px);}to{opacity:1;transform:scale(1) translateY(0);}}
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:0;}}
        @keyframes dot{0%,80%,100%{opacity:.2;transform:scale(.7);}40%{opacity:1;transform:scale(1);}}
        @keyframes ringPulse{0%,100%{transform:scale(1);opacity:.5;}50%{transform:scale(1.08);opacity:1;}}
        @keyframes consultBob{0%,100%{transform:translateY(0);}50%{transform:translateY(-5px);}}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
        @keyframes waFloat{0%,100%{transform:translateY(0);box-shadow:0 6px 20px rgba(37,211,102,0.4);}50%{transform:translateY(-5px);box-shadow:0 12px 28px rgba(37,211,102,0.6);}}
        @keyframes floatParticle{0%,100%{transform:translateY(0) translateX(0);opacity:0.4;}50%{transform:translateY(-20px) translateX(8px);opacity:0.8;}}
        @keyframes gradShift{0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}
        @keyframes glowPulse{0%,100%{opacity:0.4;transform:scale(1);}50%{opacity:0.8;transform:scale(1.05);}}
        @keyframes numberRise{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        @keyframes lineGrow{from{transform:scaleX(0);transform-origin:left;}to{transform:scaleX(1);transform-origin:left;}}
        @keyframes badgePop{0%{opacity:0;transform:scale(0.8) translateY(6px);}100%{opacity:1;transform:scale(1) translateY(0);}}
        @keyframes shimmerSlide{0%{background-position:-200% 0;}100%{background-position:200% 0;}}

        /* Scroll reveal classes */
        .sr{opacity:0;transform:translateY(32px);transition:opacity .7s cubic-bezier(0.16,1,0.3,1),transform .7s cubic-bezier(0.16,1,0.3,1);}
        .sr.in{opacity:1 !important;transform:translateY(0) !important;}
        .sr-l{opacity:0;transform:translateX(-32px);transition:opacity .7s cubic-bezier(0.16,1,0.3,1),transform .7s cubic-bezier(0.16,1,0.3,1);}
        .sr-l.in{opacity:1 !important;transform:translateX(0) !important;}
        .sr-r{opacity:0;transform:translateX(32px);transition:opacity .7s cubic-bezier(0.16,1,0.3,1),transform .7s cubic-bezier(0.16,1,0.3,1);}
        .sr-r.in{opacity:1 !important;transform:translateX(0) !important;}
        .sr-s{opacity:0;transform:scale(0.88);transition:opacity .6s cubic-bezier(0.16,1,0.3,1),transform .6s cubic-bezier(0.16,1,0.3,1);}
        .sr-s.in{opacity:1 !important;transform:scale(1) !important;}

        ::-webkit-scrollbar{width:0px;}
        input,button{-webkit-tap-highlight-color:transparent;}
      `}</style>

      <div style={{ background:"#020817",minHeight:"100vh",width:"100vw",maxWidth:"100%",overflowX:"hidden" }}>
        {showBanner && <UrgencyBanner onCTA={handleCTA} lang={lang} onClose={()=>setShowBanner(false)}/>}
        <Navbar onCTA={handleCTA} lang={lang} setLang={setLang} t={t} user={user} bannerVisible={showBanner}/>
        <Hero onCTA={handleCTA} t={t} lang={lang}/>
        <HowItWorks t={t} onCTA={handleCTA}/>
        <Features t={t}/>
        <Testimonials t={t}/>
        <Pricing onCTA={handleCTA} t={t} lang={lang}/>
        <FAQ t={t}/>

        {/* CTA Banner */}
        <section style={{ background:"#020817",padding:isMobile?"3rem 1.5rem 4rem":isTablet?"3.5rem 2rem 5rem":"5rem 3rem 7rem",textAlign:"center",borderTop:"1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ maxWidth:"640px",margin:"0 auto",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(14,165,233,0.12)",borderRadius:"16px",padding:isMobile?"2rem 1.5rem":"3rem 2.5rem",position:"relative",overflow:"hidden" }}>
            {/* Subtle top glow */}
            <div style={{ position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:"300px",height:"1px",background:"linear-gradient(90deg,transparent,rgba(14,165,233,0.5),transparent)",pointerEvents:"none" }}/>
            <div style={{ position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:"200px",height:"60px",background:"radial-gradient(ellipse,rgba(14,165,233,0.08) 0%,transparent 70%)",pointerEvents:"none" }}/>
            <span style={{ fontFamily:"'Inter',sans-serif",color:"#0ea5e9",fontSize:"0.7rem",fontWeight:700,letterSpacing:"0.14em",background:"rgba(14,165,233,0.08)",padding:"4px 12px",borderRadius:"4px",display:"inline-block",marginBottom:"1.2rem" }}>GET STARTED TODAY</span>
            <h2 style={{ fontFamily:"'Inter',sans-serif",fontSize:isMobile?"1.5rem":"2rem",fontWeight:700,color:"#f8fafc",marginBottom:"0.7rem",letterSpacing:"-0.03em" }}>{t.cta.title}</h2>
            <p style={{ fontFamily:"'Inter',sans-serif",color:"#475569",marginBottom:"2rem",fontSize:"0.9rem",lineHeight:1.65 }}>{t.cta.sub}</p>
            <button onClick={handleCTA} style={{ padding:isMobile?"12px 24px":"13px 32px",borderRadius:"8px",background:"linear-gradient(135deg,#0ea5e9,#6366f1)",border:"none",color:"#fff",fontWeight:600,fontSize:"0.9rem",cursor:"pointer",fontFamily:"'Inter',sans-serif",boxShadow:"0 4px 20px rgba(14,165,233,0.25)",transition:"all .2s" }}
              onMouseEnter={e=>{e.target.style.transform="translateY(-2px)";e.target.style.boxShadow="0 8px 28px rgba(14,165,233,0.4)";}} onMouseLeave={e=>{e.target.style.transform="translateY(0)";e.target.style.boxShadow="0 4px 20px rgba(14,165,233,0.25)";}}>{t.cta.btn}</button>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ background:"#020817",borderTop:"1px solid rgba(255,255,255,0.06)",padding:"2rem 2rem",fontFamily:"'Inter',sans-serif" }}>
          <div style={{ maxWidth:"1100px",margin:"0 auto" }}>
            <div style={{ display:"flex",flexWrap:"wrap",justifyContent:"space-between",alignItems:"center",gap:"1rem",marginBottom:"1.5rem" }}>
              <div style={{ display:"flex",alignItems:"center",gap:"8px" }}>
<span style={{ color:"#94a3b8",fontWeight:600,fontSize:"0.9rem" }}>hike<span style={{ background:"linear-gradient(135deg,#0ea5e9,#6366f1)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>zo</span></span>
                <span style={{ color:"#1e293b",fontSize:"0.75rem",marginLeft:"0.5rem" }}>India's Career Growth Platform</span>
              </div>
              {/* Social icons */}
              <div style={{ display:"flex",gap:"0.5rem" }}>
                {[{h:"https://wa.me/919999999999",ic:Icon.wasvg},{h:"https://linkedin.com/company/hikezo",ic:Icon.lisvg},{h:"https://instagram.com/hikezo.in",ic:Icon.igsvg},{h:"https://youtube.com/@hikezo",ic:Icon.ytsvg}].map((s,i)=>(
                  <a key={i} href={s.h} target="_blank" rel="noopener noreferrer" style={{ width:32,height:32,borderRadius:"6px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"center",color:"#475569",textDecoration:"none",transition:"all .2s" }}
                    onMouseEnter={e=>{e.currentTarget.style.background="rgba(14,165,233,0.08)";e.currentTarget.style.color="#0ea5e9";e.currentTarget.style.borderColor="rgba(14,165,233,0.2)";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.color="#475569";e.currentTarget.style.borderColor="rgba(255,255,255,0.07)";}}>
                    {s.ic}
                  </a>
                ))}
              </div>
            </div>
            <div style={{ display:"flex",flexWrap:"wrap",justifyContent:"space-between",alignItems:"center",gap:"0.8rem",paddingTop:"1rem",borderTop:"1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display:"flex",gap:"1.5rem",flexWrap:"wrap" }}>
                {[["Privacy Policy","privacy"],["Terms of Service",null],["Refund Policy","refund"],["Contact Us",null]].map(([l,c])=>(
                  <a key={l} href="#" onClick={e=>{e.preventDefault();if(c==="refund")setShowRefund(true);if(c==="privacy")setShowPrivacy(true);}} style={{ color:"#334155",fontSize:"0.75rem",textDecoration:"none",transition:"color .2s",fontFamily:"'Inter',sans-serif" }}
                    onMouseEnter={e=>e.target.style.color="#64748b"} onMouseLeave={e=>e.target.style.color="#334155"}>{l}</a>
                ))}
              </div>
              <span style={{ color:"#1e293b",fontSize:"0.72rem",fontFamily:"'Inter',sans-serif" }}>{t.footer}</span>
            </div>
          </div>
        </footer>

        {/* WhatsApp FAB */}
        <a href="https://wa.me/919999999999?text=Hi%20Hikezo%2C%20I%20need%20career%20help" target="_blank" rel="noopener noreferrer"
          style={{ position:"fixed",bottom:isMobile?"1.2rem":"1.8rem",right:isMobile?"1.2rem":"1.8rem",zIndex:150,width:50,height:50,borderRadius:"50%",background:"#25D366",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 18px rgba(37,211,102,0.4)",animation:"waFloat 3s ease-in-out infinite",textDecoration:"none",color:"#fff" }}>
          {Icon.wasvg}
        </a>
      </div>

      {/* Auth Modal */}
      {showAuth&&(
        <div style={{ position:"fixed",inset:0,zIndex:400,background:"rgba(2,8,23,0.92)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",animation:"fadeIn .3s ease" }}
          onClick={e=>e.target===e.currentTarget&&setShowAuth(false)}>
          <AuthWall onAuth={handleAuth} ta={ta} isMobile={isMobile}/>
        </div>
      )}

      {/* Chat Modal */}
      {showChat&&<ChatModal onClose={()=>setShowChat(false)} t={t} lang={lang} user={user}/>}

      {/* Privacy Modal */}
      {showPrivacy&&(
        <div style={{ position:"fixed",inset:0,zIndex:300,background:"rgba(2,8,23,0.9)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",animation:"fadeIn .3s ease" }}
          onClick={e=>e.target===e.currentTarget&&setShowPrivacy(false)}>
          <div style={{ width:"100%",maxWidth:"520px",maxHeight:"80vh",overflowY:"auto",background:"#0f172a",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",padding:"2rem",animation:"scaleIn .3s ease" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem" }}>
              <h2 style={{ fontFamily:"'Inter',sans-serif",color:"#f1f5f9",fontWeight:700,fontSize:"1.1rem" }}>Privacy Policy</h2>
              <button onClick={()=>setShowPrivacy(false)} style={{ background:"rgba(255,255,255,0.05)",border:"none",color:"#475569",cursor:"pointer",width:28,height:28,borderRadius:"6px",display:"flex",alignItems:"center",justifyContent:"center" }}>x</button>
            </div>
            <div style={{ fontFamily:"'Inter',sans-serif",color:"#64748b",lineHeight:1.75,fontSize:"0.86rem",display:"flex",flexDirection:"column",gap:"1.2rem" }}>
              <p style={{ color:"#334155",fontSize:"0.76rem" }}>Last updated: January 2025</p>
              {[{title:"Information We Collect",body:"We collect name, email, mobile, and career details you provide. Payment data is processed securely by Razorpay and never stored on our servers."},{title:"How We Use Your Data",body:"Your data is used only to provide career consultation services, improve our platform, and send service updates. We never sell your data."},{title:"Data Security",body:"All data is encrypted with 256-bit SSL. We implement industry-standard security to protect your information."},{title:"Cookies & Tracking",body:"We use analytics tools and Meta Pixel to improve our services. You can opt out via browser settings."},{title:"Contact",body:"For privacy concerns: support@hikezo.in. We respond within 48 hours."}].map(s=>(
                <div key={s.title}>
                  <p style={{ color:"#f1f5f9",fontWeight:600,marginBottom:"0.3rem",fontSize:"0.88rem" }}>{s.title}</p>
                  <p>{s.body}</p>
                </div>
              ))}
            </div>
            <button onClick={()=>setShowPrivacy(false)} style={{ width:"100%",marginTop:"1.5rem",padding:"11px",background:"linear-gradient(135deg,#0ea5e9,#6366f1)",border:"none",borderRadius:"8px",color:"#fff",fontWeight:600,fontSize:"0.88rem",cursor:"pointer",fontFamily:"'Inter',sans-serif" }}>Close</button>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefund&&(
        <div style={{ position:"fixed",inset:0,zIndex:300,background:"rgba(2,8,23,0.9)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",animation:"fadeIn .3s ease" }}
          onClick={e=>e.target===e.currentTarget&&setShowRefund(false)}>
          <div style={{ width:"100%",maxWidth:"460px",background:"#0f172a",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",padding:"2rem",animation:"scaleIn .3s ease" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem" }}>
              <h2 style={{ fontFamily:"'Inter',sans-serif",color:"#f1f5f9",fontWeight:700,fontSize:"1.1rem" }}>Refund Policy</h2>
              <button onClick={()=>setShowRefund(false)} style={{ background:"rgba(255,255,255,0.05)",border:"none",color:"#475569",cursor:"pointer",width:28,height:28,borderRadius:"6px",display:"flex",alignItems:"center",justifyContent:"center" }}>x</button>
            </div>
            <div style={{ fontFamily:"'Inter',sans-serif",color:"#64748b",lineHeight:1.75,fontSize:"0.86rem",display:"flex",flexDirection:"column",gap:"1rem" }}>
              <p>At Hikezo, we believe in transparency. Please read our policy carefully before purchasing.</p>
              <div style={{ background:"rgba(239,68,68,0.05)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:"8px",padding:"1rem" }}>
                <p style={{ color:"#f1f5f9",fontWeight:600,marginBottom:"0.4rem" }}>No Refund Policy</p>
                <p>All payments on Hikezo are <strong style={{ color:"#f1f5f9" }}>final and non-refundable</strong>. We do not offer refunds, partial refunds, or credits for any reason.</p>
              </div>
              <p>We recommend trying our <strong style={{ color:"#0ea5e9" }}>Free Plan</strong> before upgrading.</p>
              <p style={{ fontSize:"0.78rem",color:"#334155" }}>Billing queries: support@hikezo.in</p>
            </div>
            <button onClick={()=>setShowRefund(false)} style={{ width:"100%",marginTop:"1.5rem",padding:"11px",background:"linear-gradient(135deg,#0ea5e9,#6366f1)",border:"none",borderRadius:"8px",color:"#fff",fontWeight:600,fontSize:"0.88rem",cursor:"pointer",fontFamily:"'Inter',sans-serif" }}>I Understand</button>
          </div>
        </div>
      )}
    </>
  );
}