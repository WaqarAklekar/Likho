import React, { useState, useEffect, useContext, createContext, useRef } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI } from "@google/genai";
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  getDoc, 
  serverTimestamp,
  orderBy,
  setDoc,
  enableIndexedDbPersistence,
  initializeFirestore,
  CACHE_SIZE_UNLIMITED
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";
import { 
  Book, 
  PenTool, 
  Truck, 
  User, 
  LogOut, 
  MessageCircle, 
  MapPin, 
  FileText, 
  CheckCircle, 
  Clock, 
  Languages, 
  DollarSign, 
  Sparkles, 
  Search, 
  Menu, 
  X, 
  Send, 
  Camera, 
  Navigation, 
  Shield, 
  Bot, 
  Bell, 
  Moon, 
  Sun, 
  ChevronRight, 
  FileCheck, 
  Info, 
  Settings, 
  Phone, 
  CloudUpload, 
  File, 
  Trash2, 
  Calendar, 
  Zap, 
  Wallet, 
  ArrowUpRight, 
  History, 
  CreditCard, 
  Plus, 
  Home, 
  LayoutDashboard 
} from "lucide-react";

// --- FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyAvK1sDK-PnI5r6R1_I4iLT9Lw17KcrruQ",
  authDomain: "likho-6072f.firebaseapp.com",
  projectId: "likho-6072f",
  storageBucket: "likho-6072f.firebasestorage.app",
  messagingSenderId: "445421197162",
  appId: "1:445421197162:web:08b6eb3334b9f29ca7f713",
  measurementId: "G-LPBCLNSRPX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// --- GEMINI AI SETUP ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- LOCALIZATION & CONSTANTS ---
const LANGUAGES = {
  en: "English",
  hi: "हिन्दी",
  mr: "मराठी",
  ur: "اردو"
};

const TRANSLATIONS = {
  en: {
    welcome: "Welcome to LIKHO",
    tagline: "Your Assignment, Delivered.",
    login: "Login",
    register: "Register",
    student: "Student",
    writer: "Writer",
    delivery: "Delivery",
    email: "Email",
    password: "Password",
    submit: "Submit",
    newAssignment: "New Assignment",
    myOrders: "My Orders",
    pending: "Pending",
    accepted: "In Progress",
    completed: "Completed",
    delivered: "Delivered",
    aiHelp: "AI Improve",
    chat: "AI Chat",
    price: "Estimated Price",
    pickup: "Pickup Assignment",
    uploadProof: "Upload Proof",
    role: "Select Role",
    desc: "Description",
    subject: "Subject",
    deadline: "Deadline",
    handwritten: "Handwritten Delivery Required",
    digital: "Digital Submission",
    pay: "Pay Now",
    kyc: "Verification (KYC)",
    kycDesc: "Upload ID Proof to continue",
    profile: "Profile",
    settings: "Settings",
    terms: "Terms & Conditions",
    notifications: "Notifications",
    darkMode: "Dark Mode",
    logout: "Logout",
    help: "Help & Support",
    myAssignments: "Accepted Tasks",
    activeDeliveries: "Active Deliveries",
    uploadFiles: "Upload Reference Files",
    pages: "Number of Pages",
    sides: "Print Side",
    singleSided: "Single Sided",
    doubleSided: "Double Sided",
    urgency: "Urgency Fee applied",
    search: "Search assignments...",
    askAI: "Ask AI Helper",
    earnings: "Earnings",
    wallet: "Wallet",
    withdraw: "Withdraw Funds",
    history: "Transaction History",
    pendingClearance: "Pending Clearance",
    availableBalance: "Available Balance",
    lifetimeEarnings: "Lifetime Earnings",
    pickups: "Available Pickups",
    activeRides: "Active Deliveries",
    navigate: "Navigate",
    confirmDelivery: "Confirm Delivery",
    otp: "Enter OTP",
    hello: "Hello",
    readyToExcel: "Ready to excel today?"
  },
  hi: {
    welcome: "LIKHO में आपका स्वागत है",
    tagline: "आपका असाइनमेंट, डिलीवर हुआ।",
    login: "लॉग इन",
    register: "रजिस्टर",
    student: "छात्र",
    writer: "लेखक",
    delivery: "डिलीवरी",
    email: "ईमेल",
    password: "पासवर्ड",
    submit: "जमा करें",
    newAssignment: "नया असाइनमेंट",
    myOrders: "मेरे ऑर्डर",
    pending: "लंबित",
    accepted: "प्रगति में",
    completed: "पूर्ण",
    delivered: "डिलीवर किया गया",
    aiHelp: "AI सुधार",
    chat: "AI चैट",
    price: "अनुमानित कीमत",
    pickup: "पिकअप असाइनमेंट",
    uploadProof: "प्रमाण अपलोड करें",
    role: "भूमिका चुनें",
    desc: "विवरण",
    subject: "विषय",
    deadline: "समय सीमा",
    handwritten: "हस्तलिखित डिलीवरी आवश्यक",
    digital: "डिजिटल सबमिशन",
    pay: "अभी भुगतान करें",
    kyc: "सत्यापन (KYC)",
    kycDesc: "जारी रखने के लिए आईडी प्रमाण अपलोड करें",
    profile: "प्रोफाइल",
    settings: "सेटिंग्स",
    terms: "नियम और शर्तें",
    notifications: "सूचनाएं",
    darkMode: "डार्क मोड",
    logout: "लॉग आउट",
    help: "मदद और समर्थन",
    myAssignments: "स्वीकृत कार्य",
    activeDeliveries: "सक्रिय डिलीवरी",
    uploadFiles: "फाइलें अपलोड करें",
    pages: "पृष्ठों की संख्या",
    sides: "प्रिंट साइड",
    singleSided: "एक तरफ",
    doubleSided: "दोनों तरफ",
    urgency: "तत्काल शुल्क लागू",
    search: "असाइनमेंट खोजें...",
    askAI: "AI से पूछें",
    earnings: "कमाई",
    wallet: "वॉलेट",
    withdraw: "पैसे निकालें",
    history: "लेनदेन का इतिहास",
    pendingClearance: "निकासी लंबित",
    availableBalance: "उपलब्ध शेष",
    lifetimeEarnings: "कुल कमाई",
    pickups: "उपलब्ध पिकअप",
    activeRides: "सक्रिय डिलीवरी",
    navigate: "नेविगेट करें",
    confirmDelivery: "डिलीवरी की पुष्टि करें",
    otp: "OTP दर्ज करें",
    hello: "नमस्ते",
    readyToExcel: "आज उत्कृष्टता के लिए तैयार हैं?"
  },
  mr: {
    welcome: "LIKHO मध्ये स्वागत आहे",
    tagline: "तुमचे असाइनमेंट, पोचवले जाईल.",
    login: "लॉग इन",
    register: "नोंदणी",
    student: "विद्यार्थी",
    writer: "लेखक",
    delivery: "वितरण",
    email: "ईमेल",
    password: "पासवर्ड",
    submit: "सादर करा",
    newAssignment: "नवीन असाइनमेंट",
    myOrders: "माझ्या ऑर्डर्स",
    pending: "प्रलंबित",
    accepted: "प्रगतीपथावर",
    completed: "पूर्ण",
    delivered: "पोचवले",
    aiHelp: "AI मदत",
    chat: "AI गप्पा",
    price: "अंदाजे किंमत",
    pickup: "पिकअप असाइनमेंट",
    uploadProof: "पुरावा अपलोड करा",
    role: "भूमिका निवडा",
    desc: "वर्णन",
    subject: "विषय",
    deadline: "अंतिम मुदत",
    handwritten: "हस्तलिखित वितरण आवश्यक",
    digital: "डिजिटल सबमिशन",
    pay: "आता पैसे द्या",
    kyc: "पडताळणी (KYC)",
    kycDesc: "सुरू ठेवण्यासाठी आयडी पुरावा अपलोड करा",
    profile: "प्रोफाइल",
    settings: "सेटिंग्ज",
    terms: "नियम आणि अटी",
    notifications: "सूचना",
    darkMode: "डार्क मोड",
    logout: "बाहेर पडा",
    help: "मदत आणि समर्थन",
    myAssignments: "स्वीकारलेली कामे",
    activeDeliveries: "सक्रिय वितरण",
    uploadFiles: "फाइल्स अपलोड करा",
    pages: "पानांची संख्या",
    sides: "प्रिंट बाजू",
    singleSided: "एका बाजूने",
    doubleSided: "दोन्ही बाजूने",
    urgency: "तातडीचे शुल्क लागू",
    search: "असाइनमेंट शोधा...",
    askAI: "AI ला विचारा",
    earnings: "कमाई",
    wallet: "पाकीट",
    withdraw: "पैसे काढा",
    history: "व्यवहार इतिहास",
    pendingClearance: "प्रलंबित मंजुरी",
    availableBalance: "उपलब्ध शिल्लक",
    lifetimeEarnings: "आजवरची कमाई",
    pickups: "उपलब्ध पिकअप",
    activeRides: "सक्रिय वितरण",
    navigate: "नेव्हिगेट करा",
    confirmDelivery: "वितरण निश्चित करा",
    otp: "OTP टाका",
    hello: "नमस्कार",
    readyToExcel: "आज चमकण्यासाठी तयार आहात?"
  },
  ur: {
    welcome: "LIKHO میں خوش آمدید",
    tagline: "آپ کی اسائنمنٹ، ڈیلیور ہو گئی۔",
    login: "لاگ ان",
    register: "رجسٹر",
    student: "طالب علم",
    writer: "لکھاری",
    delivery: "ڈیلیوری",
    email: "ای میل",
    password: "پاس ورڈ",
    submit: "جمع کرائیں",
    newAssignment: "نئی اسائنمنٹ",
    myOrders: "میرے آرڈرز",
    pending: "زیر التواء",
    accepted: "جاری ہے",
    completed: "مکمل",
    delivered: "پہنچا دیا گیا",
    aiHelp: "AI مدد",
    chat: "AI چیٹ",
    price: "متوقع قیمت",
    pickup: "پک اپ اسائنمنٹ",
    uploadProof: "ثبوت اپ لوڈ کریں",
    role: "کردار منتخب کریں",
    desc: "تفصیل",
    subject: "مضمون",
    deadline: "آخری تاریخ",
    handwritten: "ہاتھ سے لکھا ہوا",
    digital: "ڈیجیٹل جمع کرانے",
    pay: "ابھی ادائیگی کریں",
    kyc: "تصدیق (KYC)",
    kycDesc: "جاری رکھنے کے لیے ID کا ثبوت اپ لوڈ کریں",
    profile: "پروفائل",
    settings: "ترتیبات",
    terms: "شرائط و ضوابط",
    notifications: "اطلاعات",
    darkMode: "ڈارک موڈ",
    logout: "لاگ آؤٹ",
    help: "مدد اور معاونت",
    myAssignments: "قبول شدہ کام",
    activeDeliveries: "فعال ترسیل",
    uploadFiles: "فائلیں اپ لوڈ کریں",
    pages: "صفحات کی تعداد",
    sides: "پرنٹ سائیڈ",
    singleSided: "ایک طرف",
    doubleSided: "دونوں طرف",
    urgency: "فوری فیس لاگو",
    search: "اسائنمنٹس تلاش کریں...",
    askAI: "AI سے پوچھیں",
    earnings: "آمدنی",
    wallet: "بٹوے",
    withdraw: "رقم نکالیں",
    history: "لین دین کی تاریخ",
    pendingClearance: "زیر التواء کلیئرنس",
    availableBalance: "دستیاب بیلنس",
    lifetimeEarnings: "زندگی بھر کی کمائی",
    pickups: "دستیاب پک اپس",
    activeRides: "فعال ترسیل",
    navigate: "نیویگیٹ کریں",
    confirmDelivery: "ترسیل کی تصدیق کریں",
    otp: "OTP درج کریں",
    hello: "ہیلو",
    readyToExcel: "آج ایکسل کرنے کے لئے تیار ہیں؟"
  }
};

// --- CONTEXTS ---
const LangContext = createContext<any>(null);
const UserContext = createContext<any>(null);
const ViewContext = createContext<any>(null);
const ThemeContext = createContext<any>(null);

// --- COMPONENTS ---

const Spinner = ({ color = "border-yellow-400" }: { color?: string }) => (
  <div className={`animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 ${color}`}></div>
);

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border-t sm:border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300">
        <div className="p-4 border-b dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-950 shrink-0">
          <h3 className="font-bold text-lg text-black dark:text-yellow-400">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
            <X size={20} className="text-gray-500 hover:text-black dark:hover:text-yellow-400" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto dark:text-gray-200 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- LAYOUT ---
const Layout = ({ children }: any) => {
  const { user, role, logout } = useContext(UserContext);
  const { lang, setLang, t } = useContext(LangContext);
  const { view, setView, dashboardTab, setDashboardTab, setCreateModalOpen } = useContext(ViewContext);
  const { isDark, setIsDark } = useContext(ThemeContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const menuItems: { icon: any; label: any; view: string; tab?: string }[] = [
    { icon: <User size={18} />, label: t.profile, view: 'profile' },
    { icon: <LayoutDashboard size={18} />, label: role === 'student' ? t.myOrders : 'Dashboard', view: 'dashboard' },
  ];

  if (role === 'writer') {
    menuItems.push({ icon: <FileCheck size={18} />, label: t.myAssignments, view: 'dashboard', tab: 'my-tasks' });
    menuItems.push({ icon: <Wallet size={18} />, label: t.earnings, view: 'dashboard', tab: 'earnings' });
  }
  if (role === 'delivery') {
    menuItems.push({ icon: <Truck size={18} />, label: t.activeDeliveries, view: 'dashboard' });
  }

  const secondaryItems = [
    { icon: <Bell size={18} />, label: t.notifications, view: 'notifications' },
    { icon: <FileText size={18} />, label: t.terms, view: 'terms' },
    { icon: <Shield size={18} />, label: t.help, view: 'help' },
  ];

  const handleNav = (item: any) => {
    setView(item.view);
    if (item.tab && setDashboardTab) {
      setDashboardTab(item.tab);
    }
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col text-black dark:text-gray-100 font-sans transition-colors duration-200">
      {/* Header */}
      <header className="bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-sm sticky top-0 z-30 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {user && (
              <button onClick={toggleMenu} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors">
                <Menu size={24} className="text-black dark:text-yellow-400" />
              </button>
            )}
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setView('dashboard')}>
              <div className="bg-yellow-400 p-2 rounded-xl shadow-lg shadow-yellow-400/20 transform rotate-3 hover:rotate-0 transition-transform">
                <PenTool className="text-black h-5 w-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-black dark:text-yellow-400 hidden sm:block">LIKHO</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button onClick={() => setView('notifications')} className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors">
              <Bell size={20} className="text-black dark:text-gray-300" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-black"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Side Drawer (Left) */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 flex justify-start">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMenuOpen(false)}></div>
          <div className="relative bg-white dark:bg-gray-950 w-72 h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-200 border-r border-yellow-400">
            {/* User Info */}
            <div className="p-6 bg-gradient-to-br from-yellow-50 to-white dark:from-gray-900 dark:to-black border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-3 mb-2">
                <div className="h-12 w-12 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold border-2 border-black text-lg shadow-md">
                  {user?.email?.[0].toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold truncate text-black dark:text-white">{user?.email}</p>
                  <span className="text-[10px] bg-black text-yellow-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">{role}</span>
                </div>
              </div>
            </div>
            
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {menuItems.map((item, idx) => (
                <button 
                  key={idx} 
                  onClick={() => handleNav(item)} 
                  className={`flex items-center w-full p-3 rounded-xl font-medium transition-all ${view === item.view ? 'bg-yellow-400 text-black shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'}`}
                >
                  <span className="mr-3">{item.icon}</span> {item.label}
                </button>
              ))}

              <div className="my-4 border-t border-gray-200 dark:border-gray-800"></div>

              {secondaryItems.map((item, idx) => (
                <button 
                  key={`sec-${idx}`} 
                  onClick={() => handleNav(item)} 
                  className={`flex items-center w-full p-3 rounded-xl font-medium transition-all ${view === item.view ? 'bg-gray-100 dark:bg-gray-900 text-black dark:text-yellow-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'}`}
                >
                  <span className="mr-3">{item.icon}</span> {item.label}
                </button>
              ))}
              
              <div className="my-4 border-t border-gray-200 dark:border-gray-800"></div>

              {/* Preferences */}
              <div className="p-3">
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">Preferences</p>
                 
                 <div className="flex items-center justify-between mb-4 px-1">
                   <span className="text-sm font-medium dark:text-gray-300">{t.darkMode}</span>
                   <button 
                    onClick={() => setIsDark(!isDark)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDark ? 'bg-yellow-400' : 'bg-gray-200'}`}
                   >
                     <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${isDark ? 'translate-x-6' : 'translate-x-1'}`} />
                   </button>
                 </div>

                 <div className="flex items-center justify-between px-1">
                   <span className="text-sm font-medium dark:text-gray-300">Language</span>
                    <select 
                      value={lang} 
                      onChange={(e) => setLang(e.target.value)}
                      className="bg-gray-100 dark:bg-gray-800 dark:text-gray-300 border-none rounded-md text-xs p-1 focus:ring-0"
                    >
                      {Object.keys(LANGUAGES).map(k => (
                        <option key={k} value={k}>{LANGUAGES[k]}</option>
                      ))}
                    </select>
                 </div>
              </div>
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <button onClick={logout} className="flex items-center w-full p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 font-bold transition-colors">
                <LogOut size={18} className="mr-3" /> {t.logout}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 mb-24 md:mb-6">
        {children}
      </main>

      {/* Floating Bottom Nav for Mobile */}
      {user && (
        <nav className="md:hidden fixed bottom-6 left-4 right-4 bg-white dark:bg-gray-900 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl flex justify-between px-2 py-2 z-30 shadow-2xl shadow-black/10 ring-1 ring-black/5">
           {role === 'student' || !role ? (
              // Student Nav with Central Plus Button (Also default)
              <>
                 <div className="flex-1 flex justify-around items-center">
                    <NavIcon icon={<Home />} label="Home" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
                    <NavIcon icon={<Bot />} label="AI Chat" active={view === 'chat'} onClick={() => setView('chat')} />
                 </div>
                 
                 <div className="relative -top-8 mx-2">
                    <button 
                      onClick={() => setCreateModalOpen(true)}
                      className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-400/40 text-black transform transition-transform active:scale-95 border-4 border-gray-50 dark:border-black"
                    >
                      <Plus size={32} strokeWidth={3} />
                    </button>
                 </div>

                 <div className="flex-1 flex justify-around items-center">
                    <NavIcon icon={<Bell />} label="Alerts" active={view === 'notifications'} onClick={() => setView('notifications')} />
                    <NavIcon icon={<User />} label="Profile" active={view === 'profile'} onClick={() => setView('profile')} />
                 </div>
              </>
           ) : (
              // Standard Nav for other roles
              <>
                 <NavIcon icon={<Home />} label="Home" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
                 <NavIcon icon={<Bot />} label="AI Chat" active={view === 'chat'} onClick={() => setView('chat')} />
                 {role === 'delivery' && <NavIcon icon={<MapPin />} label="Map" active={view === 'map'} onClick={() => setView('map')} />}
                 <NavIcon icon={<User />} label="Profile" active={view === 'profile'} onClick={() => setView('profile')} />
              </>
           )}
        </nav>
      )}
    </div>
  );
};

const NavIcon = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 w-16 ${active ? 'text-black dark:text-yellow-400 bg-gray-100 dark:bg-gray-800' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
    {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 2 })}
    {/* <span className="text-[10px] font-bold mt-1">{label}</span> */}
  </button>
);

// --- FEATURE COMPONENTS ---

const AIButton = ({ onClick, loading, label }: any) => (
  <button
    type="button"
    onClick={onClick}
    disabled={loading}
    className="flex items-center space-x-2 bg-black dark:bg-yellow-400 text-white dark:text-black px-4 py-2 rounded-lg shadow hover:bg-gray-800 dark:hover:bg-yellow-500 transition-all disabled:opacity-70 text-sm font-medium border border-gray-800 dark:border-yellow-500"
  >
    {loading ? <Spinner color="border-white dark:border-black" /> : <Sparkles size={16} className="text-yellow-400 dark:text-black" />}
    <span>{label}</span>
  </button>
);

const StatusBadge = ({ status }: { status: string }) => {
  const colors: any = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-700",
    accepted: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700",
    completed: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700",
    delivered: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
    picked_up: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-700",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${colors[status] || "bg-gray-100"}`}>
      {status}
    </span>
  );
};

// --- NEW SCREENS ---

const ProfileScreen = () => {
  const { user, role } = useContext(UserContext);
  const { t } = useContext(LangContext);
  
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold dark:text-yellow-400">{t.profile}</h2>
      
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
         <div className="h-32 bg-yellow-400 relative"></div>
         <div className="px-6 pb-6 relative">
            <div className="absolute -top-12 left-6">
               <div className="h-24 w-24 bg-black rounded-full flex items-center justify-center text-yellow-400 text-3xl font-bold border-4 border-white dark:border-gray-900">
                  {user?.email?.[0].toUpperCase()}
               </div>
            </div>
            
            <div className="mt-14 space-y-1">
               <h3 className="text-xl font-bold text-black dark:text-white">{user?.email}</h3>
               <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{role}</p>
            </div>

            <div className="mt-6 grid gap-4">
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                  <input type="text" value={user?.email} disabled className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-500 dark:text-gray-400" />
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                  <div className="flex">
                    <input type="tel" placeholder="+91 98765 43210" className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400 outline-none dark:text-white" />
                  </div>
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bio</label>
                  <textarea rows={3} placeholder="Tell us about yourself..." className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400 outline-none dark:text-white"></textarea>
               </div>
               <button className="bg-black dark:bg-yellow-400 text-yellow-400 dark:text-black font-bold py-3 rounded-lg hover:opacity-90 transition-opacity">
                  Save Changes
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

const TermsScreen = () => {
  const { t } = useContext(LangContext);
  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
      <h1 className="text-2xl font-bold mb-6 dark:text-yellow-400">{t.terms}</h1>
      <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
        <p><strong>1. Introduction</strong><br/>Welcome to LIKHO. By using our app, you agree to these terms.</p>
        <p><strong>2. Academic Integrity</strong><br/>LIKHO is designed to assist students. We do not condone plagiarism or academic dishonesty. All work provided by writers is for reference and guidance purposes only.</p>
        <p><strong>3. Payments</strong><br/>All payments are processed securely. Refunds are subject to our refund policy and case-by-case review.</p>
        <p><strong>4. User Conduct</strong><br/>Users must treat writers and delivery partners with respect. Harassment of any kind will result in immediate account termination.</p>
        <p><strong>5. Delivery</strong><br/>Physical deliveries are subject to local availability and traffic conditions. We strive for on-time delivery but cannot guarantee it in force majeure events.</p>
      </div>
    </div>
  );
};

const NotificationsScreen = () => {
  const notifications = [
    { id: 1, title: "Order Accepted", desc: "Your assignment 'History of India' has been accepted by a writer.", time: "2 mins ago", type: "success" },
    { id: 2, title: "System Update", desc: "We have updated our privacy policy.", time: "1 hour ago", type: "info" },
    { id: 3, title: "Welcome to LIKHO", desc: "Get started by creating your first assignment.", time: "1 day ago", type: "welcome" }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold dark:text-yellow-400 mb-4">Notifications</h2>
      {notifications.map(n => (
        <div key={n.id} className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex items-start space-x-4">
           <div className={`p-2 rounded-full ${n.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
             <Bell size={20} />
           </div>
           <div className="flex-1">
             <h4 className="font-bold text-gray-900 dark:text-white">{n.title}</h4>
             <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{n.desc}</p>
             <span className="text-xs text-gray-400 mt-2 block">{n.time}</span>
           </div>
           <div className="h-2 w-2 bg-yellow-400 rounded-full"></div>
        </div>
      ))}
    </div>
  );
};

const HelpScreen = () => (
    <div className="max-w-2xl mx-auto text-center py-12">
        <Shield size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-2 dark:text-white">Help & Support</h2>
        <p className="text-gray-500 mb-6">Need assistance? Reach out to our support team.</p>
        <button className="bg-black dark:bg-yellow-400 text-white dark:text-black font-bold px-8 py-3 rounded-full hover:opacity-90">
            Contact Support
        </button>
    </div>
);

const ChatScreen = () => {
  const { user } = useContext(UserContext);
  const [messages, setMessages] = useState<any[]>([
    { id: 'welcome', text: `Hi! I'm your AI academic assistant. You can ask me any question about your assignments, general knowledge, or how to use the app.`, sender: 'ai', timestamp: new Date() }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<any>(null);

  // Maintain chat history for context
  const chatSession = useRef<any>(null);

  useEffect(() => {
    if (!chatSession.current) {
      chatSession.current = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: "You are a helpful assistant for the LIKHO app. You help with academic queries, writing tips, and explaining how the app works. You can answer general knowledge questions as well. Keep answers concise and helpful."
        }
      });
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { id: Date.now().toString(), text: input, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const result = await chatSession.current.sendMessage({ message: input });
      const aiMsg = { id: (Date.now() + 1).toString(), text: result.text, sender: 'ai', timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: Date.now().toString(), text: "Sorry, I'm having trouble connecting right now.", sender: 'ai', timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-inner">
      <div className="bg-black text-yellow-400 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot size={24} />
          <h2 className="font-bold text-lg">AI Assistant</h2>
        </div>
        <div className="text-xs text-gray-400">Powered by Gemini</div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${
              msg.sender === 'user' 
                ? 'bg-yellow-400 text-black rounded-tr-none shadow-md font-medium' 
                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-tl-none shadow-sm'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              <span className="text-[10px] opacity-50 mt-1 block text-right">
                {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none border border-gray-200 dark:border-gray-700 shadow-sm">
               <div className="flex space-x-1">
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
               </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex space-x-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask any question..." 
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-gray-50 dark:bg-gray-800 dark:text-white"
        />
        <button 
          type="submit" 
          disabled={loading || !input.trim()}
          className="bg-black text-yellow-400 p-2.5 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

// --- AUTH SCREENS ---

const AuthScreen = () => {
  const { t, setLang, lang } = useContext(LangContext);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [kycFile, setKycFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isRegister) {
        if (role !== 'student' && !kycFile) throw new Error("KYC Document required for Writers and Delivery Partners");
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", res.user.uid), {
          email,
          role,
          createdAt: serverTimestamp(),
          kycStatus: role === 'student' ? 'approved' : 'pending'
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-white dark:from-gray-900 dark:to-black p-4 font-sans transition-colors">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-800">
        <div className="text-center mb-8">
          <div className="bg-yellow-400 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-400/30 border-2 border-black transform rotate-6 hover:rotate-0 transition-all duration-300">
            <PenTool className="text-black w-10 h-10" />
          </div>
          <h1 className="text-4xl font-extrabold text-black dark:text-yellow-400 tracking-tight mb-2">LIKHO</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">{t.tagline}</p>
        </div>

        <div className="flex justify-center space-x-3 mb-8">
          {Object.keys(LANGUAGES).map(l => (
            <button key={l} onClick={() => setLang(l)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${lang === l ? 'bg-black text-yellow-400 scale-105 shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 hover:bg-gray-200'}`}>
              {LANGUAGES[l]}
            </button>
          ))}
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 ml-1">{t.email}</label>
            <input 
              type="email" 
              required
              className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-yellow-400 text-black dark:text-white placeholder-gray-400 rounded-xl focus:ring-0 outline-none transition-all font-medium"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 ml-1">{t.password}</label>
            <input 
              type="password" 
              required
              className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-yellow-400 text-black dark:text-white placeholder-gray-400 rounded-xl focus:ring-0 outline-none transition-all font-medium"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {isRegister && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <div>
                <label className="block text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">{t.role}</label>
                <div className="grid grid-cols-3 gap-2">
                  {['student', 'writer', 'delivery'].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-2.5 px-1 text-xs sm:text-sm border-2 rounded-xl capitalize font-bold transition-all ${role === r ? 'bg-yellow-400 text-black border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] translate-x-[-1px] translate-y-[-1px]' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700'}`}
                    >
                      {t[r]}
                    </button>
                  ))}
                </div>
              </div>

              {role !== 'student' && (
                <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-200 dark:border-yellow-900/30">
                  <h4 className="font-bold text-yellow-900 dark:text-yellow-500 text-sm flex items-center mb-2">
                    <Shield size={16} className="mr-2" /> {t.kyc}
                  </h4>
                  <p className="text-xs text-yellow-700 dark:text-yellow-600 mb-3">{t.kycDesc}</p>
                  <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-yellow-400 rounded-lg cursor-pointer bg-white dark:bg-gray-800 hover:bg-yellow-50 dark:hover:bg-gray-700 transition-colors">
                    <Camera className="text-yellow-600 dark:text-yellow-500 mb-1" size={20} />
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{kycFile ? kycFile.name : "Upload ID"}</span>
                    <input type="file" className="hidden" onChange={e => setKycFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              )}
            </div>
          )}

          {error && <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900 font-medium">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black dark:bg-yellow-400 text-yellow-400 dark:text-black py-4 rounded-xl font-extrabold hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/20 dark:shadow-yellow-400/20 disabled:opacity-70 mt-4 text-lg"
          >
            {loading ? <Spinner color="border-yellow-400 dark:border-black" /> : (isRegister ? t.register : t.login)}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          {isRegister ? "Already have an account? " : "New to LIKHO? "}
          <button onClick={() => setIsRegister(!isRegister)} className="text-black dark:text-white font-bold hover:underline decoration-yellow-400 decoration-2 underline-offset-4">
            {isRegister ? t.login : t.register}
          </button>
        </p>
      </div>
    </div>
  );
};

// --- STUDENT DASHBOARD ---

const CreateAssignment = ({ onClose }: any) => {
  const { user } = useContext(UserContext);
  const { t } = useContext(LangContext);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [desc, setDesc] = useState("");
  const [type, setType] = useState("digital"); // digital | handwritten
  const [deadline, setDeadline] = useState("");
  const [price, setPrice] = useState(0);
  
  // New State
  const [files, setFiles] = useState<File[]>([]);
  const [pages, setPages] = useState(1);
  const [sides, setSides] = useState<'single' | 'double'>('single');
  const [isUrgent, setIsUrgent] = useState(false);
  const [baseEstimate, setBaseEstimate] = useState(0);

  const calculateTotalPrice = (base: number, pageCount: number, sideType: string, date: string) => {
    let p = base;
    // Add page cost
    const pageCost = sideType === 'single' ? 30 : 50; // 30 per page or 50 per sheet (double)
    p += (pageCount * pageCost);
    
    // Check urgency
    if (date) {
      const now = new Date();
      const due = new Date(date);
      const diffHrs = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (diffHrs < 24 && diffHrs > 0) {
        setIsUrgent(true);
        p = Math.ceil(p * 1.5); // 1.5x Multiplier
      } else {
        setIsUrgent(false);
      }
    }
    return p;
  };

  useEffect(() => {
    const total = calculateTotalPrice(baseEstimate, pages, sides, deadline);
    setPrice(total);
  }, [baseEstimate, pages, sides, deadline]);

  const improveWithAI = async () => {
    if (!desc) return;
    setAiLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Improve these assignment instructions for a writer. Make them clear, structured, and academic. Output only the improved text. Input: ${desc}`,
      });
      setDesc(response.text);
      
      // Auto price estimation for complexity
      const priceResp = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Estimate a base complexity price in INR for an assignment on "${subject}" with these details: "${response.text}". Return only a number (integer), minimum 200.`,
      });
      const est = parseInt(priceResp.text.replace(/[^0-9]/g, '')) || 200;
      setBaseEstimate(est);
    } catch (e) {
      console.error(e);
      setBaseEstimate(200); // Fallback
    } finally {
      setAiLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Upload files to Storage (Simulated here as we assume bucket is ready)
      const fileUrls = [];
      for (const file of files) {
        // const storageRef = ref(storage, `uploads/${user.uid}/${Date.now()}_${file.name}`);
        // await uploadBytes(storageRef, file);
        // const url = await getDownloadURL(storageRef);
        // fileUrls.push(url);
        fileUrls.push("https://via.placeholder.com/150"); // Mock URL
      }

      // 2. Add Doc
      await addDoc(collection(db, "assignments"), {
        studentId: user.uid,
        studentEmail: user.email,
        subject,
        description: desc,
        type,
        deadline,
        price,
        pages,
        sides,
        isUrgent,
        fileUrls,
        status: "pending",
        createdAt: serverTimestamp()
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Subject */}
      <div>
        <label className="block text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 ml-1">{t.subject}</label>
        <input 
          required
          className="w-full px-4 py-3 border-2 border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white rounded-xl focus:border-yellow-400 focus:ring-0 outline-none transition-all font-medium"
          value={subject} 
          onChange={e => setSubject(e.target.value)}
          placeholder="e.g. History of Modern India"
        />
      </div>

      {/* Description & AI */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="block text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">{t.desc}</label>
          <AIButton onClick={improveWithAI} loading={aiLoading} label={t.aiHelp} />
        </div>
        <textarea 
          required
          rows={4}
          className="w-full px-4 py-3 border-2 border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white rounded-xl focus:border-yellow-400 focus:ring-0 outline-none transition-all font-medium"
          value={desc} 
          onChange={e => setDesc(e.target.value)}
          placeholder="Briefly describe what you need..."
        />
      </div>

      {/* Assignment Type */}
      <div className="grid grid-cols-2 gap-3">
        <label className={`flex flex-col items-center justify-center p-3 rounded-xl cursor-pointer transition-all border-2 ${type === 'digital' ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
          <input type="radio" name="type" value="digital" checked={type === 'digital'} onChange={() => setType('digital')} className="hidden" />
          <FileText className={`mb-2 ${type === 'digital' ? 'text-black dark:text-yellow-400' : 'text-gray-400'}`} size={24} />
          <span className={`text-sm font-bold ${type === 'digital' ? 'text-black dark:text-yellow-400' : 'text-gray-500'}`}>{t.digital}</span>
        </label>
        <label className={`flex flex-col items-center justify-center p-3 rounded-xl cursor-pointer transition-all border-2 ${type === 'handwritten' ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
          <input type="radio" name="type" value="handwritten" checked={type === 'handwritten'} onChange={() => setType('handwritten')} className="hidden" />
          <PenTool className={`mb-2 ${type === 'handwritten' ? 'text-black dark:text-yellow-400' : 'text-gray-400'}`} size={24} />
          <span className={`text-sm font-bold ${type === 'handwritten' ? 'text-black dark:text-yellow-400' : 'text-gray-500'}`}>{t.handwritten}</span>
        </label>
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">{t.uploadFiles}</label>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer relative bg-gray-50 dark:bg-black/20">
          <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          <CloudUpload className="mx-auto text-gray-400 mb-2" size={32} />
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Click or drag files here</p>
        </div>
        {files.length > 0 && (
          <div className="mt-3 space-y-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-2 truncate">
                  <File size={16} className="text-yellow-500 shrink-0" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[150px]">{f.name}</span>
                </div>
                <button type="button" onClick={() => removeFile(i)} className="text-red-500 p-1 hover:bg-red-50 rounded">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pages & Deadline */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 ml-1">{t.pages}</label>
          <input 
            type="number"
            min="1"
            className="w-full px-4 py-3 border-2 border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white rounded-xl focus:border-yellow-400 focus:ring-0 outline-none font-medium"
            value={pages} 
            onChange={e => setPages(parseInt(e.target.value) || 1)}
          />
        </div>
        <div>
          <label className="block text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 ml-1">{t.deadline}</label>
          <input 
            type="date"
            required
            className="w-full px-4 py-3 border-2 border-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:text-white rounded-xl focus:border-yellow-400 focus:ring-0 outline-none font-medium"
            value={deadline} 
            onChange={e => setDeadline(e.target.value)}
          />
        </div>
      </div>

      {/* Sides */}
      <div>
        <label className="block text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">{t.sides}</label>
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <button 
            type="button" 
            onClick={() => setSides('single')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${sides === 'single' ? 'bg-white dark:bg-gray-700 shadow-sm text-black dark:text-white' : 'text-gray-500'}`}
          >
            {t.singleSided}
          </button>
          <button 
            type="button" 
            onClick={() => setSides('double')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${sides === 'double' ? 'bg-white dark:bg-gray-700 shadow-sm text-black dark:text-white' : 'text-gray-500'}`}
          >
            {t.doubleSided}
          </button>
        </div>
      </div>

      {/* Price Display */}
      <div className="bg-black dark:bg-yellow-400 p-4 rounded-xl shadow-lg border border-gray-800 dark:border-yellow-500">
        <div className="flex justify-between items-center mb-1">
          <span className="text-gray-400 dark:text-black text-sm font-medium">{t.price}</span>
          <span className="text-yellow-400 dark:text-black font-extrabold text-2xl">₹{price}</span>
        </div>
        {isUrgent && (
           <div className="flex items-center space-x-1 text-red-400 dark:text-red-700 text-xs font-bold bg-red-900/30 dark:bg-red-100 px-2 py-1 rounded w-fit">
             <Zap size={12} fill="currentColor" />
             <span>{t.urgency}</span>
           </div>
        )}
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-yellow-400 dark:bg-black text-black dark:text-yellow-400 py-3.5 rounded-xl font-extrabold hover:translate-y-[2px] hover:shadow-none shadow-[0_4px_0_rgb(0,0,0)] dark:shadow-[0_4px_0_rgba(250,204,21,1)] transition-all border-2 border-black dark:border-yellow-400 text-lg"
      >
        {loading ? <Spinner color="border-black dark:border-yellow-400" /> : t.pay + " & " + t.submit}
      </button>
    </form>
  );
};

const StudentDashboard = () => {
  const { user } = useContext(UserContext);
  const { t } = useContext(LangContext);
  const { setView, createModalOpen, setCreateModalOpen } = useContext(ViewContext);
  const [orders, setOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "assignments"), where("studentId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  const filteredOrders = orders.filter(o => 
    o.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const activeCount = orders.filter(o => o.status !== 'completed' && o.status !== 'delivered').length;
  const completedCount = orders.filter(o => o.status === 'completed' || o.status === 'delivered').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-black text-white p-8 md:p-10 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2 animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div className="space-y-2">
              <span className="inline-block py-1 px-3 rounded-full bg-yellow-400/20 text-yellow-400 text-xs font-bold uppercase tracking-widest border border-yellow-400/20">
                 Student Dashboard
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                 {t.hello}, <br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">{user.email.split('@')[0]}</span>
              </h1>
              <p className="text-gray-400 font-medium text-lg">{t.readyToExcel}</p>
           </div>
           
           <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center min-w-[100px]">
                 <div className="text-3xl font-black text-yellow-400">{activeCount}</div>
                 <div className="text-xs text-gray-300 font-bold uppercase tracking-wider">Active</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center min-w-[100px]">
                 <div className="text-3xl font-black text-white">{completedCount}</div>
                 <div className="text-xs text-gray-300 font-bold uppercase tracking-wider">Done</div>
              </div>
           </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 sticky top-20 z-20 bg-gray-50/90 dark:bg-black/90 backdrop-blur-sm py-2">
        <h2 className="text-2xl font-extrabold text-black dark:text-white tracking-tight self-start md:self-center">{t.myOrders}</h2>
        
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-72 group">
            <Search className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-yellow-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder={t.search} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-900 border-2 border-transparent focus:border-yellow-400 dark:border-gray-800 dark:focus:border-yellow-400 rounded-2xl text-sm shadow-sm outline-none transition-all font-medium dark:text-white"
            />
          </div>
          <button 
            onClick={() => setView('chat')}
            className="bg-black text-yellow-400 p-3 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/10"
            title={t.askAI}
          >
            <Bot size={24} />
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {/* Add New Card (Desktop) */}
         <div 
           onClick={() => setCreateModalOpen(true)} 
           className="hidden md:flex flex-col items-center justify-center min-h-[280px] bg-white dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl cursor-pointer hover:border-yellow-400 dark:hover:border-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-all group"
         >
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-5 rounded-full group-hover:scale-110 transition-transform duration-300 mb-4">
               <Plus className="w-8 h-8 text-yellow-600 dark:text-yellow-400" strokeWidth={3} />
            </div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{t.newAssignment}</h3>
            <p className="text-sm text-gray-500 font-medium">Create a new order</p>
         </div>

        {filteredOrders.map((order, idx) => (
          <div key={order.id} className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between h-full animate-in slide-in-from-bottom-8 fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
            {order.isUrgent && <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-3 py-1 rounded-bl-xl font-bold tracking-wider z-10 shadow-md">URGENT</div>}
            
            <div>
              <div className="flex justify-between items-start mb-4">
                <StatusBadge status={order.status} />
                <span className="text-xs text-gray-400 dark:text-gray-500 font-bold bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg">{order.createdAt?.toDate().toLocaleDateString()}</span>
              </div>
              
              <h3 className="font-extrabold text-xl text-black dark:text-white line-clamp-2 mb-2 leading-tight group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                {order.subject}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6 font-medium leading-relaxed">
                {order.description}
              </p>
            </div>
            
            <div className="mt-auto">
               <div className="flex items-center justify-between pt-4 border-t border-dashed border-gray-200 dark:border-gray-800 mb-4">
                 <div className="flex items-center text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                    {order.type === 'handwritten' ? <PenTool size={12} className="mr-1.5" /> : <FileText size={12} className="mr-1.5" />}
                    {order.type === 'handwritten' ? 'Handwritten' : 'Digital'}
                 </div>
                 <div className="text-right">
                    <span className="block font-black text-black dark:text-white text-xl">₹{order.price}</span>
                 </div>
               </div>
               
               {order.status !== 'pending' && (
                  <button className="w-full bg-black text-white dark:bg-white dark:text-black py-3 rounded-xl text-xs font-bold hover:opacity-90 flex justify-center items-center transition-all active:scale-95">
                    <MessageCircle size={14} className="mr-2" /> Chat with Writer
                  </button>
               )}
            </div>
          </div>
        ))}
        
        {filteredOrders.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-400 dark:text-gray-500">
             <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <FileText className="w-10 h-10 text-gray-300 dark:text-gray-600" />
             </div>
             <p className="font-bold text-lg">No assignments found</p>
             <p className="text-sm">Tap the + button to create one!</p>
          </div>
        )}
      </div>

      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title={t.newAssignment}>
        <CreateAssignment onClose={() => setCreateModalOpen(false)} />
      </Modal>
    </div>
  );
};

const WriterDashboard = () => {
  const { user } = useContext(UserContext);
  const { dashboardTab, setDashboardTab } = useContext(ViewContext);
  const { t } = useContext(LangContext);
  const [orders, setOrders] = useState<any[]>([]);
  // Use the shared tab state from ViewContext or local state if not present
  const [localTab, setLocalTab] = useState('available');
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false);
  
  const activeTab = dashboardTab || localTab;
  const setActiveTab = setDashboardTab || setLocalTab;

  useEffect(() => {
    if (!user) return;
    let q;
    if (activeTab === 'available') {
      q = query(collection(db, "assignments"), where("status", "==", "pending"));
    } else {
      q = query(collection(db, "assignments"), where("writerId", "==", user.uid));
    }
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user, activeTab]);

  const acceptOrder = async (orderId: string) => {
    await updateDoc(doc(db, "assignments", orderId), {
      status: "accepted",
      writerId: user.uid,
      writerEmail: user.email
    });
  };

  const completeOrder = async (orderId: string) => {
    await updateDoc(doc(db, "assignments", orderId), {
      status: "completed", 
      completedAt: serverTimestamp()
    });
  };

  // Derived Earnings Data
  const completedOrders = orders.filter(o => ['completed', 'picked_up', 'delivered'].includes(o.status));
  const totalEarnings = completedOrders.reduce((acc, curr) => acc + (parseInt(curr.price) || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'accepted');
  const pendingAmount = pendingOrders.reduce((acc, curr) => acc + (parseInt(curr.price) || 0), 0);
  // Simulating available balance as 80% of total earnings for this example
  const availableBalance = Math.floor(totalEarnings * 0.8);

  const handleWithdraw = () => {
    setIsWithdrawLoading(true);
    setTimeout(() => {
        setIsWithdrawLoading(false);
        alert("Payout of ₹" + availableBalance + " initiated via RazorpayX to your linked bank account.");
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('available')}
          className={`py-2 px-4 whitespace-nowrap rounded-md font-bold text-sm transition-all ${activeTab === 'available' ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
        >
          Available Tasks
        </button>
        <button 
          onClick={() => setActiveTab('my-tasks')}
          className={`py-2 px-4 whitespace-nowrap rounded-md font-bold text-sm transition-all ${activeTab === 'my-tasks' ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
        >
          My Workspace
        </button>
        <button 
          onClick={() => setActiveTab('earnings')}
          className={`py-2 px-4 whitespace-nowrap rounded-md font-bold text-sm transition-all ${activeTab === 'earnings' ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
        >
          {t.earnings}
        </button>
      </div>

      {activeTab === 'earnings' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {/* Stats Cards */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-gray-900 to-black text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Wallet size={48} />
                 </div>
                 <p className="text-gray-400 text-sm font-medium">{t.availableBalance}</p>
                 <h3 className="text-3xl font-bold mt-1">₹{availableBalance}</h3>
                 <div className="mt-4 flex items-center text-xs text-green-400">
                    <ArrowUpRight size={14} className="mr-1" /> Ready to withdraw
                 </div>
              </div>
              
              <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
                 <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t.lifetimeEarnings}</p>
                 <h3 className="text-2xl font-bold text-black dark:text-white mt-1">₹{totalEarnings}</h3>
              </div>

              <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
                 <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t.pendingClearance}</p>
                 <h3 className="text-2xl font-bold text-yellow-500 mt-1">₹{pendingAmount}</h3>
              </div>
           </div>

           {/* Withdraw Section */}
           <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                 <div className="bg-yellow-400 p-3 rounded-full text-black">
                    <CreditCard size={24} />
                 </div>
                 <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">RazorpayX Payout</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Instant transfer to your linked bank account ending in **45.</p>
                 </div>
              </div>
              <button 
                onClick={handleWithdraw}
                disabled={isWithdrawLoading || availableBalance === 0}
                className="bg-black dark:bg-yellow-400 text-white dark:text-black px-6 py-3 rounded-lg font-bold shadow-lg hover:opacity-90 disabled:opacity-50 min-w-[160px] flex justify-center"
              >
                {isWithdrawLoading ? <Spinner color="border-white dark:border-black" /> : t.withdraw}
              </button>
           </div>

           {/* Transaction History */}
           <div>
              <h3 className="text-lg font-bold text-black dark:text-white mb-4 flex items-center">
                <History size={18} className="mr-2" /> {t.history}
              </h3>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                {completedOrders.length > 0 ? (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {completedOrders.map((order) => (
                      <div key={order.id} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                         <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                               <ArrowUpRight size={18} />
                            </div>
                            <div>
                               <p className="font-bold text-gray-900 dark:text-white text-sm">Payment for: {order.subject}</p>
                               <p className="text-xs text-gray-500">{order.completedAt?.toDate().toLocaleDateString() || 'Recently'}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="font-bold text-green-600 dark:text-green-400">+₹{order.price}</p>
                            <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">Credited</span>
                         </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-400">No transactions yet.</div>
                )}
              </div>
           </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between">
              <div className="mb-4 md:mb-0">
                 <div className="flex items-center space-x-2 mb-2">
                   <StatusBadge status={order.status} />
                   <span className="text-xs bg-black dark:bg-yellow-400 text-yellow-400 dark:text-black px-2 py-0.5 rounded font-bold">₹{order.price}</span>
                   {order.type === 'handwritten' && <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200 px-2 py-0.5 rounded flex items-center font-bold"><PenTool size={10} className="mr-1"/> Handwritten</span>}
                 </div>
                 <h3 className="font-bold text-xl text-black dark:text-white">{order.subject}</h3>
                 <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{order.description}</p>
                 <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center font-bold"><Clock size={12} className="mr-1"/> Deadline: {order.deadline}</p>
              </div>
              
              <div className="flex items-center space-x-3">
                {activeTab === 'available' && (
                  <button 
                    onClick={() => acceptOrder(order.id)}
                    className="bg-yellow-400 text-black px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-yellow-500 border border-yellow-500 shadow-sm"
                  >
                    Accept
                  </button>
                )}
                {activeTab === 'my-tasks' && order.status === 'accepted' && (
                  <button 
                    onClick={() => completeOrder(order.id)}
                    className="bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-green-700 flex items-center shadow-sm"
                  >
                    <CheckCircle size={16} className="mr-2" /> Mark Complete
                  </button>
                )}
                {activeTab === 'my-tasks' && (
                  <button className="p-2.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700">
                    <MessageCircle size={20} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {orders.length === 0 && (
             <div className="text-center py-12">
               <div className="inline-block p-4 rounded-full bg-gray-50 dark:bg-gray-800 mb-3">
                 <Book className="text-gray-300 dark:text-gray-500 h-8 w-8" />
               </div>
               <p className="text-gray-500 dark:text-gray-400 font-medium">No active assignments found.</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

const DeliveryDashboard = () => {
  const { user } = useContext(UserContext);
  const { t } = useContext(LangContext);
  const [tab, setTab] = useState("pickups"); // pickups | active
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    let q;
    if (tab === 'pickups') {
       // handwritten tasks that are marked completed by writer (ready for pickup)
       q = query(collection(db, "assignments"), where("type", "==", "handwritten"), where("status", "==", "completed"));
    } else {
       // active deliveries for this user
       q = query(collection(db, "assignments"), where("deliveryPartnerId", "==", user.uid));
    }
    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user, tab]);

  const startDelivery = async (id: string) => {
    await updateDoc(doc(db, "assignments", id), {
      status: "picked_up",
      deliveryPartnerId: user.uid,
      pickedUpAt: serverTimestamp()
    });
    setTab('active');
  };

  const completeDelivery = async (id: string) => {
    await updateDoc(doc(db, "assignments", id), {
      status: "delivered",
      deliveredAt: serverTimestamp()
    });
  };

  return (
    <div className="space-y-6">
       <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        <button 
          onClick={() => setTab('pickups')}
          className={`py-2 px-4 rounded-md font-bold text-sm transition-all ${tab === 'pickups' ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
        >
          {t.pickups}
        </button>
        <button 
          onClick={() => setTab('active')}
          className={`py-2 px-4 rounded-md font-bold text-sm transition-all ${tab === 'active' ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
        >
          {t.activeRides}
        </button>
      </div>

      <div className="grid gap-4">
        {tasks.map(task => (
           <div key={task.id} className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-start mb-4">
                 <div>
                    <h3 className="font-bold text-lg text-black dark:text-white">{task.subject}</h3>
                    <div className="flex items-center text-gray-500 text-sm mt-1">
                       <MapPin size={14} className="mr-1" />
                       <span>Writer Location → Student Location</span>
                    </div>
                 </div>
                 <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">
                    ₹50 Delivery Fee
                 </div>
              </div>
              
              {/* Map Placeholder */}
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg h-32 flex items-center justify-center mb-4 relative overflow-hidden">
                 <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=28.6139,77.2090&zoom=13&size=600x300&key=YOUR_KEY')] bg-cover bg-center opacity-50"></div>
                 <button className="relative bg-white dark:bg-black text-black dark:text-white px-4 py-2 rounded-full font-bold text-sm shadow flex items-center z-10">
                    <Navigation size={14} className="mr-2" /> {t.navigate}
                 </button>
              </div>

              {tab === 'pickups' && (
                 <button onClick={() => startDelivery(task.id)} className="w-full bg-black dark:bg-yellow-400 text-white dark:text-black py-3 rounded-lg font-bold">
                    Accept & Pickup
                 </button>
              )}

              {tab === 'active' && (
                 <div className="space-y-3">
                    <input type="text" placeholder={t.otp} className="w-full border p-2 rounded text-center font-bold tracking-widest" />
                    <button onClick={() => completeDelivery(task.id)} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold">
                       {t.confirmDelivery}
                    </button>
                 </div>
              )}
           </div>
        ))}
        {tasks.length === 0 && (
           <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No tasks found.
           </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // View State
  const [view, setView] = useState('dashboard'); // dashboard, profile, chat, notifications, terms, help, map
  const [dashboardTab, setDashboardTab] = useState(''); 
  const [lang, setLang] = useState('en');
  const [isDark, setIsDark] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    let unsubUserConf: any;

    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        setLoading(true); // Ensure loading is true while fetching doc
        // Subscribe to user doc for role
        unsubUserConf = onSnapshot(doc(db, "users", u.uid), 
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              setRole(data.role || 'student'); // Default to student if role field missing
            } else {
              // Doc missing (legacy user?), default to student
              setRole('student');
            }
            setLoading(false);
          },
          (error) => {
            console.error("User doc fetch error", error);
            // Even if failed, we allow access (role might be null, handle elsewhere or default)
            setRole('student');
            setLoading(false);
          }
        );
      } else {
        if (unsubUserConf) unsubUserConf();
        setUser(null);
        setRole(null);
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubUserConf) unsubUserConf();
    };
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const logout = () => {
    signOut(auth);
    setView('dashboard');
  };

  const t = (key: string) => {
    return (TRANSLATIONS as any)[lang]?.[key] || (TRANSLATIONS as any)['en'][key] || key;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  // Context Values
  const langCtx = { lang, setLang, t: (TRANSLATIONS as any)[lang] }; // simplified t accessor
  const userCtx = { user, role, logout };
  const viewCtx = { view, setView, dashboardTab, setDashboardTab, createModalOpen, setCreateModalOpen };
  const themeCtx = { isDark, setIsDark };

  if (!user) {
    return (
      <LangContext.Provider value={langCtx}>
        <ThemeContext.Provider value={themeCtx}>
          <AuthScreen />
        </ThemeContext.Provider>
      </LangContext.Provider>
    );
  }

  return (
    <UserContext.Provider value={userCtx}>
      <LangContext.Provider value={langCtx}>
        <ViewContext.Provider value={viewCtx}>
          <ThemeContext.Provider value={themeCtx}>
            <Layout>
               {view === 'dashboard' && (role === 'student' || !role) && <StudentDashboard />}
               {view === 'dashboard' && role === 'writer' && <WriterDashboard />}
               {view === 'dashboard' && role === 'delivery' && <DeliveryDashboard />}
               
               {view === 'profile' && <ProfileScreen />}
               {view === 'chat' && <ChatScreen />}
               {view === 'notifications' && <NotificationsScreen />}
               {view === 'terms' && <TermsScreen />}
               {view === 'help' && <HelpScreen />}
            </Layout>
          </ThemeContext.Provider>
        </ViewContext.Provider>
      </LangContext.Provider>
    </UserContext.Provider>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);