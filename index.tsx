import React, { useState, useEffect, useContext, createContext, useRef, useMemo, useCallback } from "react";
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
  writeBatch,
  limit
} from "firebase/firestore";
import {
  getStorage,
} from "firebase/storage";
import { 
  Book, PenTool, Truck, User, LogOut, MessageCircle, MapPin, FileText, 
  CheckCircle, Clock, DollarSign, Sparkles, Search, Menu, X, Send, 
  Camera, Navigation, Shield, Bot, Bell, Moon, Sun, ChevronRight, 
  FileCheck, Info, Phone, CloudUpload, File, Trash2, Zap, Wallet, 
  ArrowUpRight, History, CreditCard, Plus, Home, LayoutDashboard, 
  ToggleLeft, ToggleRight, Lock, Image as ImageIcon, Star, Users, 
  Loader2, MoreVertical, XCircle, Check, Map
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

// Enable offline persistence with error handling
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
      console.warn("Persistence failed: Multiple tabs open");
  } else if (err.code === 'unimplemented') {
      console.warn("Persistence failed: Browser not supported");
  }
});

// --- GEMINI AI SETUP ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- UTILS & HELPERS ---
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// --- CONTEXTS ---
const ToastContext = createContext<any>(null);
const UserContext = createContext<any>(null);
const ThemeContext = createContext<any>(null);
const ViewContext = createContext<any>(null);

// --- COMPONENT: TOAST NOTIFICATION ---
const ToastProvider = ({ children }: any) => {
  const [toasts, setToasts] = useState<any[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3000);
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`pointer-events-auto flex items-center p-4 rounded-xl shadow-2xl transform transition-all animate-in slide-in-from-right duration-300 ${
            t.type === 'success' ? 'bg-green-500 text-white' : 
            t.type === 'error' ? 'bg-red-500 text-white' : 'bg-gray-900 text-white'
          }`}>
            {t.type === 'success' && <CheckCircle size={18} className="mr-2" />}
            {t.type === 'error' && <XCircle size={18} className="mr-2" />}
            {t.type === 'info' && <Info size={18} className="mr-2" />}
            <span className="font-bold text-sm">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// --- REUSABLE UI ---
const GlassCard = ({ children, className = "", onClick }: any) => (
  <div onClick={onClick} className={`bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = "", disabled, loading, type = 'button' }: any) => {
  const baseStyle = "flex items-center justify-center px-6 py-3.5 rounded-xl font-extrabold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: any = {
    primary: "bg-black dark:bg-yellow-400 text-white dark:text-black hover:shadow-lg hover:-translate-y-0.5",
    secondary: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700",
    outline: "border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-black dark:hover:border-yellow-400",
    danger: "bg-red-50 text-red-600 hover:bg-red-100"
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : children}
    </button>
  );
};

const Input = ({ label, ...props }: any) => (
  <div className="space-y-1.5">
    {label && <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{label}</label>}
    <input 
      {...props}
      className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-yellow-400 dark:focus:border-yellow-400 rounded-2xl outline-none transition-all font-medium text-gray-900 dark:text-white placeholder-gray-400 ${props.className || ''}`}
    />
  </div>
);

const FileUploader = ({ files, setFiles }: any) => {
  const handleFile = (e: any) => {
    if (e.target.files) setFiles((prev: any) => [...prev, ...Array.from(e.target.files)]);
  };

  return (
    <div className="space-y-3">
      <label className="block w-full border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-yellow-400 dark:hover:border-yellow-400 bg-gray-50 dark:bg-gray-800/30 rounded-2xl p-8 cursor-pointer transition-colors text-center group">
        <input type="file" multiple className="hidden" onChange={handleFile} />
        <div className="bg-white dark:bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
          <CloudUpload className="text-yellow-500" size={24} />
        </div>
        <p className="font-bold text-gray-700 dark:text-gray-300">Tap to upload files</p>
        <p className="text-xs text-gray-400 mt-1">PDF, DOCX, JPG (Max 10MB)</p>
      </label>
      
      {files.length > 0 && (
        <div className="grid gap-2">
          {files.map((f: any, i: number) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                  <FileText size={16} />
                </div>
                <span className="text-sm font-medium truncate dark:text-gray-200">{f.name}</span>
              </div>
              <button onClick={() => setFiles((prev: any) => prev.filter((_: any, idx: number) => idx !== i))} className="text-red-400 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- WALLET MODAL ---
const WalletModal = ({ isOpen, onClose, balance }: any) => {
  const { addToast } = useContext(ToastContext);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!amount) return;
    setLoading(true);
    // Simulating Payment Gateway
    setTimeout(() => {
      setLoading(false);
      addToast(`Successfully added ₹${amount} to wallet!`, 'success');
      onClose();
    }, 1500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="My Wallet">
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-400 rounded-full mix-blend-overlay opacity-20 filter blur-3xl"></div>
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Available Balance</p>
          <h2 className="text-4xl font-black mt-2">₹{balance || 0}</h2>
          <div className="mt-6 flex items-center space-x-2 text-xs text-gray-400">
            <Shield size={12} />
            <span>Secure 256-bit SSL Encrypted</span>
          </div>
        </div>

        <div>
          <label className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-2 block">Add Money</label>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[100, 500, 1000].map(amt => (
              <button key={amt} onClick={() => setAmount(amt.toString())} className="py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm font-bold hover:bg-yellow-100 dark:hover:bg-yellow-900/20 dark:text-white transition-colors">
                + ₹{amt}
              </button>
            ))}
          </div>
          <Input 
            type="number" 
            placeholder="Enter amount (e.g. 250)" 
            value={amount} 
            onChange={(e: any) => setAmount(e.target.value)} 
            className="text-lg"
          />
        </div>

        <Button onClick={handleAdd} loading={loading} className="w-full" variant="primary">
          Proceed to Pay
        </Button>
      </div>
    </Modal>
  );
};

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-950 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:rotate-90 transition-transform">
            <X size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- CREATE ASSIGNMENT SCREEN ---
const CreateAssignment = ({ onClose }: any) => {
  const { user } = useContext(UserContext);
  const { addToast } = useContext(ToastContext);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    subject: "", desc: "", type: "digital", deadline: "", pages: 1, sides: "single", deliveryAddr: ""
  });
  const [files, setFiles] = useState<File[]>([]);
  const [price, setPrice] = useState(0);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const baseFee = 49; 
    const pageCost = formData.sides === 'single' ? 5 : 8;
    let total = baseFee + (Number(formData.pages) * pageCost);
    if (formData.deadline) {
      const hours = (new Date(formData.deadline).getTime() - new Date().getTime()) / 36e5;
      if (hours < 24 && hours > 0) {
        setIsUrgent(true);
        total = Math.ceil(total * 1.2);
      } else {
        setIsUrgent(false);
      }
    }
    setPrice(total > 0 ? total : 0);
  }, [formData]);

  const improveAI = async () => {
    if (!formData.desc) return addToast("Write a description first", "error");
    setAiLoading(true);
    try {
      const res = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Refine this request for clarity: "${formData.desc}". Keep it concise.`
      });
      setFormData(prev => ({ ...prev, desc: res.text }));
      addToast("Enhanced by AI", "success");
    } catch (e) {
      addToast("AI unavailable", "error");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "assignments"), {
        studentId: user.uid, studentEmail: user.email, ...formData, price, isUrgent,
        status: "pending", createdAt: serverTimestamp(), fileCount: files.length,
        otp: generateOTP(), isRated: false
      });
      addToast("Order placed successfully!", "success");
      onClose();
    } catch (e) {
      console.error(e);
      addToast("Failed to place order", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input label="Subject" value={formData.subject} onChange={(e: any) => setFormData({...formData, subject: e.target.value})} required placeholder="e.g. Calculus 101"/>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
          <button type="button" onClick={improveAI} disabled={aiLoading} className="text-xs flex items-center text-yellow-600 font-bold hover:underline">
            {aiLoading ? <Loader2 className="animate-spin mr-1" size={12}/> : <Sparkles size={12} className="mr-1"/>} AI Polish
          </button>
        </div>
        <textarea rows={3} value={formData.desc} onChange={(e) => setFormData({...formData, desc: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-yellow-400 rounded-2xl outline-none font-medium text-sm dark:text-white" placeholder="Details..." required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {['digital', 'handwritten'].map((t) => (
          <div key={t} onClick={() => setFormData({...formData, type: t})} className={`p-3 rounded-xl border-2 cursor-pointer flex flex-col items-center justify-center transition-all ${formData.type === t ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-100 dark:border-gray-700'}`}>
            {t === 'digital' ? <FileText size={20} className="mb-1 text-gray-700 dark:text-gray-300" /> : <PenTool size={20} className="mb-1 text-gray-700 dark:text-gray-300" />}
            <span className="text-xs font-bold capitalize dark:text-white">{t}</span>
          </div>
        ))}
      </div>

      {formData.type === 'handwritten' && (
        <Input label="Delivery Address" value={formData.deliveryAddr} onChange={(e: any) => setFormData({...formData, deliveryAddr: e.target.value})} required placeholder="Room 404, Hostel B" />
      )}

      <FileUploader files={files} setFiles={setFiles} />

      <div className="grid grid-cols-2 gap-4">
        <Input type="number" label="Pages" value={formData.pages} onChange={(e: any) => setFormData({...formData, pages: Math.max(1, parseInt(e.target.value) || 1)})} min="1" />
        <Input type="date" label="Deadline" value={formData.deadline} onChange={(e: any) => setFormData({...formData, deadline: e.target.value})} required />
      </div>

      <div className="bg-black dark:bg-yellow-400 text-white dark:text-black p-5 rounded-2xl flex justify-between items-center shadow-lg">
        <div><p className="text-xs opacity-70 font-bold uppercase">Estimated Cost</p><div className="text-3xl font-black">₹{price}</div></div>
        {isUrgent && <div className="bg-red-500 text-white text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider animate-pulse">Urgent Fee</div>}
      </div>

      <Button type="submit" loading={loading} className="w-full text-lg">Pay & Submit</Button>
    </form>
  );
};

// --- STUDENT DASHBOARD ---
const StudentDashboard = () => {
  const { user } = useContext(UserContext);
  const [orders, setOrders] = useState<any[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "assignments"), where("studentId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [user]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-black dark:text-white">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user.email?.split('@')[0]}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setWalletOpen(true)} className="!px-4"><Wallet size={20}/></Button>
          <Button onClick={() => setCreateOpen(true)}><Plus size={20} className="mr-2"/> New Order</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-400"><Book size={48} className="mx-auto mb-4 opacity-50"/><p>No orders yet. Start by creating one!</p></div>
        )}
        {orders.map((order) => (
          <GlassCard key={order.id} className="p-6 hover:shadow-lg transition-all group">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>{order.status}</span>
              <span className="text-xl font-black">₹{order.price}</span>
            </div>
            <h3 className="font-bold text-lg mb-2 line-clamp-1">{order.subject}</h3>
            <p className="text-sm text-gray-500 mb-6 line-clamp-2">{order.description}</p>
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <div className="text-xs text-gray-400 font-mono">OTP: <span className="text-black dark:text-white font-bold">{order.otp}</span></div>
              <span className="text-xs text-gray-400">{new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}</span>
            </div>
          </GlassCard>
        ))}
      </div>
      
      <CreateAssignmentModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
      <WalletModal isOpen={walletOpen} onClose={() => setWalletOpen(false)} balance={1250} />
    </div>
  );
};

const CreateAssignmentModal = ({ isOpen, onClose }: any) => {
    if(!isOpen) return null;
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="New Assignment">
            <CreateAssignment onClose={onClose} />
        </Modal>
    )
}

// --- AUTH SCREEN ---
const AuthScreen = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const { addToast } = useContext(ToastContext);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", res.user.uid), {
          email, role, createdAt: serverTimestamp(), kycStatus: role === 'student' ? 'approved' : 'pending'
        });
        addToast("Account created!", "success");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        addToast("Welcome back!", "success");
      }
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-black">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800">
        <div className="text-center mb-8">
          <div className="bg-yellow-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transform -rotate-6 shadow-lg"><PenTool className="text-black" size={32}/></div>
          <h1 className="text-3xl font-black text-black dark:text-white">LIKHO</h1>
          <p className="text-gray-500">Academic Excellence Delivered</p>
        </div>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e:any)=>setEmail(e.target.value)} required placeholder="you@college.edu"/>
          <Input label="Password" type="password" value={password} onChange={(e:any)=>setPassword(e.target.value)} required placeholder="••••••••"/>
          
          {isRegister && (
            <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
              {['student', 'writer', 'delivery'].map(r => (
                <button key={r} type="button" onClick={() => setRole(r)} className={`py-2 text-xs font-bold capitalize rounded-lg transition-all ${role === r ? 'bg-white dark:bg-black shadow-sm text-black dark:text-yellow-400' : 'text-gray-500'}`}>{r}</button>
              ))}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full">{isRegister ? "Start Journey" : "Login"}</Button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-500">
          {isRegister ? "Have an account?" : "New here?"} <button onClick={() => setIsRegister(!isRegister)} className="font-bold text-black dark:text-white hover:underline">{isRegister ? "Login" : "Register"}</button>
        </p>
      </div>
    </div>
  );
};

// --- LAYOUT ---
const Layout = ({ children }: any) => {
  const { user, logout, role } = useContext(UserContext);
  const { isDark, setIsDark } = useContext(ThemeContext);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-black dark:text-white transition-colors duration-300">
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-yellow-400 p-1.5 rounded-lg"><PenTool size={20} className="text-black"/></div>
             <span className="font-black text-xl tracking-tighter">LIKHO</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              {isDark ? <Sun size={20}/> : <Moon size={20}/>}
            </button>
            {user && (
              <button onClick={logout} className="p-2 rounded-full hover:bg-red-50 text-red-500">
                <LogOut size={20}/>
              </button>
            )}
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-8 mb-20">{children}</main>
    </div>
  );
};

// --- APP ROOT ---
const App = () => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState("student");
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const snap = await getDoc(doc(db, "users", u.uid));
        setRole(snap.data()?.role || "student");
        setUser(u);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-yellow-400" size={40}/></div>;

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      <ToastProvider>
        <UserContext.Provider value={{ user, role, logout: () => signOut(auth) }}>
          <ViewContext.Provider value={{}}>
            {user ? (
              <Layout>
                {role === 'student' && <StudentDashboard />}
                {/* Add other dashboards here similarly */}
                {role !== 'student' && <div className="text-center py-20">Writer/Delivery Dashboard Placeholder</div>}
              </Layout>
            ) : (
              <AuthScreen />
            )}
          </ViewContext.Provider>
        </UserContext.Provider>
      </ToastProvider>
    </ThemeContext.Provider>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);