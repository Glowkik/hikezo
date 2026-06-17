import { useState, useEffect, useRef } from "react";
import Auth from "./Auth";
import OfferCompare from "./OfferCompare";
import SalaryCalculator from "./SalaryCalculator";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

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
function getEmailKey(email) {
  // Consistent key across all devices — btoa gives stable base64
  try { return btoa(email.toLowerCase().trim()).replace(/[^a-z0-9]/gi,'_'); } catch { return email.replace(/[^a-z0-9]/gi,'_'); }
}
function getLimitData(email) { 
  try { 
    const key = email ? "hz_usage_" + getEmailKey(email) : "hz_usage";
    const r = localStorage.getItem(key); 
    const d = r ? JSON.parse(r) : { count: 0, plan: "free" }; 
    return d; 
  } catch { return { count: 0, plan: "free" }; } 
}
function saveLimitData(d, email) { 
  try { 
    const key = email ? "hz_usage_" + getEmailKey(email) : "hz_usage";
    localStorage.setItem(key, JSON.stringify(d));
    if(email && db) {
      setDoc(doc(db, "usage", getEmailKey(email)), d, {merge:true}).catch(()=>{});
    }
  } catch {} 
}

// Load trial data from Firestore (cross-device)
async function loadFirestoreUsage(email) {
  try {
    if(!email || !db) return null;
    const snap = await getDoc(doc(db, "usage", getEmailKey(email)));
    if(snap.exists()) return snap.data();
    return null;
  } catch { return null; }
}

// Save chat history to Firestore
async function saveFirestoreChat(email, msgs) {
  try {
    if(!email || !db) return;
    // Save last 20 messages only to keep size small
    const toSave = msgs.slice(-20);
    await setDoc(doc(db, "chats", getEmailKey(email)), { msgs: toSave, updatedAt: Date.now() }, {merge:true});
  } catch {}
}

// Load chat history from Firestore
async function loadFirestoreChat(email) {
  try {
    if(!email || !db) return null;
    const snap = await getDoc(doc(db, "chats", getEmailKey(email)));
    if(snap.exists()) return snap.data().msgs || null;
    return null;
  } catch { return null; }
}

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
  { name: "Priya Sharma", role: "Career Consultant", exp: "8 yrs - 2,400+ sessions", emoji: "PS", specialty: "Salary Negotiation", color: "#0ea5e9", persona: "You are Priya Sharma, a warm Senior Career Consultant at hikezo specializing in salary negotiation with 8 years helping Indian professionals." },
  { name: "Arjun Mehta", role: "Career Consultant", exp: "6 yrs - 1,800+ sessions", emoji: "AM", specialty: "Career Roadmap", color: "#8b5cf6", persona: "You are Arjun Mehta, an enthusiastic Career Growth Specialist at hikezo with 6 years creating career roadmaps for Indian professionals." },
  { name: "Neha Gupta", role: "Career Consultant", exp: "5 yrs - 1,600+ sessions", emoji: "NG", specialty: "Resume & LinkedIn", color: "#ec4899", persona: "You are Neha Gupta, a creative LinkedIn and Resume Expert at hikezo with 5 years transforming Indian professionals' career presence." },
  { name: "Rahul Verma", role: "Career Consultant", exp: "7 yrs - 2,100+ sessions", emoji: "RV", specialty: "Interview Prep", color: "#f59e0b", persona: "You are Rahul Verma, a confident Interview Coach at hikezo with 7 years preparing Indian professionals for top company interviews." },
  { name: "Ananya Singh", role: "Career Consultant", exp: "4 yrs - 1,200+ sessions", emoji: "AS", specialty: "Tech Careers", color: "#10b981", persona: "You are Ananya Singh, a tech-focused Career Consultant at hikezo with 4 years helping IT professionals grow in top tech companies." },
  { name: "Vikram Nair", role: "Career Consultant", exp: "9 yrs - 2,700+ sessions", emoji: "VN", specialty: "Leadership & Management", color: "#6366f1", persona: "You are Vikram Nair, a Leadership Career Coach at hikezo with 9 years helping Indian professionals transition into management roles." },
  { name: "Kavitha Reddy", role: "Career Consultant", exp: "6 yrs - 1,900+ sessions", emoji: "KR", specialty: "Finance Careers", color: "#f97316", persona: "You are Kavitha Reddy, a Finance Career Specialist at hikezo with 6 years guiding professionals in banking, fintech and finance roles." },
  { name: "Rohan Joshi", role: "Career Consultant", exp: "5 yrs - 1,500+ sessions", emoji: "RJ", specialty: "Product Management", color: "#0ea5e9", persona: "You are Rohan Joshi, a Product Management Career Coach at hikezo with 5 years helping professionals break into and grow in PM roles." },
  { name: "Shruti Kapoor", role: "Career Consultant", exp: "7 yrs - 2,000+ sessions", emoji: "SK", specialty: "HR & People Roles", color: "#8b5cf6", persona: "You are Shruti Kapoor, an HR Career Specialist at hikezo with 7 years guiding HR professionals to senior People roles." },
  { name: "Aditya Kumar", role: "Career Consultant", exp: "4 yrs - 1,100+ sessions", emoji: "AK", specialty: "Data & Analytics", color: "#ec4899", persona: "You are Aditya Kumar, a Data Career Consultant at hikezo with 4 years helping data analysts and scientists grow their careers." },
  { name: "Pooja Iyer", role: "Career Consultant", exp: "6 yrs - 1,700+ sessions", emoji: "PI", specialty: "Marketing Careers", color: "#f59e0b", persona: "You are Pooja Iyer, a Marketing Career Expert at hikezo with 6 years helping marketing professionals land top brand and growth roles." },
  { name: "Siddharth Rao", role: "Career Consultant", exp: "8 yrs - 2,300+ sessions", emoji: "SR", specialty: "Sales & Business Dev", color: "#10b981", persona: "You are Siddharth Rao, a Sales Career Coach at hikezo with 8 years helping sales professionals negotiate better packages and grow faster." },
  { name: "Meera Pillai", role: "Career Consultant", exp: "5 yrs - 1,400+ sessions", emoji: "MP", specialty: "Operations & Supply Chain", color: "#6366f1", persona: "You are Meera Pillai, an Operations Career Specialist at hikezo with 5 years helping ops professionals grow in top companies." },
  { name: "Karan Malhotra", role: "Career Consultant", exp: "7 yrs - 2,200+ sessions", emoji: "KM", specialty: "Consulting & Strategy", color: "#f97316", persona: "You are Karan Malhotra, a Strategy Career Coach at hikezo with 7 years helping professionals break into consulting and strategy roles." },
  { name: "Divya Menon", role: "Career Consultant", exp: "4 yrs - 1,300+ sessions", emoji: "DM", specialty: "Design & UX Careers", color: "#0ea5e9", persona: "You are Divya Menon, a Design Career Specialist at hikezo with 4 years helping UX designers and product designers grow their careers." },
  { name: "Nikhil Bansal", role: "Career Consultant", exp: "6 yrs - 1,800+ sessions", emoji: "NB", specialty: "Startup Careers", color: "#8b5cf6", persona: "You are Nikhil Bansal, a Startup Career Coach at hikezo with 6 years helping professionals navigate startup ecosystems and growth roles." },
  { name: "Tanvi Shah", role: "Career Consultant", exp: "5 yrs - 1,600+ sessions", emoji: "TS", specialty: "Women in Leadership", color: "#ec4899", persona: "You are Tanvi Shah, a Career Coach at hikezo specializing in helping women professionals grow into leadership and senior roles." },
  { name: "Ravi Shankar", role: "Career Consultant", exp: "9 yrs - 2,600+ sessions", emoji: "RS", specialty: "IT & Infrastructure", color: "#f59e0b", persona: "You are Ravi Shankar, an IT Career Specialist at hikezo with 9 years helping infrastructure and DevOps professionals grow." },
  { name: "Ishaan Chowdhury", role: "Career Consultant", exp: "4 yrs - 1,200+ sessions", emoji: "IC", specialty: "AI & ML Careers", color: "#10b981", persona: "You are Ishaan Chowdhury, an AI/ML Career Consultant at hikezo with 4 years helping data scientists and ML engineers grow." },
  { name: "Sunita Desai", role: "Career Consultant", exp: "7 yrs - 2,000+ sessions", emoji: "SD", specialty: "Healthcare & Pharma", color: "#6366f1", persona: "You are Sunita Desai, a Healthcare Career Specialist at hikezo with 7 years guiding pharma and healthcare professionals." },
  { name: "Harsh Agarwal", role: "Career Consultant", exp: "5 yrs - 1,500+ sessions", emoji: "HA", specialty: "E-commerce Careers", color: "#f97316", persona: "You are Harsh Agarwal, an E-commerce Career Coach at hikezo with 5 years helping professionals grow in top e-commerce companies." },
  { name: "Preethi Subramaniam", role: "Career Consultant", exp: "6 yrs - 1,700+ sessions", emoji: "PS2", specialty: "BFSI Sector", color: "#0ea5e9", persona: "You are Preethi Subramaniam, a BFSI Career Specialist at hikezo with 6 years helping banking and insurance professionals grow." },
  { name: "Mohit Saxena", role: "Career Consultant", exp: "8 yrs - 2,400+ sessions", emoji: "MS", specialty: "Government & PSU", color: "#8b5cf6", persona: "You are Mohit Saxena, a Career Consultant at hikezo with 8 years helping professionals navigate government and PSU career paths." },
  { name: "Deepa Krishnan", role: "Career Consultant", exp: "5 yrs - 1,400+ sessions", emoji: "DK", specialty: "Education Sector", color: "#ec4899", persona: "You are Deepa Krishnan, an Education Career Specialist at hikezo with 5 years helping educators and edtech professionals grow." },
  { name: "Rajesh Pillai", role: "Career Consultant", exp: "10 yrs - 3,000+ sessions", emoji: "RP", specialty: "C-Suite Transitions", color: "#f59e0b", persona: "You are Rajesh Pillai, a Senior Career Coach at hikezo with 10 years helping mid-senior professionals transition to C-suite roles." },
  { name: "Nisha Tiwari", role: "Career Consultant", exp: "4 yrs - 1,100+ sessions", emoji: "NT", specialty: "Content & Media", color: "#10b981", persona: "You are Nisha Tiwari, a Content Career Specialist at hikezo with 4 years helping content creators and media professionals grow." },
  { name: "Suresh Babu", role: "Career Consultant", exp: "7 yrs - 2,100+ sessions", emoji: "SB", specialty: "Manufacturing & Core", color: "#6366f1", persona: "You are Suresh Babu, a Core Engineering Career Coach at hikezo with 7 years helping manufacturing and core engineers grow." },
  { name: "Ankita Pandey", role: "Career Consultant", exp: "5 yrs - 1,500+ sessions", emoji: "AP", specialty: "Legal & Compliance", color: "#f97316", persona: "You are Ankita Pandey, a Legal Career Specialist at hikezo with 5 years helping legal and compliance professionals grow." },
  { name: "Vivek Menon", role: "Career Consultant", exp: "6 yrs - 1,800+ sessions", emoji: "VM", specialty: "International Careers", color: "#0ea5e9", persona: "You are Vivek Menon, an International Career Coach at hikezo with 6 years helping Indian professionals land global opportunities." },
  { name: "Ritika Arora", role: "Career Consultant", exp: "4 yrs - 1,200+ sessions", emoji: "RA", specialty: "Early Career & Freshers", color: "#8b5cf6", persona: "You are Ritika Arora, an Early Career Specialist at hikezo with 4 years helping freshers and early professionals get their first big break." },
  { name: "Gaurav Tiwari", role: "Career Consultant", exp: "8 yrs - 2,300+ sessions", emoji: "GT", specialty: "Cybersecurity Careers", color: "#ec4899", persona: "You are Gaurav Tiwari, a Cybersecurity Career Coach at hikezo with 8 years helping security professionals grow in top tech companies." },
  { name: "Lavanya Nair", role: "Career Consultant", exp: "5 yrs - 1,600+ sessions", emoji: "LN", specialty: "Supply Chain & Logistics", color: "#f59e0b", persona: "You are Lavanya Nair, a Supply Chain Career Specialist at hikezo with 5 years helping logistics professionals grow." },
  { name: "Amit Khanna", role: "Career Consultant", exp: "7 yrs - 2,000+ sessions", emoji: "AK2", specialty: "Real Estate & Infra", color: "#10b981", persona: "You are Amit Khanna, a Real Estate Career Coach at hikezo with 7 years helping professionals in real estate and infrastructure." },
  { name: "Swati Bose", role: "Career Consultant", exp: "6 yrs - 1,900+ sessions", emoji: "SB2", specialty: "Research & Academia", color: "#6366f1", persona: "You are Swati Bose, a Research Career Specialist at hikezo with 6 years helping researchers and academics transition to industry roles." },
  { name: "Pranav Kulkarni", role: "Career Consultant", exp: "5 yrs - 1,400+ sessions", emoji: "PK", specialty: "Cloud & DevOps", color: "#f97316", persona: "You are Pranav Kulkarni, a Cloud Career Coach at hikezo with 5 years helping DevOps and cloud engineers grow in top tech firms." },
  { name: "Archana Bhat", role: "Career Consultant", exp: "8 yrs - 2,500+ sessions", emoji: "AB", specialty: "Diversity & Inclusion Careers", color: "#0ea5e9", persona: "You are Archana Bhat, a DEI Career Specialist at hikezo with 8 years helping diverse professionals navigate and grow in corporate India." },
];
function getConsultantForUser(userEmail) {
  // Deterministic — same email = same consultant always, no random, no storage needed
  let hash = 0;
  const email = userEmail.toLowerCase().trim();
  for(let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
  return CONSULTANTS[Math.abs(hash) % CONSULTANTS.length];
}
function getRandConsultant() { return CONSULTANTS[Math.floor(Math.random() * CONSULTANTS.length)]; }

const T = {
  en: {
    nav: { features: "Features", pricing: "Pricing", cta: "Try Free" },
    hero: {
      badge: "500+ Professionals Got Their Salary Hike",
      h1a: "Upload Your Resume.", h1b: "Get a Free Career Consultation.",
      sub: "Find out if you're underpaid, get a salary negotiation script, and a step-by-step career plan — all in one place. Free to start.",
      cta: "Upload Resume — It's Free", demo: "See How It Works",
      social: "professionals got salary hikes",
    },
    how: { label: "HOW IT WORKS", title: "Get Career Clarity in 4 Simple Steps", sub: "No fluff. Just results.", cta: "Get Started Free →",
      steps: [
        { title: "Upload Your Resume", desc: "Upload your resume in seconds. No sign up needed to start." },
        { title: "Get Your Career Score", desc: "AI analyzes your resume and tells you exactly what's holding you back." },
        { title: "Talk to Your Consultant", desc: "Chat with a specialist — salary negotiation, career roadmap, interview prep." },
        { title: "Get the Raise You Deserve", desc: "Use your personalized script. Walk in confident. Walk out with more money." },
      ]
    },
    features: { label: "WHAT YOU GET", title: "Everything You Need to Earn More",
      items: [
        { title: "Resume Analysis", desc: "Upload your resume — get a detailed score and know exactly what to fix to get more callbacks." },
        { title: "Salary Negotiation Script", desc: "Word-for-word script to use in your next appraisal or offer negotiation. Proven to get 30-45% hikes." },
        { title: "Career Roadmap", desc: "A clear plan — what to do this week, this month, and this year to reach your next salary level." },
        { title: "Skills Gap Finder", desc: "Find out exactly which skills you're missing that companies pay a premium for — and how to get them fast." },
        { title: "Interview Preparation", desc: "Practice with real questions from top companies. Walk into your next interview fully prepared." },
        { title: "Salary Benchmarking", desc: "See what people in your role, city, and experience level are actually earning right now." },
      ]
    },
    testi: { label: "SUCCESS STORIES", title: "Real People. Real Results.",
      items: [
        { name: "Rahul Sharma", role: "Software Engineer, Bengaluru", text: "Used hikezo's script in my appraisal. Got 40% hike — from 8 LPA to 11.2 LPA. The roadmap helped me plan my next 2 years clearly. Best Rs.399 I ever spent.", av: "RS" },
        { name: "Priya Menon", role: "Product Manager, Mumbai", text: "Skills gap analysis showed exactly what I was missing for Senior PM. Followed the roadmap, cleared those gaps in 4 months, got promoted with 35% hike.", av: "PM" },
        { name: "Arjun Kapoor", role: "Data Analyst, Hyderabad", text: "hikezo prepped me for Swiggy and PhonePe interviews specifically. Got both offers. Chose PhonePe at 18 LPA — 60% jump from my previous 11 LPA.", av: "AK" },
      ]
    },
    pricing: { label: "PRICING", title: "Start Free. Upgrade When You're Ready.", sub: "The avg hikezo user earns ₹2.8L more per year. Plans start at just ₹399/month.",
      plans: [
        { name: "Free", price: "Rs.0", period: "forever", features: ["Resume upload & basic score", "3 AI consultant messages/day", "Salary range for your role", "Basic career advice"], bonuses: [], cta: "Start For Free", highlight: false },
        { name: "Pro", price: "Rs.399", originalPrice: "Rs.649", discount: "38% OFF", period: "per month", features: ["Everything in Free", "Unlimited AI consultant chat", "Full resume analysis & fix suggestions", "Salary negotiation script", "6-month career roadmap", "Skills gap analysis", "Interview prep Q&A", "Offer letter review"], bonuses: ["Resume Template", "Salary Negotiation PDF", "LinkedIn Checklist"], cta: "Get Pro Plan", highlight: true },
        { name: "Elite", price: "Rs.799", originalPrice: "Rs.1,299", discount: "38% OFF", period: "per month", features: ["Everything in Pro", "Mock interview practice", "LinkedIn profile review", "Priority consultant access", "Weekly progress check-ins", "Compare up to 4 job offers"], bonuses: ["Resume Template", "Salary Negotiation PDF", "LinkedIn Checklist", "Top 50 Interview Questions", "30-Day Career Plan"], cta: "Get Elite Plan", highlight: false },
      ]
    },
    faq: { title: "Common Questions",
      items: [
        { q: "What exactly does hikezo do?", a: "hikezo is an AI-powered career consultation platform. Upload your resume, get a free score, then chat with an AI consultant for salary negotiation scripts, career roadmaps, and interview prep — built specifically for Indian professionals." },
        { q: "Is it really free to start?", a: "Yes — upload your resume and get your career score completely free. No credit card needed. You get 3 free AI consultant messages per day on the free plan." },
        { q: "Who are hikezo's consultants?", a: "hikezo uses AI consultants trained on thousands of real salary negotiations, career progressions, and interview experiences in the Indian job market." },
        { q: "How soon will I see results?", a: "Most users get a clear negotiation strategy and action plan in their very first session — within minutes of signing up." },
        { q: "What's the difference between Pro and Elite?", a: "Pro covers all core tools — unlimited chat, resume analysis, salary script, and career roadmap. Elite adds mock interviews, LinkedIn review, priority access, and weekly check-ins." },
        { q: "Is my data safe?", a: "Yes — all conversations are encrypted. We never share or sell your personal data." },
        { q: "Is payment secure?", a: "All payments are processed through Razorpay — India's most trusted payment gateway." },
      ]
    },
    cta: { title: "Find Out What You're Really Worth", sub: "Upload your resume free — get your career score, salary insights, and a personalized action plan in minutes.", btn: "Upload Resume — It's Free →" },
    footer: "(c) 2025 hikezo.in | India's Career Growth Platform",
    auth: { signupTitle: "Create Free Account", loginTitle: "Welcome Back", signupSub: "Free — No credit card needed", loginSub: "Login to continue", namePh: "Full Name", emailPh: "Email Address", mobilePh: "Mobile Number (10 digits)", passPh: "Password (min 6 chars)", signupBtn: "Create Account & Start →", loginBtn: "Login & Continue →", thinking: "Please wait...", toLogin: "Already have an account?", toSignup: "Don't have an account?", loginLink: "Login", signupLink: "Sign Up Free", privacy: "🔒 Your data is secure. We never spam or sell your information.", success: "Opening your consultation..." },
    chat: { thinking: " is typing...", inputPh: "Ask anything about your career...", badge: "AI-Assisted", upgrade: "Upgrade →", freeLeft: (n) => `${n} free message${n !== 1 ? "s" : ""} left`, upgradeTitle: "Free Limit Reached", upgradeSub: `You've used all ${FREE_LIMIT} free messages. Upgrade for unlimited access.`, upgradeBtn: "Upgrade Now →", later: "Maybe later" },
    connect: { title: "Finding Your Consultant...", steps: (name) => ["Checking availability...", "Matching you with the best fit...", `${name} is ready for you!`] },
  },
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

// — CUSTOM CURSOR ——————————————————————————————-
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
        {[{n:"Pro",p:"Rs399/mo",h:true,link:"https://rzp.io/rzp/DNfBx2L3"},{n:"Elite",p:"Rs799/mo",h:false,link:"https://rzp.io/rzp/HqU3cDU"}].map(pl=>(
          <div key={pl.n} onClick={()=>window.open(pl.link,"_blank")} style={{ padding:"0.85rem 1rem",marginBottom:"0.6rem",background:pl.h?"rgba(16,185,129,0.06)":"rgba(255,255,255,0.03)",border:`1px solid ${pl.h?"rgba(16,185,129,0.25)":"rgba(255,255,255,0.08)"}`,borderRadius:"10px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",transition:"all .2s" }}
            onMouseEnter={e=>e.currentTarget.style.transform="scale(1.02)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
            <span style={{ fontFamily:"'Inter',sans-serif",color:"#f1f5f9",fontWeight:600,fontSize:"0.9rem" }}>{pl.n}</span>
            <span style={{ fontFamily:"'Inter',sans-serif",color:"#10b981",fontWeight:700 }}>{pl.p}</span>
          </div>
        ))}
        <button onClick={()=>window.open("https://rzp.io/rzp/DNfBx2L3","_blank")} style={{ width:"100%",padding:"12px",background:"linear-gradient(135deg,#10b981,#0ea5e9)",border:"none",borderRadius:"10px",color:"#fff",fontWeight:700,fontSize:"0.9rem",cursor:"pointer",fontFamily:"'Inter',sans-serif",marginTop:"0.5rem",marginBottom:"0.6rem" }}>{tc.upgradeBtn}</button>
        <button onClick={onClose} style={{ background:"none",border:"none",color:"#475569",cursor:"pointer",fontFamily:"'Inter',sans-serif",fontSize:"0.8rem" }}>{tc.later}</button>
      </div>
    </div>
  );
}

// — CONNECTING SCREEN ————————————————————————————-
function ConnectingScreen({ c, lang, onDone }) {
  const [step,setStep]=useState(0);
  const [prog,setProg]=useState(0);
  const [tipIdx,setTipIdx]=useState(0);
  const tips = [
    { icon:"💰", title:"Negotiate your salary", desc:"Share your current salary and target - get a script" },
    { icon:"🗺️", title:"Get a career roadmap", desc:"Tell your role and experience - get next steps" },
    { icon:"🎯", title:"Prep for interviews", desc:"Share the company name - get specific prep" },
    { icon:"📝", title:"Improve your resume", desc:"Share your role and wins - get a rewrite" },
  ];
  useEffect(()=>{
    const ts=[8000,14000,24000].map((d,i)=>setTimeout(()=>setStep(i),d));
    const iv=setInterval(()=>setProg(p=>Math.min(p+1.5,100)),450);
    const tipIv=setInterval(()=>setTipIdx(i=>(i+1)%tips.length),2500);
    const dn=setTimeout(onDone,30000);
    return()=>{ts.forEach(clearTimeout);clearInterval(iv);clearInterval(tipIv);clearTimeout(dn);}
  },[]);
  const steps=[`Checking consultant availability...`,`Matching you with the best fit...`,`${c.name} is ready for you!`];
  return(
    <div style={{ position:"fixed",inset:0,zIndex:300,background:"rgba(2,8,23,0.97)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",animation:"fadeIn .4s ease" }}>
      <div style={{ textAlign:"center",maxWidth:"420px",width:"100%" }}>
        <div style={{ position:"relative",width:80,height:80,margin:"0 auto 1.5rem" }}>
          <div style={{ position:"absolute",inset:-10,borderRadius:"50%",border:`2px solid ${c.color}30`,animation:"ringPulse 2s ease-in-out infinite" }}/>
          <div style={{ position:"absolute",inset:-5,borderRadius:"50%",border:`2px solid ${c.color}50`,animation:"ringPulse 2s ease-in-out .4s infinite" }}/>
          <div style={{ width:80,height:80,borderRadius:"50%",background:`linear-gradient(135deg,${c.color},${c.color}99)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem",boxShadow:`0 8px 32px ${c.color}40`,animation:"consultBob 3s ease-in-out infinite" }}>{c.emoji}</div>
        </div>
        <h2 style={{ fontFamily:"'Inter',sans-serif",color:"#f1f5f9",fontSize:"1.15rem",fontWeight:700,marginBottom:"0.3rem" }}>Finding Your Consultant...</h2>
        <p style={{ fontFamily:"'Inter',sans-serif",color:"#64748b",fontSize:"0.82rem",marginBottom:"1.5rem",minHeight:"1.4em" }}>{steps[step]}</p>
        <div style={{ width:"100%",height:"3px",background:"rgba(255,255,255,0.06)",borderRadius:"3px",overflow:"hidden",marginBottom:"2rem" }}>
          <div style={{ height:"100%",background:`linear-gradient(90deg,${c.color},${c.color}80)`,width:`${prog}%`,transition:"width .45s ease",borderRadius:"3px" }}/>
        </div>
        <div style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"12px",padding:"1rem 1.2rem" }}>
          <p style={{ fontFamily:"'Inter',sans-serif",color:"#475569",fontSize:"0.65rem",fontWeight:600,letterSpacing:"0.1em",marginBottom:"0.8rem" }}>WHILE YOU WAIT - GET READY TO SHARE:</p>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.6rem" }}>
            {tips.map((tip,i)=>(
              <div key={i} style={{ background:i===tipIdx?"rgba(14,165,233,0.08)":"rgba(255,255,255,0.02)",border:`1px solid ${i===tipIdx?"rgba(14,165,233,0.2)":"rgba(255,255,255,0.05)"}`,borderRadius:"8px",padding:"0.7rem",textAlign:"left",transition:"all .4s ease" }}>
                <div style={{ fontSize:"1.1rem",marginBottom:"0.3rem" }}>{tip.icon}</div>
                <div style={{ fontFamily:"'Inter',sans-serif",color:i===tipIdx?"#e2e8f0":"#64748b",fontSize:"0.72rem",fontWeight:600,marginBottom:"0.2rem" }}>{tip.title}</div>
                <div style={{ fontFamily:"'Inter',sans-serif",color:"#334155",fontSize:"0.65rem",lineHeight:1.4 }}>{tip.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// — CHAT MODAL ————————————————————————————————
function ChatModal({ onClose, t, lang, user }) {
  const [c]=useState(()=>user?.email ? getConsultantForUser(user.email) : getRandConsultant());
  const { isMobile }=useBreakpoint();
  useEffect(()=>{
    const handleEsc=(e)=>{ if(e.key==="Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return ()=>window.removeEventListener("keydown", handleEsc);
  },[]);
  const chatKey = user?.email ? "hz_chat_" + getEmailKey(user.email) : "hz_chat_guest";
  const [phase,setPhase]=useState("loading");
  const [msgs,setMsgs]=useState([]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [showUp,setShowUp]=useState(false);
  const [usage,setUsage]=useState(()=>getLimitData(user?.email));
  const [usageLoaded, setUsageLoaded]=useState(!user?.email);

  // Load chat history + usage from Firestore on open
  useEffect(()=>{
    if(user?.email){
      Promise.all([
        loadFirestoreChat(user.email),
        loadFirestoreUsage(user.email)
      ]).then(([chatData, usageData])=>{
        // Sync usage
        if(usageData){
          const localData = getLimitData(user.email);
          const planRank = {"free":0,"pro":1,"elite":2};
          const finalData = (usageData.count||0) >= (localData.count||0) || (planRank[usageData.plan||"free"]||0) > (planRank[localData.plan||"free"]||0) ? usageData : localData;
          const key = "hz_usage_" + getEmailKey(user.email);
          localStorage.setItem(key, JSON.stringify(finalData));
          setUsage(finalData);
        }
        // Sync chat
        if(chatData && chatData.length > 0){
          setMsgs(chatData);
          setPhase("chat");
        } else {
          const local = (() => { try { const h = localStorage.getItem(chatKey); return h ? JSON.parse(h) : []; } catch { return []; }})();
          if(local.length > 0){ setMsgs(local); setPhase("chat"); }
          else { setPhase("connecting"); }
        }
        setUsageLoaded(true);
      }).catch(()=>{ setPhase("connecting"); setUsageLoaded(true); });
    } else {
      setPhase("connecting");
      setUsageLoaded(true);
    }
  },[]);
  const ref=useRef(null);
  const isPro=usage.plan==="pro"||usage.plan==="elite";
  const rem=isPro?Infinity:Math.max(0,FREE_LIMIT-usage.count);
  const tc=t.chat;

  const welcome=`Hi${user?.name?` ${user.name.split(" ")[0]}`:""}! I'm ${c.name}, ${c.role} at hikezo.\n\nI'm here to help with:\n Salary negotiation\n Career roadmap\n Skills gap analysis\n Resume improvement\n Interview preparation\n\nWhat's on your mind today?`;

  const sys=`${c.persona}\n\nYou are NOT an AI. You are a human consultant at hikezo. Speak warmly and professionally. Reference India-specific context (salaries in INR, companies like TCS/Infosys/Flipkart, cities like Bengaluru/Mumbai/Hyderabad). Never say you are AI. Keep responses concise and actionable. Respond in English.`;

  const connected=()=>{ setPhase("chat"); setTimeout(()=>setMsgs([{r:"a",t:welcome}]),600); };
  useEffect(()=>{ ref.current?.scrollIntoView({behavior:"smooth"}); },[msgs]);

  const send=async()=>{
    if(!input.trim()||loading)return;
    if(!isPro&&usage.count>=FREE_LIMIT){setShowUp(true);return;}
    const txt=input.trim(); setInput("");
    const updatedWithUser=[...msgs,{r:"u",t:txt}];
    setMsgs(updatedWithUser);
    try{localStorage.setItem(chatKey,JSON.stringify(updatedWithUser));}catch{}
    if(user?.email) saveFirestoreChat(user.email, updatedWithUser);
    setLoading(true);
    const nd={...usage,count:usage.count+1}; setUsage(nd); saveLimitData(nd, user?.email);
    try{
      const hist=msgs.map(m=>({role:m.r==="a"?"assistant":"user",content:m.t}));
      const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json","x-user-plan":usage.plan||"free"},body:JSON.stringify({system:sys,messages:[...hist,{role:"user",content:txt}]})});
      const d=await res.json();
      const rep=d.content?.map(x=>x.text||"").join("")||"Sorry, connection issue. Give me a moment!";
      setMsgs(p=>{const updated=[...p,{r:"a",t:rep}];try{localStorage.setItem(chatKey,JSON.stringify(updated));}catch{}if(user?.email)saveFirestoreChat(user.email,updated);return updated;});
      if(!isPro&&nd.count>=FREE_LIMIT)setTimeout(()=>setShowUp(true),1500);
    }catch{ setMsgs(p=>[...p,{r:"a",t:"Sorry, connection issue. Give me a moment!"}]); }
    setLoading(false);
  };

  const isSmall=isMobile;

  return(
    <>
      {phase==="loading"&&<div style={{ position:"fixed",inset:0,zIndex:300,background:"rgba(2,8,23,0.97)",display:"flex",alignItems:"center",justifyContent:"center" }}><span style={{ fontFamily:"'Inter',sans-serif",fontWeight:800,fontSize:"1.5rem",color:"#f1f5f9" }}>hike<span style={{ background:"linear-gradient(135deg,#0ea5e9,#6366f1)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>zo</span></span></div>}
      {phase==="connecting"&&<ConnectingScreen c={c} lang={lang} onDone={connected}/>}
      {phase==="chat"&&(
        <div style={{ position:"fixed",inset:0,zIndex:200,background:isSmall?"#0f172a":"rgba(2,8,23,0.9)",backdropFilter:isSmall?"none":"blur(12px)",display:"flex",alignItems:isSmall?"stretch":"center",justifyContent:"center",padding:isSmall?"0":"1rem",animation:"fadeIn .3s ease" }}
          onClick={e=>!isSmall&&e.target===e.currentTarget&&onClose()}>
          <div style={{ width:"100%",maxWidth:isSmall?"100%":"560px",height:isSmall?"100%":"660px",background:"#0f172a",border:isSmall?"none":"1px solid rgba(255,255,255,0.08)",borderRadius:isSmall?"0":"20px",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 32px 80px rgba(0,0,0,0.6)",position:"relative" }}>
            {showUp&&<UpgradePopup onClose={()=>setShowUp(false)} onUpgrade={()=>{onClose();document.getElementById("pricing")?.scrollIntoView({behavior:"smooth"});}} tc={tc}/>}
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
                {msgs.length>0&&!showUp&&rem>0&&<button onClick={()=>{setMsgs([]);try{localStorage.removeItem(chatKey);}catch{}if(user?.email)saveFirestoreChat(user.email,[]);setPhase("connecting");}} style={{ background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"5px",color:"#475569",cursor:"pointer",fontSize:"0.62rem",padding:"2px 8px",fontFamily:"'Inter',sans-serif" }}>New Chat</button>}
                <button onClick={onClose} style={{ background:"rgba(255,255,255,0.05)",border:"none",color:"#475569",cursor:"pointer",width:28,height:28,borderRadius:"6px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.9rem" }}>x</button>
              </div>
            </div>
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
  const timerText = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
  return(
    <div style={{ position:"fixed",top:0,left:0,right:0,zIndex:200,background:"linear-gradient(90deg,#0a1628,#0f2040,#0a1628)",borderBottom:"1px solid rgba(14,165,233,0.2)",height:"37px",display:"flex",alignItems:"center",overflow:"hidden" }}>
      <style>{`@keyframes marquee{0%{transform:translateX(0);}100%{transform:translateX(-50%);}}`}</style>
      <div style={{ display:"flex",whiteSpace:"nowrap",animation:"marquee 35s linear infinite",cursor:"pointer" }} onClick={onCTA}>
        {[0,1].map(idx=>(
          <div key={idx} style={{ display:"inline-flex",whiteSpace:"nowrap" }}>
            {[0,1,2,3,4,5,6,7].map(i=>(
              <span key={i} style={{ display:"inline-flex",alignItems:"center",gap:"6px",padding:"0 1.5rem",fontFamily:"'Inter',sans-serif",fontSize:"0.72rem" }}>
                <span style={{ color:"#94a3b8" }}>Limited Offer:</span>
                <span style={{ color:"#f1f5f9",fontWeight:600 }}>Pro plan</span>
                <span style={{ color:"#475569",textDecoration:"line-through" }}>649/mo</span>
                <span style={{ color:"#10b981",fontWeight:700 }}>399/mo</span>
                <span style={{ background:"linear-gradient(135deg,#10b981,#0ea5e9)",borderRadius:"3px",padding:"1px 6px",color:"#fff",fontSize:"0.6rem",fontWeight:700 }}>38% OFF</span>
                <span style={{ color:"#64748b" }}>|</span>
                <span style={{ color:"#fca5a5",fontSize:"0.7rem" }}>Ends in</span>
                <span style={{ color:"#f87171",fontWeight:700,fontVariantNumeric:"tabular-nums" }}>{timerText}</span>
                <span style={{ color:"#334155" }}>•</span>
              </span>
            ))}
          </div>
        ))}
      </div>
      <button onClick={()=>{setShow(false);onClose&&onClose();}}
        style={{ position:"absolute",right:"8px",top:"50%",transform:"translateY(-50%)",background:"rgba(255,255,255,0.05)",border:"none",color:"#475569",cursor:"pointer",width:22,height:22,borderRadius:"4px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.75rem",zIndex:1 }}>
        x
      </button>
    </div>
  );
}
function Navbar({ onCTA, lang, setLang, t, user, bannerVisible=true, onLogout, onCompare, onSalary }) {
  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(()=>{ const fn=()=>setScrolled(window.scrollY>20); window.addEventListener("scroll",fn,{passive:true}); return()=>window.removeEventListener("scroll",fn); },[]);
  const tn = t.nav;
  return (
    <nav style={{ position:"fixed",top:bannerVisible?"37px":"0px",transition:"top .3s ease, box-shadow .3s ease, background .3s ease",left:0,right:0,zIndex:100,height:isMobile?"60px":"68px",background:scrolled?"rgba(255,255,255,0.97)":"rgba(255,255,255,0.92)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderBottom:scrolled?"1px solid #e2e8f0":"1px solid rgba(226,232,240,0.6)",boxShadow:scrolled?"0 4px 24px rgba(0,0,0,0.06)":"none",display:"flex",alignItems:"center",justifyContent:"space-between",padding:isMobile?"0 1.2rem":isTablet?"0 1.5rem":"0 2.5rem" }}>
      {/* Logo */}
      <div style={{ display:"flex",alignItems:"center",gap:"9px" }}>
        <span style={{ fontFamily:"'Inter',sans-serif",fontWeight:800,fontSize:isMobile?"1.5rem":isTablet?"1.6rem":"1.8rem",color:"#0f172a",letterSpacing:"-0.04em" }}>hike<span style={{ background:"linear-gradient(135deg,#0ea5e9,#6366f1)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>zo</span></span>
      </div>

      {isDesktop ? (
        <div style={{ display:"flex",gap:"0.25rem",alignItems:"center" }}>
          {[["#features",tn.features],["#pricing",tn.pricing]].map(([h,l])=>(
            <a key={h} href={h} style={{ color:"#64748b",textDecoration:"none",fontSize:"0.85rem",fontFamily:"'Inter',sans-serif",fontWeight:500,padding:"6px 14px",borderRadius:"8px",transition:"all .2s" }}
              onMouseEnter={e=>{e.target.style.color="#0f172a";e.target.style.background="#f1f5f9";}} onMouseLeave={e=>{e.target.style.color="#64748b";e.target.style.background="transparent";}}>{l}</a>
          ))}
          <div style={{ width:"1px",height:"20px",background:"#e2e8f0",margin:"0 0.5rem" }}/>
          <button onClick={()=>document.getElementById("salary-calculator")?.scrollIntoView({behavior:"smooth"})} style={{ background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.25)",borderRadius:"7px",color:"#059669",cursor:"pointer",padding:"7px 14px",fontFamily:"'Inter',sans-serif",fontSize:"0.82rem",fontWeight:600,transition:"all .2s" }} onMouseEnter={e=>{e.target.style.background="rgba(16,185,129,0.15)";}} onMouseLeave={e=>{e.target.style.background="rgba(16,185,129,0.08)";}}>💰 Salary Calc</button>
          <button onClick={onCompare} style={{ background:"rgba(14,165,233,0.08)",border:"1px solid rgba(14,165,233,0.25)",borderRadius:"7px",color:"#0284c7",cursor:"pointer",padding:"7px 14px",fontFamily:"'Inter',sans-serif",fontSize:"0.82rem",fontWeight:600,transition:"all .2s" }} onMouseEnter={e=>{e.target.style.background="rgba(14,165,233,0.15)";}} onMouseLeave={e=>{e.target.style.background="rgba(14,165,233,0.08)";}}>📊 Compare Offers</button>
          <div style={{ width:"1px",height:"20px",background:"#e2e8f0",margin:"0 0.5rem" }}/>
          {user&&<div style={{ display:"flex",alignItems:"center",gap:"7px",padding:"5px 10px",background:"#f8fafc",borderRadius:"8px",border:"1px solid #e2e8f0" }}>
            <div style={{ width:26,height:26,borderRadius:"50%",background:"linear-gradient(135deg,#0ea5e9,#6366f1)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:"0.65rem",color:"#fff" }}>{user.name?.charAt(0).toUpperCase()}</div>
            <span style={{ fontFamily:"'Inter',sans-serif",color:"#374151",fontSize:"0.82rem",fontWeight:500 }}>{user.name?.split(" ")[0]}</span>
            <button onClick={onLogout} style={{ background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:"5px",color:"#dc2626",cursor:"pointer",fontSize:"0.68rem",padding:"3px 8px",fontFamily:"'Inter',sans-serif",fontWeight:600,transition:"all .2s" }}
              onMouseEnter={e=>{e.target.style.background="rgba(239,68,68,0.15)";}} onMouseLeave={e=>{e.target.style.background="rgba(239,68,68,0.08)";}}>Logout</button>
          </div>}
          <button onClick={onCTA} style={{ padding:"9px 20px",borderRadius:"8px",background:"linear-gradient(135deg,#0ea5e9,#6366f1)",border:"none",color:"#fff",fontWeight:700,fontSize:"0.85rem",cursor:"pointer",fontFamily:"'Inter',sans-serif",boxShadow:"0 2px 12px rgba(14,165,233,0.3)",transition:"all .25s" }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 6px 20px rgba(14,165,233,0.4)";}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 2px 12px rgba(14,165,233,0.3)";}}>{tn.cta}</button>
        </div>
      ) : (
        <div style={{ display:"flex",alignItems:"center",gap:"8px" }}>
          {isTablet&&<a href="#pricing" style={{ color:"#64748b",textDecoration:"none",fontSize:"0.82rem",fontFamily:"'Inter',sans-serif" }}>{tn.pricing}</a>}
          {isTablet&&<button onClick={onCTA} style={{ padding:"7px 16px",borderRadius:"7px",background:"linear-gradient(135deg,#0ea5e9,#6366f1)",border:"none",color:"#fff",fontWeight:700,fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Inter',sans-serif" }}>{tn.cta}</button>}
          {isMobile&&<div style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <button onClick={onCTA} style={{ padding:"7px 14px",borderRadius:"7px",background:"linear-gradient(135deg,#0ea5e9,#6366f1)",border:"none",color:"#fff",fontWeight:700,fontSize:"0.78rem",cursor:"pointer",fontFamily:"'Inter',sans-serif" }}>{tn.cta}</button>
            <button onClick={()=>setMenuOpen(!menuOpen)} style={{ background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:"7px",color:"#374151",cursor:"pointer",width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem" }}>{menuOpen?"✕":"☰"}</button>
          </div>}
        </div>
      )}

      {isMobile&&menuOpen&&(
        <div style={{ position:"absolute",top:"60px",left:0,right:0,background:"#fff",borderBottom:"1px solid #e2e8f0",padding:"1rem",display:"flex",flexDirection:"column",gap:"0.5rem",animation:"fadeUp .2s ease",boxShadow:"0 8px 24px rgba(0,0,0,0.08)" }}>
          {[["#features",tn.features],["#pricing",tn.pricing]].map(([h,l])=>(
            <a key={h} href={h} onClick={()=>setMenuOpen(false)} style={{ color:"#374151",textDecoration:"none",fontFamily:"'Inter',sans-serif",fontSize:"0.95rem",fontWeight:500,padding:"0.7rem 0.8rem",borderRadius:"8px",borderBottom:"1px solid #f1f5f9" }}>{l}</a>
          ))}
          <button onClick={()=>{document.getElementById("salary-calculator")?.scrollIntoView({behavior:"smooth"});setMenuOpen(false);}} style={{ padding:"12px",background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:"8px",color:"#059669",fontWeight:600,fontSize:"0.92rem",cursor:"pointer",fontFamily:"'Inter',sans-serif",textAlign:"left" }}>💰 Salary Calculator</button>
          <button onClick={()=>{onCompare();setMenuOpen(false);}} style={{ padding:"12px",background:"rgba(14,165,233,0.08)",border:"1px solid rgba(14,165,233,0.2)",borderRadius:"8px",color:"#0284c7",fontWeight:600,fontSize:"0.92rem",cursor:"pointer",fontFamily:"'Inter',sans-serif",textAlign:"left" }}>📊 Compare Offers</button>
          <button onClick={()=>{onCTA();setMenuOpen(false);}} style={{ padding:"13px",background:"linear-gradient(135deg,#0ea5e9,#6366f1)",border:"none",borderRadius:"8px",color:"#fff",fontWeight:700,fontSize:"0.95rem",cursor:"pointer",fontFamily:"'Inter',sans-serif",marginTop:"0.3rem" }}>{tn.cta}</button>
          {user&&<button onClick={()=>{onLogout();setMenuOpen(false);}} style={{ padding:"12px",background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:"8px",color:"#dc2626",fontWeight:600,fontSize:"0.92rem",cursor:"pointer",fontFamily:"'Inter',sans-serif" }}>Logout</button>}
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
  useEffect(()=>{ const iv=setInterval(()=>setCount(c=>{ if(c>=500){clearInterval(iv);return 500;} return c+8; }),15); return()=>clearInterval(iv); },[]);
  const [typed, setTyped] = useState("");
  const words = ["Negotiate Your Salary","Get Your Dream Job","Ace Every Interview","Build Your Career Roadmap","Know Your Market Value"];
  const [wi, setWi] = useState(0);
  useEffect(()=>{
    let i=0,del=false,cur=words[wi];
    const iv=setInterval(()=>{ if(!del){setTyped(cur.slice(0,i+1));i++;if(i===cur.length){setTimeout(()=>{del=true;},1200);}} else{setTyped(cur.slice(0,i-1));i--;if(i===0){del=false;setWi(p=>(p+1)%words.length);cur=words[(wi+1)%words.length];}} },del?40:85);
    return()=>clearInterval(iv);
  },[wi]);

  return(
    <section style={{ background:"linear-gradient(160deg,#050B18 0%,#0A1628 50%,#050B18 100%)",minHeight:isMobile?"100vh":"95vh",display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center",padding:isMobile?"9rem 1.2rem 3rem":isTablet?"9rem 2rem 4rem":"10rem 2rem 5rem",position:"relative",overflow:"hidden" }}>

      {/* Animated mesh gradient */}
      <div style={{ position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden" }}>
        <div style={{ position:"absolute",top:"-20%",left:"-10%",width:"600px",height:"600px",background:"radial-gradient(circle,rgba(14,165,233,0.12) 0%,transparent 70%)",animation:"meshMove 15s ease infinite" }}/>
        <div style={{ position:"absolute",bottom:"-20%",right:"-10%",width:"500px",height:"500px",background:"radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 70%)",animation:"meshMove 20s ease infinite reverse" }}/>
        <div style={{ position:"absolute",top:"30%",right:"20%",width:"300px",height:"300px",background:"radial-gradient(circle,rgba(14,165,233,0.06) 0%,transparent 70%)",animation:"glowPulse 8s ease infinite" }}/>
      </div>

      {/* Grid pattern */}
      <div style={{ position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(14,165,233,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,0.03) 1px,transparent 1px)",backgroundSize:"60px 60px",pointerEvents:"none",maskImage:"radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)",WebkitMaskImage:"radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)" }}/>

      {/* Floating result cards */}
      {!isMobile && (
        <>
          <div style={{ position:"absolute",left:"4%",top:"30%",background:"rgba(255,255,255,0.06)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"14px",padding:"14px 18px",animation:"cardFloat 4s ease infinite",boxShadow:"0 8px 32px rgba(0,0,0,0.2)" }}>
            <div style={{ display:"flex",alignItems:"center",gap:"10px" }}>
              <div style={{ width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#10b981,#059669)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem" }}>💰</div>
              <div>
                <div style={{ fontFamily:"'Inter',sans-serif",fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",marginBottom:"2px" }}>V.N. got</div>
                <div style={{ fontFamily:"'Inter',sans-serif",fontSize:"0.95rem",fontWeight:700,color:"#10b981" }}>+₹4.7L/year</div>
              </div>
            </div>
          </div>
          <div style={{ position:"absolute",right:"4%",top:"25%",background:"rgba(255,255,255,0.06)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"14px",padding:"14px 18px",animation:"cardFloat2 5s ease infinite",boxShadow:"0 8px 32px rgba(0,0,0,0.2)" }}>
            <div style={{ display:"flex",alignItems:"center",gap:"10px" }}>
              <div style={{ width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem" }}>📈</div>
              <div>
                <div style={{ fontFamily:"'Inter',sans-serif",fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",marginBottom:"2px" }}>S.R. got promoted</div>
                <div style={{ fontFamily:"'Inter',sans-serif",fontSize:"0.95rem",fontWeight:700,color:"#a78bfa" }}>+28% hike</div>
              </div>
            </div>
          </div>
          <div style={{ position:"absolute",left:"6%",bottom:"20%",background:"rgba(255,255,255,0.06)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"14px",padding:"14px 18px",animation:"cardFloat2 6s ease infinite",boxShadow:"0 8px 32px rgba(0,0,0,0.2)" }}>
            <div style={{ display:"flex",alignItems:"center",gap:"10px" }}>
              <div style={{ width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#f59e0b,#d97706)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem" }}>🎯</div>
              <div>
                <div style={{ fontFamily:"'Inter',sans-serif",fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",marginBottom:"2px" }}>K.M. landed</div>
                <div style={{ fontFamily:"'Inter',sans-serif",fontSize:"0.95rem",fontWeight:700,color:"#fbbf24" }}>PhonePe 18 LPA</div>
              </div>
            </div>
          </div>
          <div style={{ position:"absolute",right:"6%",bottom:"22%",background:"rgba(255,255,255,0.06)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"14px",padding:"14px 18px",animation:"cardFloat 7s ease infinite",boxShadow:"0 8px 32px rgba(0,0,0,0.2)" }}>
            <div style={{ display:"flex",alignItems:"center",gap:"10px" }}>
              <div style={{ width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#ec4899,#db2777)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem" }}>⭐</div>
              <div>
                <div style={{ fontFamily:"'Inter',sans-serif",fontSize:"0.7rem",color:"rgba(255,255,255,0.5)",marginBottom:"2px" }}>Rating</div>
                <div style={{ fontFamily:"'Inter',sans-serif",fontSize:"0.95rem",fontWeight:700,color:"#f472b6" }}>4.9/5 stars</div>
              </div>
            </div>
          </div>
        </>
      )}

      <div style={{ position:"relative",zIndex:1,maxWidth:"760px",width:"100%" }}>

        {/* Live badge */}
        <div style={{ display:"inline-flex",alignItems:"center",gap:"8px",background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.25)",borderRadius:"100px",padding:"6px 16px",marginBottom:"1.5rem",animation:"fadeUp .5s ease both" }}>
          <div style={{ width:7,height:7,borderRadius:"50%",background:"#10b981",animation:"pulse 1.5s infinite",boxShadow:"0 0 8px rgba(16,185,129,0.6)" }}/>
          <span style={{ color:"#86efac",fontSize:"0.72rem",fontWeight:600,fontFamily:"'Inter',sans-serif",letterSpacing:"0.04em" }}>
            {liveUsers} professionals getting career help right now
          </span>
        </div>

        {/* Main headline */}
        <h1 style={{ fontFamily:"'Inter',sans-serif",fontSize:isMobile?"clamp(2rem,8vw,2.8rem)":isTablet?"clamp(2.5rem,5vw,3.4rem)":"clamp(3rem,5vw,4rem)",fontWeight:900,lineHeight:1.05,color:"#f8fafc",maxWidth:"720px",margin:"0 auto 0.6rem",letterSpacing:"-0.04em",animation:"fadeUp .7s ease .1s both" }}>
          Upload Your Resume.
          <br/>
          <span style={{ background:"linear-gradient(135deg,#0ea5e9 0%,#6366f1 50%,#0ea5e9 100%)",backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"gradShift 4s ease infinite" }}>
            Get a Free Career Consultation.
          </span>
        </h1>

        {/* Typewriter */}
        <div style={{ fontFamily:"'Inter',sans-serif",fontSize:isMobile?"0.9rem":"1rem",color:"#64748b",marginBottom:"1rem",animation:"fadeUp .7s ease .15s both",minHeight:"1.5em" }}>
          AI helps you{" "}
          <span style={{ color:"#0ea5e9",fontWeight:600 }}>{typed}</span>
          <span style={{ animation:"blink 1s step-end infinite",color:"#0ea5e9" }}>|</span>
        </div>

        {/* Sub */}
        <p style={{ fontFamily:"'Inter',sans-serif",fontSize:isMobile?"0.88rem":"0.94rem",color:"#475569",maxWidth:"500px",lineHeight:1.7,margin:"0 auto 2rem",animation:"fadeUp .7s ease .2s both" }}>
          {th.sub}
        </p>

        {/* CTAs */}
        <div style={{ display:"flex",gap:"0.8rem",justifyContent:"center",flexWrap:"wrap",animation:"fadeUp .7s ease .3s both" }}>
          <button onClick={onCTA} className="hz-btn-primary" style={{ padding:isMobile?"13px 26px":"15px 32px",borderRadius:"10px",fontSize:"0.96rem",boxShadow:"0 4px 24px rgba(14,165,233,0.4)",display:"flex",alignItems:"center",gap:"8px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Upload Resume — Free
          </button>
          <button onClick={onCTA} style={{ padding:isMobile?"13px 22px":"15px 26px",borderRadius:"10px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",color:"#94a3b8",fontWeight:600,fontSize:"0.9rem",cursor:"pointer",fontFamily:"'Inter',sans-serif",transition:"all .25s ease",backdropFilter:"blur(8px)" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(14,165,233,0.4)";e.currentTarget.style.color="#e2e8f0";e.currentTarget.style.background="rgba(14,165,233,0.08)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.12)";e.currentTarget.style.color="#94a3b8";e.currentTarget.style.background="rgba(255,255,255,0.06)";}}>
            See How It Works →
          </button>
        </div>

        {/* Trust */}
        <p style={{ fontFamily:"'Inter',sans-serif",color:"rgba(255,255,255,0.2)",fontSize:"0.75rem",marginTop:"1.2rem",animation:"fadeUp .7s ease .35s both" }}>
          Free to start &nbsp;·&nbsp; No credit card &nbsp;·&nbsp; Results in first session
        </p>

        {/* Social proof */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:"12px",marginTop:"2rem",animation:"fadeUp .7s ease .4s both",flexWrap:"wrap" }}>
          <div style={{ display:"flex" }}>
            {["RS","PM","AK","MK","SJ"].map((a,i)=>(
              <div key={a} style={{ width:30,height:30,borderRadius:"50%",background:`linear-gradient(135deg,hsl(${200+i*30},70%,45%),hsl(${220+i*30},70%,35%))`,border:"2px solid #050B18",marginLeft:i===0?0:"-8px",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:"0.55rem",color:"#fff",boxShadow:"0 2px 8px rgba(0,0,0,0.3)" }}>{a}</div>
            ))}
          </div>
          <span style={{ fontFamily:"'Inter',sans-serif",color:"#475569",fontSize:"0.8rem" }}>
            <strong style={{ color:"#94a3b8" }}>{count.toLocaleString()}+</strong> {th.social}
          </span>
          <div style={{ display:"flex",gap:"2px",alignItems:"center" }}>
            {[1,2,3,4,5].map(s=><span key={s} style={{ color:"#f59e0b",fontSize:"0.82rem" }}>★</span>)}
            <span style={{ fontFamily:"'Inter',sans-serif",color:"#64748b",fontSize:"0.78rem",marginLeft:"4px" }}>4.9/5</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:"flex",gap:"1.5rem",justifyContent:"center",marginTop:"2.5rem",flexWrap:"wrap",animation:"fadeUp .7s ease .45s both" }}>
          {[["500+","Professionals helped"],["40%","Avg salary hike"],["4.9/5","User rating"]].map(([v,l])=>(
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Inter',sans-serif",fontSize:isMobile?"1.4rem":"1.6rem",fontWeight:800,background:"linear-gradient(135deg,#0ea5e9,#6366f1)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>{v}</div>
              <div style={{ fontFamily:"'Inter',sans-serif",fontSize:"0.72rem",color:"#475569",marginTop:"2px" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── SOCIAL PROOF STRIP ───────────────────────────────────────────────────────
function SocialProofStrip() {
  const companies = ["Google","Microsoft","Amazon","Flipkart","Swiggy","Infosys","TCS","PhonePe","Zomato","Razorpay","Wipro","HCL"];
  return(
    <section style={{ background:"#f8fafc",borderTop:"1px solid #e2e8f0",borderBottom:"1px solid #e2e8f0",padding:"16px 0",overflow:"hidden" }}>
      <style>{`@keyframes stripScroll{0%{transform:translateX(0);}100%{transform:translateX(-50%);}}`}</style>
      <p style={{ textAlign:"center",fontFamily:"'Inter',sans-serif",fontSize:"0.65rem",color:"#94a3b8",marginBottom:"12px",letterSpacing:"0.1em",fontWeight:600 }}>
        PROFESSIONALS FROM THESE COMPANIES GOT THEIR HIKE
      </p>
      <div style={{ display:"flex",alignItems:"center",overflow:"hidden" }}>
        <div style={{ display:"inline-flex",alignItems:"center",animation:"stripScroll 22s linear infinite",whiteSpace:"nowrap" }}>
          {[...companies,...companies].map((c,i)=>(
            <span key={i} style={{ display:"inline-flex",alignItems:"center",gap:"6px",padding:"0 2rem",fontFamily:"'Inter',sans-serif",fontSize:"0.82rem",fontWeight:600,color:"#64748b" }}>
              <span style={{ width:5,height:5,borderRadius:"50%",background:"linear-gradient(135deg,#0ea5e9,#6366f1)",display:"inline-block" }}/>
              {c}
            </span>
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
    <section id="features" style={{ background:"#ffffff",padding:isMobile?"4rem 1.5rem":isTablet?"5rem 2rem":"7rem 3rem",width:"100%" }} ref={ref}>
      <div style={{ maxWidth:"1100px",margin:"0 auto" }}>
        <div style={{ textAlign:"center",marginBottom:"3.5rem" }}>
          <span style={{ fontFamily:"'Inter',sans-serif",color:"#0ea5e9",fontSize:"0.7rem",fontWeight:700,letterSpacing:"0.14em",background:"rgba(14,165,233,0.08)",padding:"4px 14px",borderRadius:"100px",border:"1px solid rgba(14,165,233,0.15)" }}>{tf.label}</span>
          <h2 style={{ fontFamily:"'Inter',sans-serif",fontSize:isMobile?"1.8rem":"2.4rem",fontWeight:800,color:"#0f172a",marginTop:"1rem",letterSpacing:"-0.04em",lineHeight:1.15 }}>{tf.title}</h2>
          <p style={{ fontFamily:"'Inter',sans-serif",fontSize:"0.95rem",color:"#64748b",marginTop:"0.6rem" }}>Everything you need to earn what you're worth.</p>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":isTablet?"repeat(2,1fr)":"repeat(3,1fr)",gap:"1.2rem" }}>
          {tf.items.map((f,i)=>(
            <SR key={f.title} cls="sr" delay={i*80}>
              <div className="hz-card" style={{ padding:"1.8rem",cursor:"default",height:"100%",display:"flex",flexDirection:"column" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="#0ea5e9";e.currentTarget.style.boxShadow="0 8px 32px rgba(14,165,233,0.1)";e.currentTarget.style.transform="translateY(-4px)";const ic=e.currentTarget.querySelector(".feat-icon");if(ic){ic.style.transform="scale(1.1) rotate(-5deg)";ic.style.background="rgba(14,165,233,0.12)";ic.style.borderColor="rgba(14,165,233,0.3)";}}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="#f1f5f9";e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="translateY(0)";const ic=e.currentTarget.querySelector(".feat-icon");if(ic){ic.style.transform="scale(1) rotate(0deg)";ic.style.background="rgba(14,165,233,0.06)";ic.style.borderColor="rgba(14,165,233,0.12)";}}}> 
                <div className="feat-icon" style={{ width:44,height:44,borderRadius:"12px",background:"rgba(14,165,233,0.06)",border:"1px solid rgba(14,165,233,0.12)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"1.2rem",color:"#0ea5e9",transition:"all .3s ease",flexShrink:0 }}>{FEAT_ICONS[i]}</div>
                <h3 style={{ fontFamily:"'Inter',sans-serif",color:"#0f172a",fontWeight:700,fontSize:"1rem",marginBottom:"0.5rem" }}>{f.title}</h3>
                <p style={{ fontFamily:"'Inter',sans-serif",color:"#64748b",lineHeight:1.7,fontSize:"0.85rem",flex:1 }}>{f.desc}</p>
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
  const [active, setActive]=useState(0);
  const reviews = [
    { name:"V.N.", role:"Senior Developer, TCS → Infosys", av:"VN", color:"#0ea5e9", text:"Was stuck at 9.5 LPA for 2 years. Used hikezo's salary script before my Infosys interview — they offered 14.2 LPA. The consultant told me exactly what numbers to say and when to stay quiet. Game changer." },
    { name:"S.R.", role:"Product Manager, Hyderabad", av:"SR", color:"#8b5cf6", text:"I had no idea I was 30% underpaid compared to market. hikezo's benchmarking showed me the data, and the negotiation script helped me get a 28% correction at my current company itself. Didn't even need to switch." },
    { name:"K.M.", role:"Data Analyst, Delhi → Bengaluru", av:"KM", color:"#10b981", text:"Had 3 offers and no idea how to compare or negotiate them. hikezo's consultant helped me evaluate each and counter-negotiate — converted a 15L offer to 18.5L. Best decision I made." },
    { name:"A.S.", role:"Marketing Manager, Mumbai", av:"AS", color:"#f59e0b", text:"Was preparing for appraisal for weeks with no direction. One session gave me a clear script and talking points. Got 22% hike — highest in my team." },
    { name:"R.G.", role:"Software Engineer, Pune", av:"RG", color:"#ec4899", text:"Fresh out of college, didn't know how to negotiate my first offer. hikezo taught me the exact framework — converted a 6 LPA offer to 8.2 LPA just by knowing what to say." },
    { name:"D.S.", role:"HR Business Partner, Noida", av:"DS", color:"#6366f1", text:"hikezo's career roadmap helped me identify the path from HRBP to CHRO track. Got promoted within 8 months of following the plan. Highly recommend." },
  ];
  useEffect(()=>{
    const iv = setInterval(()=>{ setActive(a=>(a+1)%reviews.length); }, 3500);
    return ()=>clearInterval(iv);
  },[]);
  const visible = isMobile ? [active] : [active, (active+1)%reviews.length, (active+2)%reviews.length];
  return(
    <section style={{ background:"#f8fafc",padding:isMobile?"4rem 1.5rem":"6rem 2rem",width:"100%",overflow:"hidden" }} ref={ref}>
      <div style={{ maxWidth:"1100px",margin:"0 auto" }}>
        <div style={{ textAlign:"center",marginBottom:"3rem" }}>
          <span style={{ fontFamily:"'Inter',sans-serif",color:"#0ea5e9",fontSize:"0.7rem",fontWeight:700,letterSpacing:"0.14em",background:"rgba(14,165,233,0.08)",padding:"4px 12px",borderRadius:"4px" }}>{tt.label}</span>
          <h2 style={{ fontFamily:"'Inter',sans-serif",fontSize:isMobile?"1.7rem":"2.2rem",fontWeight:700,color:"#0f172a",marginTop:"1rem",letterSpacing:"-0.03em" }}>{tt.title}</h2>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(3,1fr)",gap:"1.2rem",transition:"all .5s ease" }}>
          {visible.map((idx,i)=>{
            const t2=reviews[idx];
            return(
              <div key={idx} style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:"12px",padding:"1.8rem",boxShadow:"0 1px 4px rgba(0,0,0,0.05)",position:"relative",display:"flex",flexDirection:"column",animation:"fadeUp .5s ease",transition:"all .3s ease" }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 12px 32px rgba(14,165,233,0.1)";e.currentTarget.style.borderColor="rgba(14,165,233,0.25)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.05)";e.currentTarget.style.borderColor="#e2e8f0";}}>
                <div style={{ position:"absolute",top:"1rem",right:"1.2rem",fontFamily:"Georgia,serif",fontSize:"4rem",color:"rgba(14,165,233,0.08)",lineHeight:1,pointerEvents:"none",userSelect:"none" }}>"</div>
                <div style={{ display:"flex",gap:"2px",marginBottom:"1rem" }}>
                  {[1,2,3,4,5].map(s=><span key={s} style={{ color:"#f59e0b",fontSize:"0.82rem" }}>★</span>)}
                </div>
                <p style={{ fontFamily:"'Inter',sans-serif",color:"#374151",lineHeight:1.7,fontSize:"0.88rem",marginBottom:"1.4rem",flex:1 }}>{t2.text}</p>
                <div style={{ display:"flex",alignItems:"center",gap:"10px",paddingTop:"1rem",borderTop:"1px solid #f1f5f9" }}>
                  <div style={{ width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${t2.color},${t2.color}99)`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"0.72rem",color:"#fff",fontFamily:"'Inter',sans-serif",flexShrink:0 }}>{t2.av}</div>
                  <div>
                    <div style={{ fontFamily:"'Inter',sans-serif",color:"#0f172a",fontWeight:600,fontSize:"0.85rem" }}>{t2.name}</div>
                    <div style={{ fontFamily:"'Inter',sans-serif",color:"#94a3b8",fontSize:"0.72rem" }}>{t2.role}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Dots */}
        <div style={{ display:"flex",justifyContent:"center",gap:"6px",marginTop:"2rem" }}>
          {reviews.map((_,i)=>(
            <div key={i} onClick={()=>setActive(i)} style={{ width:i===active?"20px":"6px",height:"6px",borderRadius:"3px",background:i===active?"#0ea5e9":"#cbd5e1",cursor:"pointer",transition:"all .3s ease" }}/>
          ))}
        </div>
        <p style={{ textAlign:"center",marginTop:"1.2rem",fontFamily:"'Inter',sans-serif",fontSize:"0.7rem",color:"#94a3b8" }}>* Names abbreviated for privacy. Results based on user-reported outcomes and may vary.</p>
      </div>
    </section>
  );
}

// -- SALARY SECTION (inline on page) ------------------------------------------
function SalarySection({ onCTA, isMobile }) {
  const [ctc, setCtc] = useState("");
  const [city, setCity] = useState("metro");
  const [regime, setRegime] = useState("new");
  const [result, setResult] = useState(null);

  function calcSal(ctcVal, cityVal, regimeVal) {
    const annual = parseFloat(ctcVal) * 100000;
    if (!annual || annual <= 0) return null;
    const basic = Math.round(annual * 0.35);
    const pf_employer = Math.min(Math.round(basic * 0.12), 21600);
    const gratuity = Math.round(basic * 0.0481);
    const gross = annual - pf_employer - gratuity;
    const hra = cityVal==="metro" ? Math.round(basic*0.50) : Math.round(basic*0.40);
    const lta = Math.round(annual*0.04);
    const special = Math.max(0, gross - basic - hra - lta);
    const pf_emp = Math.min(Math.round(basic*0.12), 21600);
    const pt = 2400;
    let tax = 0;
    if (regimeVal==="new") {
      const nt = Math.max(0, gross - pf_emp - pt - 75000);
      if (nt > 1200000) {
        if (nt>300000) tax+=Math.min(nt-300000,300000)*0.05;
        if (nt>600000) tax+=Math.min(nt-600000,300000)*0.10;
        if (nt>900000) tax+=Math.min(nt-900000,300000)*0.15;
        if (nt>1200000) tax+=Math.min(nt-1200000,300000)*0.20;
        if (nt>1500000) tax+=(nt-1500000)*0.30;
      }
    } else {
      const he = Math.max(0, Math.min(hra, cityVal==="metro"?basic*0.50:basic*0.40, hra-basic*0.10));
      const nt = Math.max(0, gross-pf_emp-pt-50000-he-Math.min(pf_emp+50000,150000));
      if (nt>500000) tax = nt<=1000000 ? 12500+(nt-500000)*0.20 : 112500+(nt-1000000)*0.30;
      if (nt<=500000) tax=0;
    }
    const tds = Math.round(tax*1.04/12);
    const mb=Math.round(basic/12), mh=Math.round(hra/12), ms=Math.max(0,Math.round(special/12));
    const ml=Math.round(lta/12), mp=Math.round(pf_emp/12);
    const inhand = mb+mh+ms+ml-mp-200-tds;
    const pct = Math.round(((annual-inhand*12)/annual)*100);
    return { inhand:Math.max(0,inhand), basic:mb, hra:mh, special:ms, lta:ml, pf:mp, tds, pct:Math.max(0,pct) };
  }

  const fmt = n => "₹"+n.toLocaleString("en-IN");

  return (
    <section id="salary-calculator" style={{ background:"#f8fafc", padding:isMobile?"4rem 1.2rem":"6rem 2rem", width:"100%", borderTop:"1px solid #e2e8f0" }}>
      <div style={{ maxWidth:"780px", margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:"2.5rem" }}>
          <span style={{ fontFamily:"'Inter',sans-serif", color:"#10b981", fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.14em", background:"rgba(16,185,129,0.08)", padding:"4px 12px", borderRadius:"4px" }}>FREE TOOL</span>
          <h2 style={{ fontFamily:"'Inter',sans-serif", fontSize:isMobile?"1.7rem":"2.2rem", fontWeight:700, color:"#0f172a", marginTop:"1rem", marginBottom:"0.5rem", letterSpacing:"-0.03em" }}>What's Your Actual In-Hand Salary?</h2>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.9rem", color:"#64748b" }}>Enter your CTC — see exactly what lands in your bank account every month.</p>
        </div>

        <div style={{ background:"#fff", borderRadius:"16px", padding:isMobile?"1.4rem":"2rem", border:"1px solid #e2e8f0", boxShadow:"0 4px 24px rgba(0,0,0,0.06)", marginBottom:"1.5rem" }}>
          <div style={{ marginBottom:"1.2rem" }}>
            <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.72rem", fontWeight:600, color:"#64748b", marginBottom:"5px", letterSpacing:"0.04em", textTransform:"uppercase" }}>Your CTC</div>
            <div style={{ position:"relative" }}>
              <span style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", color:"#64748b", fontFamily:"'Inter',sans-serif" }}>₹</span>
              <input type="number" value={ctc} onChange={e=>{ const v=parseFloat(e.target.value); if(e.target.value===""||( v>0&&v<=500)) setCtc(e.target.value); }} placeholder="e.g. 8" onKeyDown={e=>e.key==="Enter"&&setResult(calcSal(ctc,city,regime))}
                style={{ width:"100%", padding:"12px 70px 12px 28px", borderRadius:"8px", border:"1.5px solid #e2e8f0", background:"#f8fafc", color:"#0f172a", fontFamily:"'Inter',sans-serif", fontSize:"1.2rem", fontWeight:700, outline:"none", boxSizing:"border-box" }}
                onFocus={e=>e.target.style.borderColor="#10b981"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
              <span style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", fontFamily:"'Inter',sans-serif", fontSize:"0.82rem", color:"#94a3b8", fontWeight:600 }}>LPA</span>
            </div>
            <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.68rem", color:"#94a3b8", marginTop:"4px" }}>Enter in Lakhs — type "8" for ₹8 LPA (₹8,00,000/year). Max 500.</div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:"1rem", marginBottom:"1.4rem" }}>
            <div>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.72rem", fontWeight:600, color:"#64748b", marginBottom:"5px", letterSpacing:"0.04em", textTransform:"uppercase" }}>City</div>
              <select value={city} onChange={e=>setCity(e.target.value)} style={{ width:"100%", padding:"10px 12px", borderRadius:"8px", border:"1px solid #e2e8f0", background:"#f8fafc", color:"#0f172a", fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", outline:"none" }}>
                <option value="metro">Metro (Delhi/Mumbai/Bengaluru)</option>
                <option value="nonmetro">Non-Metro</option>
              </select>
            </div>
            <div>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.72rem", fontWeight:600, color:"#64748b", marginBottom:"5px", letterSpacing:"0.04em", textTransform:"uppercase" }}>Tax Regime</div>
              <div style={{ display:"flex", gap:"0.5rem" }}>
                {[["new","New (Default)"],["old","Old Regime"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setRegime(v)} style={{ flex:1, padding:"10px", borderRadius:"8px", border:`1.5px solid ${regime===v?"#10b981":"#e2e8f0"}`, background:regime===v?"rgba(16,185,129,0.08)":"#f8fafc", color:regime===v?"#10b981":"#64748b", cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:"0.8rem", fontWeight:regime===v?700:500 }}>{l}</button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={()=>setResult(calcSal(ctc,city,regime))} disabled={!ctc}
            style={{ width:"100%", padding:"13px", borderRadius:"8px", background:ctc?"linear-gradient(135deg,#10b981,#0ea5e9)":"#e2e8f0", border:"none", color:ctc?"#fff":"#94a3b8", cursor:ctc?"pointer":"not-allowed", fontFamily:"'Inter',sans-serif", fontSize:"0.95rem", fontWeight:700 }}>
            Calculate My In-Hand Salary →
          </button>
        </div>

        {result && (
          <div style={{ animation:"fadeUp .4s ease" }}>
            <div style={{ background:"linear-gradient(135deg,#020817,#0a1628)", borderRadius:"16px", padding:"2rem", textAlign:"center", marginBottom:"1rem" }}>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.72rem", fontWeight:600, color:"#64748b", letterSpacing:"0.1em", marginBottom:"0.4rem" }}>YOUR ACTUAL IN-HAND SALARY</div>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:isMobile?"2.5rem":"3.5rem", fontWeight:800, background:"linear-gradient(135deg,#10b981,#0ea5e9)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{fmt(result.inhand)}</div>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", color:"#64748b", marginTop:"0.3rem" }}>per month</div>
              <div style={{ marginTop:"0.8rem", display:"inline-block", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:"6px", padding:"4px 14px" }}>
                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.78rem", color:"#fca5a5" }}>{result.pct}% of your CTC is deducted before you receive it</span>
              </div>
            </div>

            <div style={{ background:"#fff", borderRadius:"14px", padding:"1.4rem", border:"1px solid #e2e8f0", marginBottom:"1rem" }}>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.8rem", fontWeight:700, color:"#0f172a", marginBottom:"1rem" }}>Monthly Breakdown</div>
              <div style={{ marginBottom:"0.7rem" }}>
                <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.65rem", fontWeight:700, color:"#10b981", letterSpacing:"0.08em", marginBottom:"0.4rem" }}>EARNINGS</div>
                {[["Basic Salary",result.basic,"Core salary"],["HRA",result.hra,city==="metro"?"50% of basic":"40% of basic"],["Special Allowance",result.special,"Flexible component"],["LTA",result.lta,"Leave Travel Allowance"]].map(([l,v,t2])=>(
                  <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid #f8fafc" }}>
                    <div><div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.82rem", color:"#374151", fontWeight:500 }}>{l}</div><div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.65rem", color:"#94a3b8" }}>{t2}</div></div>
                    <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", fontWeight:700, color:"#10b981" }}>+{fmt(v)}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom:"0.7rem" }}>
                <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.65rem", fontWeight:700, color:"#ef4444", letterSpacing:"0.08em", marginBottom:"0.4rem" }}>DEDUCTIONS</div>
                {[["PF (Your share)",result.pf,"12% of basic"],["Professional Tax",200,"₹200/month"],["TDS (Income Tax)",result.tds,`${regime==="new"?"New":"Old"} regime`]].map(([l,v,t2])=>(
                  <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid #f8fafc" }}>
                    <div><div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.82rem", color:"#374151", fontWeight:500 }}>{l}</div><div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.65rem", color:"#94a3b8" }}>{t2}</div></div>
                    <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", fontWeight:700, color:"#ef4444" }}>-{fmt(v)}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", paddingTop:"0.8rem", borderTop:"2px solid #f1f5f9" }}>
                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"1rem", fontWeight:700, color:"#0f172a" }}>In-Hand (Monthly)</span>
                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"1.1rem", fontWeight:800, color:"#10b981" }}>{fmt(result.inhand)}</span>
              </div>
            </div>

            <div style={{ background:"linear-gradient(135deg,#020817,#0a1628)", borderRadius:"14px", padding:"1.4rem", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
              <div>
                <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", fontWeight:700, color:"#f1f5f9", marginBottom:"0.2rem" }}>Is your salary fair? 🤔</div>
                <div style={{ fontFamily:"'Inter',sans-serif", fontSize:"0.78rem", color:"#64748b" }}>Talk to a consultant — find out your market value & how to negotiate more.</div>
              </div>
              <button onClick={onCTA} style={{ padding:"10px 22px", borderRadius:"8px", background:"linear-gradient(135deg,#0ea5e9,#6366f1)", border:"none", color:"#fff", cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:"0.88rem", fontWeight:700, whiteSpace:"nowrap" }}>Talk to Consultant — Free →</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// — PRICING —————————————————————————————————-
function Pricing({ onCTA, t, lang, user, setShowAuth, setPendingPlan }) {
  const ref=useRef(null); const v=useInView(ref);
  const { isMobile, isTablet }=useBreakpoint();
  const tp=t.pricing;
  return(
    <section id="pricing" style={{ background:"#f8fafc",padding:isMobile?"4rem 1.5rem":isTablet?"5rem 2rem":"7rem 3rem",width:"100%" }} ref={ref}>
      <div style={{ maxWidth:"1100px",margin:"0 auto" }}>
        <div style={{ textAlign:"center",marginBottom:"3.5rem" }}>
          <span style={{ fontFamily:"'Inter',sans-serif",color:"#0ea5e9",fontSize:"0.7rem",fontWeight:700,letterSpacing:"0.14em",background:"rgba(14,165,233,0.08)",padding:"4px 14px",borderRadius:"100px",border:"1px solid rgba(14,165,233,0.15)" }}>{tp.label}</span>
          <h2 style={{ fontFamily:"'Inter',sans-serif",fontSize:isMobile?"1.8rem":"2.4rem",fontWeight:800,color:"#0f172a",marginTop:"1rem",letterSpacing:"-0.04em",lineHeight:1.15 }}>{tp.title}</h2>
          <p style={{ fontFamily:"'Inter',sans-serif",color:"#64748b",marginTop:"0.5rem",fontSize:"0.92rem" }}>{tp.sub}</p>
          <div style={{ display:"inline-flex",alignItems:"center",gap:"6px",background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.12)",borderRadius:"100px",padding:"5px 16px",marginTop:"0.8rem" }}>
            <span style={{ fontFamily:"'Inter',sans-serif",color:"#dc2626",fontSize:"0.72rem",fontWeight:600 }}>🔥 100+ professionals upgraded this month</span>
          </div>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":isTablet?"repeat(2,1fr)":"repeat(3,1fr)",gap:"1.2rem",alignItems:"start" }}>
          {tp.plans.map((plan,i)=>(
            <SR key={plan.name} cls="sr-s" delay={i*120}>
              <div style={{ background:"#fff",border:plan.highlight?"2px solid #0ea5e9":"1px solid #e2e8f0",borderRadius:"16px",padding:"2rem 1.6rem",position:"relative",display:"flex",flexDirection:"column",boxShadow:plan.highlight?"0 20px 60px rgba(14,165,233,0.15)":"0 2px 12px rgba(0,0,0,0.04)",transition:"all .3s ease" }}
                onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-4px)";if(plan.highlight){e.currentTarget.style.boxShadow="0 28px 70px rgba(14,165,233,0.2)";}else{e.currentTarget.style.boxShadow="0 12px 40px rgba(0,0,0,0.1)";e.currentTarget.style.borderColor="#0ea5e9";}}}
                onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)";if(plan.highlight){e.currentTarget.style.boxShadow="0 20px 60px rgba(14,165,233,0.15)";}else{e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.04)";e.currentTarget.style.borderColor="#e2e8f0";}}}>

              {plan.highlight&&<div style={{ position:"absolute",top:"-1px",left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#0ea5e9,#6366f1)",color:"#fff",fontWeight:700,fontSize:"0.62rem",padding:"4px 20px",borderRadius:"0 0 10px 10px",fontFamily:"'Inter',sans-serif",letterSpacing:"0.08em",whiteSpace:"nowrap" }}>MOST POPULAR</div>}
              <div style={{ marginBottom:"1.5rem",paddingTop:plan.highlight?"0.5rem":0 }}>
                <div style={{ display:"flex",alignItems:"center",gap:"8px",marginBottom:"0.5rem" }}>
                  <div style={{ fontFamily:"'Inter',sans-serif",color:"#64748b",fontSize:"0.72rem",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase" }}>{plan.name}</div>
                  {plan.discount && <div style={{ background:"linear-gradient(135deg,#10b981,#0ea5e9)",borderRadius:"100px",padding:"2px 10px",fontFamily:"'Inter',sans-serif",color:"#fff",fontSize:"0.62rem",fontWeight:700 }}>{plan.discount}</div>}
                </div>
                <div style={{ display:"flex",alignItems:"baseline",gap:"6px" }}>
                  <span style={{ fontFamily:"'Inter',sans-serif",fontSize:"2.4rem",fontWeight:800,color:"#0f172a",letterSpacing:"-0.04em",lineHeight:1 }}>{plan.price}</span>
                  {i>0&&<span style={{ fontFamily:"'Inter',sans-serif",color:"#94a3b8",fontSize:"0.78rem" }}>/mo</span>}
                  {plan.originalPrice && <span style={{ fontFamily:"'Inter',sans-serif",color:"#cbd5e1",fontSize:"0.85rem",textDecoration:"line-through",marginLeft:"2px" }}>{plan.originalPrice}</span>}
                </div>
                {i===0&&<div style={{ fontFamily:"'Inter',sans-serif",color:"#94a3b8",fontSize:"0.78rem",marginTop:"2px" }}>{plan.period}</div>}
              </div>
              <div style={{ height:"1px",background:"#f1f5f9",marginBottom:"1.5rem" }}/>
              <ul style={{ listStyle:"none",padding:0,marginBottom:"1.5rem",display:"flex",flexDirection:"column",gap:"0.65rem",flex:1 }}>
                {plan.features.map(f=>(
                  <li key={f} style={{ display:"flex",gap:"8px",alignItems:"flex-start",fontFamily:"'Inter',sans-serif",color:"#374151",fontSize:"0.84rem" }}>
                    <span style={{ flexShrink:0,marginTop:"1px" }}>{Icon.check}</span>{f}
                  </li>
                ))}
              </ul>
              {plan.bonuses?.length>0&&(
                <div style={{ marginBottom:"1.5rem",background:"rgba(14,165,233,0.04)",border:"1px solid rgba(14,165,233,0.12)",borderRadius:"10px",padding:"0.8rem" }}>
                  <div style={{ fontFamily:"'Inter',sans-serif",color:"#0ea5e9",fontSize:"0.68rem",fontWeight:700,letterSpacing:"0.08em",marginBottom:"0.5rem",display:"flex",alignItems:"center",gap:"5px" }}>
                    🎁 BONUS INCLUDED
                  </div>
                  {plan.bonuses.map(b=><div key={b} style={{ fontFamily:"'Inter',sans-serif",color:"#475569",fontSize:"0.78rem",display:"flex",gap:"5px",marginTop:"3px" }}><span style={{ color:"#10b981" }}>+</span>{b}</div>)}
                </div>
              )}
              <button onClick={()=>{ if(plan.price==="Rs.0"){onCTA();}else if(!user){setPendingPlan(plan.price);try{sessionStorage.setItem("hz_pending_plan",plan.price);}catch{}setShowAuth(true);}else if(plan.price==="Rs.799"){window.open("https://rzp.io/rzp/HqU3cDU","_blank");}else{window.open("https://rzp.io/rzp/DNfBx2L3","_blank");} }} style={{ width:"100%",padding:"13px",borderRadius:"10px",background:plan.highlight?"linear-gradient(135deg,#0ea5e9,#6366f1)":"#0f172a",border:"none",color:"#fff",fontWeight:700,fontSize:"0.9rem",cursor:"pointer",fontFamily:"'Inter',sans-serif",boxShadow:plan.highlight?"0 4px 16px rgba(14,165,233,0.3)":"0 2px 8px rgba(0,0,0,0.1)",transition:"all .25s" }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.opacity=".9";}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.opacity="1";}}>{plan.cta}</button>
            </div>
            </SR>
          ))}
        </div>
        {/* Trust Badges */}
        <div style={{ marginTop:"2.5rem",display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"0.75rem" }}>
          {[
            { label:"SSL Secured" },
            { label:"Razorpay Secured" },
            { label:"Data Privacy" },
            { label:"256-bit Encryption" },
          ].map(b=>(
            <div key={b.label} style={{ display:"flex",alignItems:"center",gap:"6px",fontFamily:"'Inter',sans-serif",color:"#64748b",fontSize:"0.75rem",padding:"6px 14px",background:"#fff",border:"1px solid #e2e8f0",borderRadius:"100px" }}>
              🔒 {b.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// — FAQ ———————————————————————————————————-
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

// — APP ———————————————————————————————————-
export default function hikezo() {
  const [showChat,setShowChat]=useState(false);
  const [showAuth,setShowAuth]=useState(false);
  const [showCompare,setShowCompare]=useState(false);
  const [showSalary,setShowSalary]=useState(false);
  const [showRefund,setShowRefund]=useState(false);
  const [showPrivacy,setShowPrivacy]=useState(false);
  const [showTerms,setShowTerms]=useState(false);
  const [lang,setLang]=useState("en");
  const { isMobile, isTablet }=useBreakpoint();
  const t=T[lang]; const ta=t.auth;

  const [user,setUser]=useState(()=>{ try{ const s=sessionStorage.getItem("hz_user"); return s?JSON.parse(s):null; }catch{ return null; }});
  const [authLoading,setAuthLoading]=useState(true);

  // Firebase onAuthStateChanged — cross-device login sync
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, async (firebaseUser)=>{
      if(firebaseUser){
        const userData = { name: firebaseUser.displayName || firebaseUser.email, email: firebaseUser.email };
        try{ sessionStorage.setItem("hz_user", JSON.stringify(userData)); }catch{}
        setUser(userData);
        // Load Firestore usage data on login (cross-device sync)
        try{
          const snap = await getDoc(doc(db, "usage", getEmailKey(firebaseUser.email)));
          if(snap.exists()){
            const firestoreData = snap.data();
            const localKey = "hz_usage_" + getEmailKey(firebaseUser.email);
            const localRaw = localStorage.getItem(localKey);
            const localData = localRaw ? JSON.parse(localRaw) : { count:0, plan:"free" };
            // Use whichever has higher count or better plan
            const planRank = {"free":0,"pro":1,"elite":2};
            const firestoreRank = planRank[firestoreData.plan||"free"]||0;
            const localRank = planRank[localData.plan||"free"]||0;
            const finalData = (firestoreData.count||0) >= (localData.count||0) || firestoreRank > localRank ? firestoreData : localData;
            localStorage.setItem(localKey, JSON.stringify(finalData));
          }
        }catch{}
      } else {
        try{ sessionStorage.removeItem("hz_user"); }catch{}
        setUser(null);
      }
      setAuthLoading(false);
    });
    return ()=>unsub();
  },[]);

  const [showBanner, setShowBanner] = useState(true);
  const [pendingPlan, setPendingPlan] = useState(null);
  const [pendingAction, setPendingAction] = useState(null); // "chat" | "salary" | "compare"
  const handleCTA=()=>{ if(!user){setShowAuth(true);}else{setShowChat(true);} };
  const handleLogout=()=>{
    try{
      sessionStorage.removeItem("hz_user");
      sessionStorage.removeItem("hz_usage");
      sessionStorage.removeItem("hz_pending_plan");
      auth.signOut().catch(()=>{});
    }catch{}
    setUser(null);
    setShowChat(false);
  };
  const handleAuth=(d)=>{ 
    setUser(d); 
    setShowAuth(false);
    const p = pendingPlan || sessionStorage.getItem("hz_pending_plan");
    setPendingPlan(null);
    try{sessionStorage.removeItem("hz_pending_plan");}catch{}
    localStorage.removeItem("hz_pending_plan");
    if(p==="Rs.799"){ window.open("https://rzp.io/rzp/HqU3cDU","_blank"); }
    else if(p==="Rs.399"){ window.open("https://rzp.io/rzp/DNfBx2L3","_blank"); }
    else {
      const action = pendingAction;
      setPendingAction(null);
      setTimeout(()=>{
        if(action==="salary") setShowSalary(true);
        else if(action==="compare") setShowCompare(true);
        else setShowChat(true);
      },300);
    }
  };

  if(authLoading) return(
    <div style={{ background:"#ffffff",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center" }}>
      <span style={{ fontFamily:"'Inter',sans-serif",fontWeight:800,fontSize:"1.8rem",color:"#0f172a" }}>hike<span style={{ background:"linear-gradient(135deg,#0ea5e9,#6366f1)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>zo</span></span>
    </div>
  );

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        html,body{width:100%;scroll-behavior:smooth;overflow-x:hidden;}
        body{background:#ffffff;-webkit-text-size-adjust:100%;font-family:'Inter',sans-serif;}
        #root{width:100%;overflow-x:hidden;background:#ffffff;}

        @keyframes fadeUp{from{opacity:0;transform:translateY(28px);}to{opacity:1;transform:translateY(0);}}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
        @keyframes scaleIn{from{opacity:0;transform:scale(0.92) translateY(12px);}to{opacity:1;transform:scale(1) translateY(0);}}
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:0;}}
        @keyframes dot{0%,80%,100%{opacity:.2;transform:scale(.7);}40%{opacity:1;transform:scale(1);}}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
        @keyframes gradShift{0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}
        @keyframes glowPulse{0%,100%{opacity:0.5;transform:scale(1);}50%{opacity:1;transform:scale(1.08);}}
        @keyframes floatY{0%,100%{transform:translateY(0px);}50%{transform:translateY(-12px);}}
        @keyframes floatY2{0%,100%{transform:translateY(0px);}50%{transform:translateY(-8px);}}
        @keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
        @keyframes ringPulse{0%,100%{transform:scale(1);opacity:.5;}50%{transform:scale(1.08);opacity:1;}}
        @keyframes consultBob{0%,100%{transform:translateY(0);}50%{transform:translateY(-5px);}}
        @keyframes waFloat{0%,100%{transform:translateY(0);box-shadow:0 6px 20px rgba(37,211,102,0.4);}50%{transform:translateY(-5px);box-shadow:0 12px 28px rgba(37,211,102,0.6);}}
        @keyframes numberRise{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        @keyframes badgePop{0%{opacity:0;transform:scale(0.8) translateY(6px);}100%{opacity:1;transform:scale(1) translateY(0);}}
        @keyframes meshMove{0%{transform:translate(0,0) rotate(0deg);}33%{transform:translate(30px,-20px) rotate(120deg);}66%{transform:translate(-20px,10px) rotate(240deg);}100%{transform:translate(0,0) rotate(360deg);}}
        @keyframes cardFloat{0%,100%{transform:translateY(0) rotate(-1deg);}50%{transform:translateY(-10px) rotate(-1deg);}}
        @keyframes cardFloat2{0%,100%{transform:translateY(0) rotate(1deg);}50%{transform:translateY(-8px) rotate(1deg);}}
        @keyframes slideInLeft{from{opacity:0;transform:translateX(-40px);}to{opacity:1;transform:translateX(0);}}
        @keyframes slideInRight{from{opacity:0;transform:translateX(40px);}to{opacity:1;transform:translateX(0);}}
        @keyframes countUp{from{opacity:0;}to{opacity:1;}}

        .sr{opacity:0;transform:translateY(32px);transition:opacity .7s cubic-bezier(0.16,1,0.3,1),transform .7s cubic-bezier(0.16,1,0.3,1);}
        .sr.in{opacity:1 !important;transform:translateY(0) !important;}
        .sr-l{opacity:0;transform:translateX(-32px);transition:opacity .7s cubic-bezier(0.16,1,0.3,1),transform .7s cubic-bezier(0.16,1,0.3,1);}
        .sr-l.in{opacity:1 !important;transform:translateX(0) !important;}
        .sr-r{opacity:0;transform:translateX(32px);transition:opacity .7s cubic-bezier(0.16,1,0.3,1),transform .7s cubic-bezier(0.16,1,0.3,1);}
        .sr-r.in{opacity:1 !important;transform:translateX(0) !important;}
        .sr-s{opacity:0;transform:scale(0.88);transition:opacity .6s cubic-bezier(0.16,1,0.3,1),transform .6s cubic-bezier(0.16,1,0.3,1);}
        .sr-s.in{opacity:1 !important;transform:scale(1) !important;}

        .hz-btn-primary{background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#fff;border:none;cursor:pointer;font-family:'Inter',sans-serif;font-weight:700;transition:all .25s ease;position:relative;overflow:hidden;}
        .hz-btn-primary::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.15),transparent);opacity:0;transition:opacity .2s;}
        .hz-btn-primary:hover::after{opacity:1;}
        .hz-btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(14,165,233,0.4);}

        .hz-card{background:#fff;border:1px solid #f1f5f9;border-radius:16px;transition:all .3s ease;}
        .hz-card:hover{border-color:#0ea5e9;box-shadow:0 8px 32px rgba(14,165,233,0.1);transform:translateY(-4px);}

        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:#f8fafc;}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px;}
        input,button{-webkit-tap-highlight-color:transparent;}
      `}</style>

      <div style={{ background:"#ffffff",minHeight:"100vh",width:"100vw",maxWidth:"100%",overflowX:"hidden" }}>
        {showBanner && <UrgencyBanner onCTA={handleCTA} lang={lang} onClose={()=>setShowBanner(false)}/>}
        <Navbar onCTA={handleCTA} lang={lang} setLang={setLang} t={t} user={user} bannerVisible={showBanner} onLogout={handleLogout} onCompare={()=>setShowCompare(true)} onSalary={()=>setShowSalary(true)}/>
        <Hero onCTA={handleCTA} t={t} lang={lang}/>
        <SocialProofStrip/>
        <HowItWorks t={t} onCTA={handleCTA}/>
        <Features t={t}/>
        <Testimonials t={t}/>
        <SalarySection onCTA={handleCTA} isMobile={isMobile}/>
        <Pricing onCTA={handleCTA} t={t} lang={lang} user={user} setShowAuth={setShowAuth} setPendingPlan={setPendingPlan}/>
        <FAQ t={t}/>

        {/* CTA Banner */}
        <section style={{ background:"linear-gradient(160deg,#050B18,#0A1628)",padding:isMobile?"3rem 1.5rem 4rem":isTablet?"3.5rem 2rem 5rem":"5rem 3rem 7rem",textAlign:"center" }}>
          <div style={{ maxWidth:"640px",margin:"0 auto" }}>
            <div style={{ display:"inline-flex",alignItems:"center",gap:"6px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"100px",padding:"5px 16px",marginBottom:"1.5rem" }}>
              <span style={{ width:6,height:6,borderRadius:"50%",background:"#10b981",display:"inline-block",animation:"pulse 1.5s infinite" }}/>
              <span style={{ fontFamily:"'Inter',sans-serif",color:"rgba(255,255,255,0.7)",fontSize:"0.72rem",fontWeight:500 }}>Free to start — no credit card needed</span>
            </div>
            <h2 style={{ fontFamily:"'Inter',sans-serif",fontSize:isMobile?"1.8rem":"2.4rem",fontWeight:800,color:"#f8fafc",marginBottom:"0.7rem",letterSpacing:"-0.04em",lineHeight:1.15 }}>{t.cta.title}</h2>
            <p style={{ fontFamily:"'Inter',sans-serif",color:"#64748b",marginBottom:"2rem",fontSize:"0.92rem",lineHeight:1.7 }}>{t.cta.sub}</p>
            <button onClick={handleCTA} className="hz-btn-primary" style={{ padding:isMobile?"13px 28px":"15px 36px",borderRadius:"10px",fontSize:"0.96rem",boxShadow:"0 4px 24px rgba(14,165,233,0.4)",display:"inline-flex",alignItems:"center",gap:"8px" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 12px 36px rgba(14,165,233,0.5)";}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 4px 24px rgba(14,165,233,0.4)";}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              {t.cta.btn}
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ background:"#f8fafc",borderTop:"1px solid #e2e8f0",padding:"2rem 2rem",fontFamily:"'Inter',sans-serif" }}>
          <div style={{ maxWidth:"1100px",margin:"0 auto" }}>
            <div style={{ display:"flex",flexWrap:"wrap",justifyContent:"space-between",alignItems:"center",gap:"1rem",marginBottom:"1.5rem" }}>
              <div style={{ display:"flex",alignItems:"center",gap:"8px" }}>
                <span style={{ fontWeight:800,fontSize:"1.1rem",color:"#0f172a",letterSpacing:"-0.03em" }}>hike<span style={{ background:"linear-gradient(135deg,#0ea5e9,#6366f1)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>zo</span></span>
                <span style={{ color:"#94a3b8",fontSize:"0.75rem",marginLeft:"0.3rem" }}>India's Career Growth Platform</span>
              </div>
              {/* Social icons */}
              <div style={{ display:"flex",gap:"0.5rem" }}>
                {[{h:"https://wa.me/917048918369",ic:Icon.wasvg},{h:"https://linkedin.com/company/hikezo",ic:Icon.lisvg},{h:"https://instagram.com/hikezo.in",ic:Icon.igsvg},{h:"https://youtube.com/@hikezo",ic:Icon.ytsvg}].map((s,i)=>(
                  <a key={i} href={s.h} target="_blank" rel="noopener noreferrer" style={{ width:34,height:34,borderRadius:"8px",background:"#fff",border:"1px solid #e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",color:"#64748b",textDecoration:"none",transition:"all .2s" }}
                    onMouseEnter={e=>{e.currentTarget.style.background="#f0f9ff";e.currentTarget.style.color="#0ea5e9";e.currentTarget.style.borderColor="rgba(14,165,233,0.3)";}} onMouseLeave={e=>{e.currentTarget.style.background="#fff";e.currentTarget.style.color="#64748b";e.currentTarget.style.borderColor="#e2e8f0";}}>
                    {s.ic}
                  </a>
                ))}
              </div>
            </div>
            <div style={{ display:"flex",flexWrap:"wrap",justifyContent:"space-between",alignItems:"center",gap:"0.8rem",paddingTop:"1rem",borderTop:"1px solid #e2e8f0" }}>
              <div style={{ display:"flex",gap:"1.5rem",flexWrap:"wrap" }}>
                {[["Privacy Policy","privacy"],["Terms of Service","terms"],["Refund Policy","refund"],["Contact Us","mailto"]].map(([l,c])=>(
                  <a key={l} href="#" onClick={e=>{e.preventDefault();if(c==="refund")setShowRefund(true);if(c==="privacy")setShowPrivacy(true);if(c==="terms")setShowTerms(true);if(c==="mailto")window.location.href="mailto:support@hikezo.in";}} style={{ color:"#64748b",fontSize:"0.75rem",textDecoration:"none",transition:"color .2s",fontFamily:"'Inter',sans-serif" }}
                    onMouseEnter={e=>e.target.style.color="#0ea5e9"} onMouseLeave={e=>e.target.style.color="#64748b"}>{l}</a>
                ))}
              </div>
              <span style={{ color:"#94a3b8",fontSize:"0.72rem",fontFamily:"'Inter',sans-serif" }}>{t.footer}</span>
            </div>
          </div>
        </footer>

        {/* WhatsApp FAB */}
        <a href="https://wa.me/917048918369?text=Hi%20hikezo%2C%20I%20need%20career%20help" target="_blank" rel="noopener noreferrer"
          style={{ position:"fixed",bottom:isMobile?"1.2rem":"1.8rem",right:isMobile?"1.2rem":"1.8rem",zIndex:150,width:50,height:50,borderRadius:"50%",background:"#25D366",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 18px rgba(37,211,102,0.4)",animation:"waFloat 3s ease-in-out infinite",textDecoration:"none",color:"#fff" }}>
          {Icon.wasvg}
        </a>
      </div>

      {/* Auth Modal */}
      {showSalary&&<SalaryCalculator onClose={()=>setShowSalary(false)} user={user} onStartChat={()=>setShowChat(true)} onShowAuth={(action)=>{setPendingAction(action||"chat");setShowAuth(true);}}/>}
      {showCompare&&<OfferCompare onClose={()=>setShowCompare(false)} user={user} isPro={getLimitData(user?.email)?.plan==="pro"||getLimitData(user?.email)?.plan==="elite"} onShowAuth={(action)=>{setPendingAction(action||"compare");setShowCompare(false);setShowAuth(true);}}/>}
      {showAuth&&(
        <div style={{ position:"fixed",inset:0,zIndex:400,background:"rgba(2,8,23,0.92)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",animation:"fadeIn .3s ease" }}
          onClick={e=>e.target===e.currentTarget&&setShowAuth(false)}>
          <Auth onAuth={handleAuth} t={ta} onClose={()=>setShowAuth(false)}/>
        </div>
      )}

      {/* Chat Modal */}
      {showChat&&<ChatModal onClose={()=>setShowChat(false)} t={t} lang={lang} user={user}/>}

      {/* Terms of Service Modal */}
      {showTerms&&(
        <div style={{ position:"fixed",inset:0,zIndex:300,background:"rgba(2,8,23,0.9)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",animation:"fadeIn .3s ease" }}
          onClick={e=>e.target===e.currentTarget&&setShowTerms(false)}>
          <div style={{ width:"100%",maxWidth:"520px",maxHeight:"80vh",overflowY:"auto",background:"#0f172a",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",padding:"2rem",animation:"scaleIn .3s ease" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem" }}>
              <h2 style={{ fontFamily:"'Inter',sans-serif",color:"#f1f5f9",fontWeight:700,fontSize:"1.1rem" }}>Terms of Service</h2>
              <button onClick={()=>setShowTerms(false)} style={{ background:"rgba(255,255,255,0.05)",border:"none",color:"#475569",cursor:"pointer",width:28,height:28,borderRadius:"6px",display:"flex",alignItems:"center",justifyContent:"center" }}>x</button>
            </div>
            <div style={{ fontFamily:"'Inter',sans-serif",color:"#64748b",lineHeight:1.75,fontSize:"0.84rem",display:"flex",flexDirection:"column",gap:"1.1rem" }}>
              <p style={{ color:"#475569",fontSize:"0.72rem" }}>Last updated: June 2025 | Effective: June 2025</p>
              <p style={{ color:"#94a3b8",fontSize:"0.8rem",fontStyle:"italic" }}>By accessing or using hikezo.in, you agree to be bound by these Terms of Service. If you do not agree, do not use this platform.</p>
              {[
                {title:"1. Acceptance of Terms",body:"By creating an account or using any service on hikezo.in, you confirm that you are at least 18 years of age, legally capable of entering into binding agreements, and agree to these Terms in full."},
                {title:"2. Description of Service",body:"hikezo.in provides AI-assisted career consultation services including salary negotiation guidance, career roadmaps, skills gap analysis, resume assistance, and interview preparation. The service is provided 'as is' and results may vary based on individual circumstances, employer policies, and market conditions."},
                {title:"3. No Guarantee of Outcomes",body:"hikezo provides guidance and tools to help users in their career journey. We do not guarantee specific salary increases, job placements, promotions, or any other career outcomes. Success depends on individual effort, market conditions, and factors beyond our control. Any results mentioned are examples and not promises."},
                {title:"4. Account Responsibility",body:"You are solely responsible for maintaining the confidentiality of your account credentials. You agree not to share your account with others. hikezo reserves the right to terminate accounts found to be shared or misused."},
                {title:"5. Acceptable Use",body:"You agree not to: (a) Use the platform for any unlawful purpose; (b) Attempt to access other users' data; (c) Reverse engineer or copy any part of the platform; (d) Use the service to generate content for competing platforms; (e) Misrepresent yourself or provide false information."},
                {title:"6. Intellectual Property",body:"All content, features, and functionality on hikezo.in are owned by hikezo and protected by applicable intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express written permission."},
                {title:"7. AI Disclaimer",body:"Career guidance on this platform is AI-assisted. While we strive for accuracy and personalization, AI-generated advice should be used as a supplementary tool, not as a substitute for professional legal, financial, or HR advice. hikezo is not liable for decisions made solely based on AI-generated content."},
                {title:"8. Limitation of Liability",body:"To the maximum extent permitted by law, hikezo shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill. Our total liability shall not exceed the amount paid by you in the 3 months preceding the claim."},
                {title:"9. Indemnification",body:"You agree to indemnify and hold harmless hikezo, its directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the platform or violation of these Terms."},
                {title:"10. Modification of Terms",body:"hikezo reserves the right to modify these Terms at any time. Updated Terms will be posted on this page. Continued use of the platform after changes constitutes acceptance of the new Terms."},
                {title:"11. Termination",body:"hikezo reserves the right to suspend or terminate your account at any time for violation of these Terms, without notice or liability. Upon termination, your right to use the platform ceases immediately."},
                {title:"12. Governing Law & Disputes",body:"These Terms are governed by the laws of India. Any disputes shall be resolved through arbitration in India before resorting to litigation. The courts of India shall have exclusive jurisdiction."},
                {title:"13. Contact",body:"For questions about these Terms, contact: support@hikezo.in"},
              ].map(s=>(
                <div key={s.title}>
                  <p style={{ color:"#e2e8f0",fontWeight:600,marginBottom:"0.3rem",fontSize:"0.85rem" }}>{s.title}</p>
                  <p>{s.body}</p>
                </div>
              ))}
            </div>
            <button onClick={()=>setShowTerms(false)} style={{ width:"100%",marginTop:"1.5rem",padding:"11px",background:"linear-gradient(135deg,#0ea5e9,#6366f1)",border:"none",borderRadius:"8px",color:"#fff",fontWeight:600,fontSize:"0.88rem",cursor:"pointer",fontFamily:"'Inter',sans-serif" }}>I Understand</button>
          </div>
        </div>
      )}
      {showPrivacy&&(
        <div style={{ position:"fixed",inset:0,zIndex:300,background:"rgba(2,8,23,0.9)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",animation:"fadeIn .3s ease" }}
          onClick={e=>e.target===e.currentTarget&&setShowPrivacy(false)}>
          <div style={{ width:"100%",maxWidth:"520px",maxHeight:"80vh",overflowY:"auto",background:"#0f172a",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"16px",padding:"2rem",animation:"scaleIn .3s ease" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem" }}>
              <h2 style={{ fontFamily:"'Inter',sans-serif",color:"#f1f5f9",fontWeight:700,fontSize:"1.1rem" }}>Privacy Policy</h2>
              <button onClick={()=>setShowPrivacy(false)} style={{ background:"rgba(255,255,255,0.05)",border:"none",color:"#475569",cursor:"pointer",width:28,height:28,borderRadius:"6px",display:"flex",alignItems:"center",justifyContent:"center" }}>x</button>
            </div>
            <div style={{ fontFamily:"'Inter',sans-serif",color:"#64748b",lineHeight:1.75,fontSize:"0.84rem",display:"flex",flexDirection:"column",gap:"1.1rem" }}>
              <p style={{ color:"#475569",fontSize:"0.72rem" }}>Last updated: June 2025 | Effective: June 2025</p>
              <p style={{ color:"#94a3b8",fontSize:"0.8rem",fontStyle:"italic" }}>Please read this Privacy Policy carefully before using hikezo.in. By accessing or using our platform, you agree to be bound by this policy.</p>
              {[
                {title:"1. Information We Collect",body:"We collect: (a) Personal identification information including full name, email address, and mobile number provided during registration; (b) Career and professional information you voluntarily share during consultations; (c) Usage data including IP address, browser type, pages visited, and time spent; (d) Device information for analytics and security purposes. Payment information is processed exclusively by Razorpay and is never stored on our servers."},
                {title:"2. How We Use Your Information",body:"Your information is used to: (a) Provide personalized career consultation services; (b) Send service-related communications and updates; (c) Improve our platform and user experience; (d) Comply with legal obligations; (e) Prevent fraud and ensure security. We do NOT sell, rent, or trade your personal data to any third parties under any circumstances."},
                {title:"3. Data Sharing",body:"We may share your data with: (a) Service providers who assist in operating our platform (under strict confidentiality agreements); (b) Law enforcement or regulatory bodies when legally required; (c) Successors in the event of a merger or acquisition (with prior notice to users). We do not share your data with advertisers or marketing firms."},
                {title:"4. AI-Assisted Services Disclosure",body:"hikezo uses AI technology to assist career consultants in providing personalized guidance. Conversations may be processed and stored to improve service quality. By using our consultation services, you consent to this processing. Conversation data is anonymized for training purposes."},
                {title:"5. Data Security",body:"We implement industry-standard security measures including 256-bit SSL encryption, secure servers, regular security audits, and access controls. However, no method of internet transmission is 100% secure. We cannot guarantee absolute security of your data."},
                {title:"6. Cookies & Tracking",body:"We use cookies and similar tracking technologies including analytics tools and Meta Pixel to understand usage patterns and improve our services. You may opt out via your browser settings, but this may affect platform functionality."},
                {title:"7. Data Retention",body:"We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data by emailing support@hikezo.in. We will process such requests within 30 days, subject to legal retention requirements."},
                {title:"8. User Rights",body:"You have the right to: (a) Access your personal data; (b) Correct inaccurate data; (c) Request deletion of your data; (d) Object to processing of your data; (e) Data portability. To exercise these rights, contact support@hikezo.in."},
                {title:"9. Children's Privacy",body:"hikezo is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from minors. If we discover that a minor has provided personal information, we will delete it immediately."},
                {title:"10. Changes to This Policy",body:"We reserve the right to modify this Privacy Policy at any time. Changes will be posted on this page with an updated effective date. Continued use of the platform after changes constitutes acceptance of the new policy."},
                {title:"11. Contact Us",body:"For privacy-related concerns, data requests, or complaints, contact us at: support@hikezo.in. We aim to respond within 48 business hours. Registered business: hikezo.in, India."},
              ].map(s=>(
                <div key={s.title}>
                  <p style={{ color:"#e2e8f0",fontWeight:600,marginBottom:"0.3rem",fontSize:"0.85rem" }}>{s.title}</p>
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
            <div style={{ fontFamily:"'Inter',sans-serif",color:"#64748b",lineHeight:1.75,fontSize:"0.84rem",display:"flex",flexDirection:"column",gap:"1rem" }}>
              <p style={{ color:"#475569",fontSize:"0.72rem" }}>Last updated: June 2025 | Effective: June 2025</p>
              <p style={{ color:"#94a3b8",fontSize:"0.8rem",fontStyle:"italic" }}>By purchasing any plan on hikezo.in, you acknowledge that you have read, understood, and agreed to this Refund and Cancellation Policy.</p>
              <div style={{ background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:"8px",padding:"1rem" }}>
                <p style={{ color:"#fca5a5",fontWeight:700,marginBottom:"0.4rem",fontSize:"0.9rem" }}>STRICT NO-REFUND POLICY</p>
                <p>All payments made on hikezo.in are <strong style={{ color:"#f1f5f9" }}>final, non-refundable, and non-transferable</strong>. Once a payment is processed, no refunds will be issued under any circumstances, including but not limited to: dissatisfaction with service, accidental purchase, change of mind, technical issues on the user's end, or non-usage of the platform.</p>
              </div>
              {[
                {title:"1. Nature of Service",body:"hikezo provides digital career consultation services delivered instantly upon payment. As the service is intangible and immediately accessible, it is categorically exempt from refund claims under standard digital services norms."},
                {title:"2. No Cancellation Policy",body:"Subscriptions do not support mid-cycle cancellations. You may cancel future auto-renewal by contacting support@hikezo.in at least 7 days before your next billing date. No refund will be provided for the current billing period under any circumstances."},
                {title:"3. Auto-Renewal",body:"All paid plans are automatically renewed at the end of each billing cycle. By subscribing, you authorize hikezo to charge your payment method for recurring fees. It is your responsibility to cancel before renewal. Charges made due to failure to cancel in time are non-refundable."},
                {title:"4. Disputed Transactions",body:"Any unauthorized chargeback or payment dispute filed against hikezo without first contacting our support team will result in immediate account suspension and may be subject to legal action for breach of contract. We encourage users to contact support@hikezo.in to resolve any billing concerns before initiating a chargeback."},
                {title:"5. Free Trial Recommendation",body:"We strongly recommend using our Free Plan to evaluate the platform before making any purchase. The availability of a free tier removes any justification for a refund based on dissatisfaction with service quality."},
                {title:"6. Platform Downtime",body:"In the rare event of extended platform downtime exceeding 72 consecutive hours, hikezo may, at its sole discretion, provide service credits. This is not a guarantee and does not constitute a right to a cash refund."},
                {title:"7. Governing Law",body:"This policy is governed by the laws of India. Any disputes arising from this policy shall be subject to the exclusive jurisdiction of courts in India."},
                {title:"8. Contact",body:"For billing concerns, contact support@hikezo.in within 24 hours of the transaction. While we do not offer refunds, we are committed to resolving genuine billing errors promptly."},
              ].map(s=>(
                <div key={s.title}>
                  <p style={{ color:"#e2e8f0",fontWeight:600,marginBottom:"0.3rem",fontSize:"0.85rem" }}>{s.title}</p>
                  <p>{s.body}</p>
                </div>
              ))}
            </div>
            <button onClick={()=>setShowRefund(false)} style={{ width:"100%",marginTop:"1.5rem",padding:"11px",background:"linear-gradient(135deg,#0ea5e9,#6366f1)",border:"none",borderRadius:"8px",color:"#fff",fontWeight:600,fontSize:"0.88rem",cursor:"pointer",fontFamily:"'Inter',sans-serif" }}>I Understand</button>
          </div>
        </div>
      )}
    </>
  );
}
  
