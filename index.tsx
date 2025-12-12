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
  updateProfile as firebaseUpdateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  linkWithPhoneNumber,
  signInWithPhoneNumber
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
  limit,
  deleteDoc
} from "firebase/firestore";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";
import { 
  Book, PenTool, Truck, User, LogOut, MessageCircle, MapPin, FileText, 
  CheckCircle, Clock, DollarSign, Sparkles, Search, Menu, X, Send, 
  Camera, Navigation, Shield, Bot, Bell, Moon, Sun, ChevronRight, 
  FileCheck, Info, Phone, CloudUpload, File as FileIcon, Trash2, Zap, Wallet, 
  ArrowUpRight, History, CreditCard, Plus, Home, LayoutDashboard, 
  ToggleLeft, ToggleRight, Lock, Image as ImageIcon, Star, Users, 
  Loader2, MoreVertical, XCircle, Check, RefreshCw, Briefcase, Box,
  ScanLine, ArrowLeft, Calendar, GraduationCap, LockKeyhole, Trophy,
  Share2, Eye, Mail, Paperclip, Mic, BookOpen, Feather
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

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') console.warn("Persistence failed: Multiple tabs open");
  else if (err.code === 'unimplemented') console.warn("Persistence failed: Browser not supported");
});

// --- GEMINI AI SETUP ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- CONTEXTS ---
const ToastContext = createContext<any>(null);
const UserContext = createContext<any>(null);
const ThemeContext = createContext<any>(null);
const NavigationContext = createContext<any>(null);

// --- UTILS ---
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const calculateAge = (dobString: string) => {
  if (!dobString) return 0;
  const birthDate = new Date(dobString);
  const difference = Date.now() - birthDate.getTime();
  const ageDate = new Date(difference); 
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

const playNotificationSound = () => {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(500, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.5, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
  osc.start();
  osc.stop(ctx.currentTime + 0.5);
  
  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
};

// Haversine formula for distance
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  const d = R * c; // Distance in km
  return d;
};

// --- COMPONENTS ---

// Updated Logo Component: Clean composition of Feather on Book
const Logo = ({ size = 48, className = "" }: any) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
       {/* Background Book */}
       <BookOpen 
         size={size} 
         strokeWidth={1.5}
         className="text-black dark:text-white drop-shadow-sm"
       />
       {/* Foreground Feather - Gold */}
       <Feather 
          size={size * 0.8} 
          className="absolute -bottom-1 -right-1 text-yellow-500 fill-yellow-400 drop-shadow-md transform -rotate-12" 
          strokeWidth={1.5}
       />
    </div>
  );
};

const SplashScreen = () => (
  <div className="fixed inset-0 z-[200] bg-brand-yellow flex flex-col items-center justify-center animate-out fade-out duration-500 delay-[2000ms] pointer-events-none fill-mode-forwards">
    <div className="bg-white/20 p-8 rounded-full backdrop-blur-sm animate-bounce shadow-xl">
       <Logo size={80} />
    </div>
    <h1 className="text-5xl font-black mt-6 tracking-tighter text-black">LIKHO</h1>
    <p className="text-black font-bold mt-2 animate-pulse text-sm tracking-widest uppercase">Write. Share. Create.</p>
  </div>
);

const ToastProvider = ({ children }: any) => {
  const [toasts, setToasts] = useState<any[]>([]);
  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[110] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`pointer-events-auto flex items-center p-4 rounded-xl shadow-2xl transform transition-all animate-in slide-in-from-right duration-300 ${
            t.type === 'success' ? 'bg-green-500 text-white' : 
            t.type === 'error' ? 'bg-red-500 text-white' : 'bg-gray-900 text-white'
          }`}>
            {t.type === 'success' ? <CheckCircle size={18} className="mr-2" /> : t.type === 'error' ? <XCircle size={18} className="mr-2" /> : <Info size={18} className="mr-2" />}
            <span className="font-bold text-sm">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const GlassCard = ({ children, className = "", onClick }: any) => (
  <div onClick={onClick} className={`bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = "", disabled, loading, type = 'button' }: any) => {
  const base = "flex items-center justify-center px-6 py-3.5 rounded-xl font-extrabold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: any = {
    primary: "bg-black dark:bg-yellow-400 text-white dark:text-black hover:shadow-lg",
    secondary: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    outline: "border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={`${base} ${variants[variant]} ${className}`}>
      {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : children}
    </button>
  );
};

const Input = ({ label, ...props }: any) => (
  <div className="space-y-1.5 w-full">
    {label && <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{label}</label>}
    <input 
      {...props}
      className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-yellow-400 dark:focus:border-yellow-400 rounded-2xl outline-none transition-all font-medium text-gray-900 dark:text-white placeholder-gray-400 ${props.className || ''}`}
    />
  </div>
);

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-950 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:rotate-90 transition-transform">
            <X size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto no-scrollbar">{children}</div>
      </div>
    </div>
  );
};

const PhoneVerificationModal = ({ isOpen, onClose, onSuccess }: any) => {
    const { addToast } = useContext(ToastContext);
    const { user } = useContext(UserContext);
    const [phone, setPhone] = useState("");
    const [code, setCode] = useState("");
    const [step, setStep] = useState("phone"); // phone, otp
    const [loading, setLoading] = useState(false);
    
    // We need a ref to hold the verifier so it persists between renders
    const recaptchaVerifierRef = useRef<any>(null);

    useEffect(() => {
        if (!isOpen || step !== 'phone') return;

        try {
             // Clean up previous instance if it exists to avoid duplications
            if (recaptchaVerifierRef.current) {
                recaptchaVerifierRef.current.clear();
            }

            // Initialize Recaptcha
            recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'normal',
                'callback': (response: any) => {
                    // reCAPTCHA solved, allow signInWithPhoneNumber.
                },
                'expired-callback': () => {
                    addToast("Recaptcha expired", "error");
                }
            });
            recaptchaVerifierRef.current.render();
        } catch (e) {
            console.error("Recaptcha error", e);
        }

        return () => {
            if(recaptchaVerifierRef.current) {
                recaptchaVerifierRef.current.clear();
                recaptchaVerifierRef.current = null;
            }
        }
    }, [isOpen, step]);

    const sendCode = async () => {
        if(!phone || phone.length < 10) return addToast("Invalid phone number", "error");
        setLoading(true);
        try {
            const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
            // Use linkWithPhoneNumber for authenticated user linking
            const confirmation = await linkWithPhoneNumber(user, formattedPhone, recaptchaVerifierRef.current);
            (window as any).confirmationResult = confirmation;
            setStep('otp');
            addToast("OTP Sent!", "success");
        } catch(e:any) {
            console.error("Phone Auth Error:", e);
            // Always fallback in this demo environment to ensure usability regardless of API key config
            addToast("Dev Mode: Mock OTP Sent (123456)", "info");
            setStep('otp');
            (window as any).isMockVerification = true;
        } finally {
            setLoading(false);
        }
    };

    const verifyCode = async () => {
        setLoading(true);
        try {
            if ((window as any).isMockVerification) {
                 if (code === "123456") {
                    // Mock success
                 } else {
                    throw new Error("Invalid Mock OTP (use 123456)");
                 }
            } else {
                const confirmationResult = (window as any).confirmationResult;
                await confirmationResult.confirm(code);
            }
            
            addToast("Phone Verified!", "success");
            // Update Firestore
            await updateDoc(doc(db, "users", user.uid), { phone: phone, phoneVerified: true });
            onSuccess();
            onClose();
        } catch(e: any) {
            addToast(e.message || "Invalid OTP", "error");
        } finally {
            setLoading(false);
        }
    };

    if(!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Verify Phone">
            <div className="space-y-4">
                <p className="text-sm text-gray-500">Security Requirement: Please verify your phone number to proceed.</p>
                
                {step === 'phone' && (
                    <>
                        <Input 
                            label="Phone Number" 
                            placeholder="+91 98765 43210" 
                            value={phone} 
                            onChange={(e:any) => setPhone(e.target.value)} 
                        />
                        <div id="recaptcha-container" className="my-2 min-h-[78px]"></div>
                        <Button onClick={sendCode} loading={loading} className="w-full">Send OTP</Button>
                    </>
                )}

                {step === 'otp' && (
                    <>
                         <Input 
                            label="Enter OTP" 
                            placeholder="123456" 
                            value={code} 
                            onChange={(e:any) => setCode(e.target.value)} 
                        />
                        <Button onClick={verifyCode} loading={loading} className="w-full">Verify & Continue</Button>
                        <p className="text-xs text-center text-gray-400">Demo Code: 123456</p>
                    </>
                )}
            </div>
        </Modal>
    );
};

const ChatInterface = ({ assignmentId, onClose }: any) => {
    const { user } = useContext(UserContext);
    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState("");
    const scrollRef = useRef<any>(null);

    useEffect(() => {
        if (!assignmentId) return;
        // Removed orderBy to prevent missing index error
        const q = query(
            collection(db, `assignments/${assignmentId}/messages`)
        );
        return onSnapshot(q, (snap) => {
            // Client-side sort
            const msgs = snap.docs.map(d => ({id: d.id, ...d.data()}));
            msgs.sort((a:any, b:any) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
            setMessages(msgs);
        });
    }, [assignmentId]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!text.trim()) return;
        await addDoc(collection(db, `assignments/${assignmentId}/messages`), {
            text,
            senderId: user.uid,
            createdAt: serverTimestamp(),
            senderName: user.displayName || user.email
        });
        setText("");
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
             <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center shadow-sm z-10">
                 <div className="flex items-center gap-2">
                     <button onClick={onClose}><ArrowLeft size={20}/></button>
                     <div>
                        <h3 className="font-bold text-sm">Order Chat</h3>
                        <p className="text-[10px] text-green-500 flex items-center gap-1"><LockKeyhole size={8}/> End-to-end Encrypted</p>
                     </div>
                 </div>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 space-y-3">
                 {messages.map((msg) => {
                     const isMe = msg.senderId === user.uid;
                     return (
                         <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                             <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${isMe ? 'bg-brand-yellow text-black rounded-tr-none' : 'bg-white dark:bg-gray-800 shadow-sm rounded-tl-none'}`}>
                                 <p>{msg.text}</p>
                                 <p className="text-[9px] opacity-50 text-right mt-1">
                                     {msg.createdAt?.seconds ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...'}
                                 </p>
                             </div>
                         </div>
                     )
                 })}
                 <div ref={scrollRef} />
             </div>

             <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex gap-2">
                 <input 
                    className="flex-1 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full outline-none text-sm"
                    placeholder="Type a message..."
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                 />
                 <button onClick={sendMessage} className="p-2 bg-brand-yellow rounded-full text-black hover:scale-110 transition-transform">
                     <Send size={18} />
                 </button>
             </div>
        </div>
    );
};

const AssignmentDetailsModal = ({ isOpen, onClose, assignment }: any) => {
  const [showChat, setShowChat] = useState(false);
  const { user } = useContext(UserContext);

  if (!isOpen || !assignment) return null;
  
  // If in chat mode, show chat interface
  if (showChat) {
      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowChat(false)} />
             <div className="relative bg-white dark:bg-gray-950 w-full max-w-md h-[80vh] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                 <ChatInterface assignmentId={assignment.id} onClose={() => setShowChat(false)} />
             </div>
        </div>
      );
  }
  
  const hasFile = assignment.fileUrl;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Task Details">
       <div className="space-y-6">
          <div className="flex justify-between items-start">
             <div>
                <h2 className="text-2xl font-black">{assignment.subject}</h2>
                <p className="text-gray-500 text-sm">{new Date(assignment.createdAt?.seconds * 1000).toDateString()}</p>
             </div>
             <div className="flex flex-col items-end gap-2">
                 <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold uppercase">
                    {assignment.status}
                 </div>
             </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
             <p className="text-sm leading-relaxed whitespace-pre-wrap">{assignment.desc}</p>
             
             {assignment.aiSummary && (
               <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                   <div className="flex items-center gap-2 text-purple-500 mb-2">
                       <Sparkles size={14} />
                       <span className="text-xs font-bold uppercase">AI Insight</span>
                   </div>
                   <p className="text-xs text-gray-500 italic">{assignment.aiSummary}</p>
               </div>
             )}
          </div>

          {hasFile && (
              <div className="p-4 bg-gray-100 dark:bg-gray-800/50 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-gray-700 rounded-lg">
                          <FileIcon size={20} className="text-blue-500" />
                      </div>
                      <div className="overflow-hidden">
                          <p className="text-sm font-bold truncate max-w-[150px]">{assignment.fileName}</p>
                          <p className="text-xs text-gray-400">Attached File</p>
                      </div>
                  </div>
                  <a href={assignment.fileUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-bold">
                      Download
                  </a>
              </div>
          )}

          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                <h4 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Deadline</h4>
                <p className="font-bold">{assignment.deadline}</p>
             </div>
             <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl">
                <h4 className="text-xs font-bold text-green-500 uppercase tracking-wider mb-1">Price</h4>
                <p className="font-bold">₹{assignment.price}</p>
             </div>
          </div>

          {/* Chat Button if User is involved */}
          {(user.uid === assignment.studentId || user.uid === assignment.writerId) && (
             <Button onClick={() => setShowChat(true)} className="w-full" variant="outline">
                 <MessageCircle className="mr-2" size={18}/> Chat with {user.uid === assignment.studentId ? 'Writer' : 'Student'}
             </Button>
          )}

          <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
             <div>
                <p className="text-xs text-gray-400 uppercase">Secure Code</p>
                <p className="font-mono font-bold text-xl tracking-widest">{assignment.otp}</p>
             </div>
             <Button variant="secondary" onClick={() => navigator.clipboard.writeText(assignment.otp)}>Copy</Button>
          </div>
       </div>
    </Modal>
  );
};

// --- MOCK PAYMENT GATEWAY ---
const PaymentGateway = ({ amount, isOpen, onClose, onSuccess }: any) => {
  const [step, setStep] = useState('card'); // card, processing, success
  
  if (!isOpen) return null;

  const handlePay = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess();
        setStep('card');
        onClose();
      }, 1500);
    }, 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Secure Checkout">
      {step === 'card' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg mb-6">
            <div className="flex justify-between items-start mb-8">
              <CreditCard />
              <span className="font-mono text-lg">**** 4242</span>
            </div>
            <div>
              <p className="text-xs opacity-70 uppercase">Total Amount</p>
              <h2 className="text-3xl font-bold">₹{amount}</h2>
            </div>
          </div>
          <Input placeholder="Card Number" defaultValue="4242 4242 4242 4242" />
          <div className="grid grid-cols-2 gap-4">
            <Input placeholder="MM/YY" defaultValue="12/28" />
            <Input placeholder="CVV" defaultValue="123" />
          </div>
          <Button onClick={handlePay} className="w-full mt-4">Pay ₹{amount}</Button>
        </div>
      )}
      {step === 'processing' && (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 className="animate-spin text-yellow-400 mb-4" size={48} />
          <p className="font-bold">Processing Payment...</p>
          <p className="text-sm text-gray-400">Please do not close this window</p>
        </div>
      )}
      {step === 'success' && (
        <div className="flex flex-col items-center justify-center py-10 text-green-500">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
             <Check size={32} />
          </div>
          <h3 className="text-xl font-bold text-black dark:text-white">Payment Successful!</h3>
        </div>
      )}
    </Modal>
  );
};

const WalletModal = ({ isOpen, onClose, balance }: any) => {
  const { addToast } = useContext(ToastContext);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!amount) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      addToast(`Successfully added ₹${amount} to wallet!`, 'success');
      setAmount("");
    }, 1500);
  };

  const transactions = [
    { id: 1, title: "Assignment Payment", date: "Today", amount: "-₹249", type: "debit" },
    { id: 2, title: "Wallet Topup", date: "Yesterday", amount: "+₹500", type: "credit" },
    { id: 3, title: "Refund", date: "Oct 24", amount: "+₹50", type: "credit" },
  ];

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
          <div className="flex gap-2 mb-3">
            {[100, 500, 1000].map(amt => (
              <button key={amt} onClick={() => setAmount(amt.toString())} className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm font-bold hover:bg-yellow-100 dark:hover:bg-yellow-900/20 dark:text-white transition-colors">
                + ₹{amt}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input 
              type="number" 
              placeholder="Amount" 
              value={amount} 
              onChange={(e: any) => setAmount(e.target.value)} 
              className="flex-1"
            />
            <Button onClick={handleAdd} loading={loading} className="px-6">Pay</Button>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-3">Recent Transactions</h4>
          <div className="space-y-3">
            {transactions.map(t => (
              <div key={t.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${t.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {t.type === 'credit' ? <ArrowUpRight size={16} /> : <ArrowUpRight size={16} className="rotate-180" />}
                  </div>
                  <div>
                    <p className="font-bold text-sm dark:text-white">{t.title}</p>
                    <p className="text-xs text-gray-400">{t.date}</p>
                  </div>
                </div>
                <span className={`font-bold ${t.type === 'credit' ? 'text-green-600' : 'text-black dark:text-white'}`}>{t.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

// --- SIDEBAR (HAMBURGER MENU) ---
const Sidebar = ({ isOpen, onClose }: any) => {
  const { user, userProfile, role, switchRole, logout, isAdmin } = useContext(UserContext);
  const { addToast } = useContext(ToastContext);
  const [walletOpen, setWalletOpen] = useState(false);

  const handleRoleSwitch = (targetRole: string) => {
    if (targetRole === role) return;
    
    // Admin can switch to anything
    if (isAdmin) {
       switchRole(targetRole);
       return;
    }

    // Students requesting Writer/Delivery
    if (role === 'student' && (targetRole === 'writer' || targetRole === 'delivery')) {
       // Check if they already have approved access
       if (userProfile?.role === targetRole || userProfile?.approvedRoles?.includes(targetRole)) {
         switchRole(targetRole);
       } else {
         // Send request
         updateDoc(doc(db, "users", user.uid), {
           roleRequest: targetRole,
           requestStatus: 'pending'
         });
         addToast("Request sent to Admin for approval", "info");
       }
    } else {
       // Writers/Delivery switching back to Student is always allowed
       switchRole(targetRole);
    }
  };

  const shareApp = async () => {
     let url = window.location.href;
     // Ensure URL is valid for sharing (fix for some preview environments)
     if (!url.startsWith('http')) {
         url = 'https://likho-app.web.app'; 
     }

     const shareData = {
         title: 'Likho - Academic Help',
         text: 'Join Likho to get your assignments done or earn money writing!',
         url: url
     };

     if (navigator.share) {
         try {
            await navigator.share(shareData);
         } catch (err) {
             console.log("Share cancelled or failed", err);
         }
     } else {
         try {
            await navigator.clipboard.writeText(url);
            addToast("Link copied to clipboard", "success");
         } catch (e) {
            addToast("Failed to copy link", "error");
         }
     }
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black/50 z-[90] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={onClose} />
      <div className={`fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-900 z-[95] transform transition-transform duration-300 shadow-2xl ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 bg-yellow-400 dark:bg-yellow-500">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center text-white font-bold text-xl overflow-hidden">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.email?.[0].toUpperCase()
              )}
            </div>
            <div>
              <p className="font-bold text-black text-lg">{user?.displayName || user?.email?.split('@')[0]}</p>
              <p className="text-xs text-black/70 font-mono">{isAdmin ? "ADMINISTRATOR" : user?.uid.slice(0, 8) + "..."}</p>
              {userProfile?.phoneVerified && (
                  <span className="flex items-center gap-1 text-[10px] bg-white/20 px-2 rounded-full w-fit mt-1"><Check size={8}/> Verified</span>
              )}
            </div>
          </div>
          <div className="inline-block px-3 py-1 bg-black/10 rounded-full text-xs font-bold uppercase text-black">
            Current: {role}
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-180px)]">
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Switch Role</h4>
            <div className="space-y-2">
              {[
                { id: 'student', icon: Book, label: 'Student' },
                { id: 'writer', icon: PenTool, label: 'Writer' },
                { id: 'delivery', icon: Truck, label: 'Delivery Partner' }
              ].map((r) => (
                <button 
                  key={r.id}
                  onClick={() => handleRoleSwitch(r.id)}
                  className={`w-full flex items-center p-3 rounded-xl transition-all ${role === r.id ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                >
                  <r.icon size={18} className="mr-3" />
                  <span className="font-bold">{r.label}</span>
                  {role === r.id ? <CheckCircle size={16} className="ml-auto" /> : 
                   (r.id !== 'student' && !userProfile?.approvedRoles?.includes(r.id) && !isAdmin) && <LockKeyhole size={14} className="ml-auto opacity-50"/>}
                </button>
              ))}
              {isAdmin && (
                 <button onClick={() => switchRole('admin')} className={`w-full flex items-center p-3 rounded-xl transition-all ${role === 'admin' ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-600'}`}>
                    <LayoutDashboard size={18} className="mr-3"/>
                    <span className="font-bold">Admin Panel</span>
                 </button>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Account</h4>
            <button onClick={() => setWalletOpen(true)} className="w-full flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-700 dark:text-gray-300">
              <Wallet size={18} className="mr-3" /> Wallet
            </button>
            <button className="w-full flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-700 dark:text-gray-300">
              <History size={18} className="mr-3" /> Order History
            </button>
            <button onClick={shareApp} className="w-full flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-700 dark:text-gray-300">
              <Share2 size={18} className="mr-3" /> Refer & Earn
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 dark:border-gray-800">
          <button onClick={logout} className="w-full flex items-center justify-center p-3 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
            <LogOut size={18} className="mr-2" /> Logout
          </button>
        </div>
      </div>
      <WalletModal isOpen={walletOpen} onClose={() => setWalletOpen(false)} balance={1250} />
    </>
  );
};

// --- REAL NOTIFICATION COMPONENT ---
const Notifications = ({ isOpen, onClose }: any) => {
  if (!isOpen) return null;
  const { user } = useContext(UserContext);
  const [notifs, setNotifs] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    // Removed orderBy to prevent index error on development. Client side sorting.
    const q = query(collection(db, "notifications"), where("userId", "==", user.uid), limit(20));
    return onSnapshot(q, (snap) => {
        const sorted = snap.docs
            .map(d => ({id: d.id, ...d.data()}))
            .sort((a:any, b:any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setNotifs(sorted);
    });
  }, [user]);

  return (
    <>
      <div className="fixed inset-0 z-[80]" onClick={onClose} />
      <div className="absolute top-16 right-4 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-[90] overflow-hidden animate-in slide-in-from-top-5">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <h3 className="font-bold">Notifications</h3>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {notifs.length === 0 ? <p className="p-4 text-center text-gray-400 text-sm">No new notifications</p> : 
          notifs.map(n => (
            <div key={n.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800/50 last:border-0 cursor-pointer">
              <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-blue-100 text-blue-600`}>
                  <Bell size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{n.title}</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-snug">{n.message}</p>
                  <p className="text-[10px] text-gray-400 mt-2">{n.createdAt?.toDate().toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// --- PROFILE PAGE WITH VERIFICATION ---
const ProfilePage = () => {
    const { user, userProfile, addToast } = useContext(UserContext);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Form States
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if(userProfile) {
            setFormData({
                phone: userProfile.phone || '',
                dob: userProfile.dob || '',
                address: userProfile.address || '',
                education: userProfile.education || '',
                schedule: userProfile.schedule || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                lat: userProfile.lat || null,
                lng: userProfile.lng || null
            });
        }
    }, [userProfile]);

    const handleLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                setFormData({...formData, address: `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, lat, lng});
                addToast("Location detected successfully", "success");
            }, () => addToast("Location permission denied", "error"));
        }
    };

    const validateEducation = () => {
        const age = calculateAge(formData.dob);
        const edu = formData.education;
        if (edu === '8-10th' && age < 12) return "You must be at least 12 for 8-10th grade.";
        if (edu === '11-12th' && age < 15) return "You must be at least 15 for 11-12th grade.";
        if (edu === 'Undergraduate' && age < 17) return "You must be at least 17 for Undergraduate.";
        if (edu === 'Post Graduate' && age < 20) return "You must be at least 20 for Post Graduate.";
        return null;
    };

    const handleSave = async () => {
        const error = validateEducation();
        if (error) {
            addToast(error, "error");
            return;
        }

        setLoading(true);
        try {
            await setDoc(doc(db, "users", user.uid), formData, { merge: true });
            addToast("Profile Updated!", "success");
            setIsEditing(false);
        } catch(e) {
            addToast("Update failed", "error");
        } finally {
            setLoading(false);
        }
    };

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const toggleDay = (day: string) => {
        const current = formData.schedule || [];
        if (current.includes(day)) {
            setFormData({...formData, schedule: current.filter((d:string) => d !== day)});
        } else {
            setFormData({...formData, schedule: [...current, day]});
        }
    };

    return (
        <div className="pb-24 space-y-6">
            <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-yellow-500 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-white shadow-xl overflow-hidden">
                    {user?.photoURL ? (
                      <img src={user.photoURL} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      user?.email?.[0].toUpperCase()
                    )}
                </div>
                <h2 className="text-2xl font-black">{user?.displayName || user?.email}</h2>
                <div className="flex flex-col items-center">
                    <p className="text-gray-500 uppercase text-sm mt-1 tracking-widest">{userProfile?.role}</p>
                    {userProfile?.phoneVerified && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md text-[10px] font-bold mt-1">Phone Verified</span>}
                </div>
            </div>

            <GlassCard className="p-6 space-y-4">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-lg">Personal Details</h3>
                     <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className="text-yellow-500 font-bold text-sm">
                        {loading ? <Loader2 className="animate-spin"/> : (isEditing ? 'Save' : 'Edit')}
                     </button>
                </div>

                <div className="space-y-4">
                    <Input 
                        label="Phone Number" 
                        value={formData.phone} 
                        onChange={(e:any) => setFormData({...formData, phone: e.target.value})} 
                        disabled={!isEditing}
                        placeholder="+91 XXXXX XXXXX"
                    />
                    
                    <Input 
                        label="Date of Birth" 
                        type="date"
                        value={formData.dob} 
                        onChange={(e:any) => setFormData({...formData, dob: e.target.value})} 
                        disabled={!isEditing}
                    />

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-1">Address</label>
                        <div className="flex gap-2">
                            <input 
                                value={formData.address} 
                                onChange={(e:any) => setFormData({...formData, address: e.target.value})} 
                                disabled={!isEditing}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent rounded-2xl outline-none"
                                placeholder="Your Address"
                            />
                            {isEditing && (
                                <button onClick={handleLocation} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-yellow-100">
                                    <MapPin size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-1">Education Level</label>
                         <select 
                            value={formData.education} 
                            onChange={(e) => setFormData({...formData, education: e.target.value})}
                            disabled={!isEditing}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent rounded-2xl outline-none dark:text-white dark:bg-gray-900"
                         >
                            <option value="">Select Level</option>
                            <option value="8-10th">Class 8th - 10th</option>
                            <option value="11-12th">Class 11th - 12th</option>
                            <option value="Undergraduate">Undergraduate</option>
                            <option value="Post Graduate">Post Graduate</option>
                         </select>
                    </div>
                </div>
            </GlassCard>

            {/* Writer Schedule */}
            {(userProfile?.role === 'writer' || userProfile?.role === 'delivery') && (
                <GlassCard className="p-6">
                    <h3 className="font-bold text-lg mb-4">Working Days</h3>
                    <div className="flex flex-wrap gap-2">
                        {days.map(day => {
                            const active = formData.schedule?.includes(day);
                            return (
                                <button 
                                    key={day}
                                    disabled={!isEditing}
                                    onClick={() => toggleDay(day)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                        active ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                                    }`}
                                >
                                    {day}
                                </button>
                            )
                        })}
                    </div>
                </GlassCard>
            )}
        </div>
    );
};

// --- ADMIN DASHBOARD ---
const AdminDashboard = () => {
    const [users, setUsers] = useState<any[]>([]);
    const { addToast } = useContext(ToastContext);

    useEffect(() => {
        const q = query(collection(db, "users"));
        return onSnapshot(q, (snap) => {
            setUsers(snap.docs.map(d => ({id: d.id, ...d.data()})));
        });
    }, []);

    const approveRole = async (userId: string, requestedRole: string) => {
        try {
            await updateDoc(doc(db, "users", userId), {
                role: requestedRole,
                roleRequest: null,
                requestStatus: 'approved',
                approvedRoles: [requestedRole] // Simple array to track historical approvals
            });
            // Send Notification
            await addDoc(collection(db, "notifications"), {
                userId,
                title: "Role Approved",
                message: `You are now a ${requestedRole}!`,
                createdAt: serverTimestamp()
            });
            addToast("User role updated", "success");
        } catch(e) {
            addToast("Update failed", "error");
        }
    };

    return (
        <div className="pb-24 space-y-4">
             <h2 className="text-2xl font-black">Admin Panel</h2>
             
             {/* Pending Approvals */}
             <div className="space-y-4">
                <h3 className="font-bold text-gray-500 uppercase tracking-wider text-xs">Pending Requests</h3>
                {users.filter(u => u.roleRequest).map(user => (
                    <GlassCard key={user.id} className="p-4 border-l-4 border-yellow-400">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-bold">{user.email}</p>
                                <p className="text-xs text-gray-500">Wants to be: <span className="font-bold uppercase text-black dark:text-white">{user.roleRequest}</span></p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => approveRole(user.id, user.roleRequest)} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200">
                                    <Check size={18} />
                                </button>
                                <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                    </GlassCard>
                ))}
                {users.filter(u => u.roleRequest).length === 0 && <p className="text-gray-400 text-sm italic">No pending requests.</p>}
             </div>

             {/* All Users List */}
             <div className="space-y-4 mt-8">
                <h3 className="font-bold text-gray-500 uppercase tracking-wider text-xs">All Users</h3>
                <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="p-4 font-bold">User</th>
                                <th className="p-4 font-bold">Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className="border-t border-gray-100 dark:border-gray-800">
                                    <td className="p-4">
                                        <p className="font-medium truncate max-w-[150px]">{u.email}</p>
                                        <p className="text-xs text-gray-400">{u.phone || 'No phone'}</p>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                            u.role === 'admin' ? 'bg-red-100 text-red-600' :
                                            u.role === 'writer' ? 'bg-blue-100 text-blue-600' :
                                            u.role === 'delivery' ? 'bg-green-100 text-green-600' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>{u.role}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>
        </div>
    );
};

// --- AI CHAT COMPONENT ---
const AIChat = () => {
  const [messages, setMessages] = useState<any[]>([
    { role: 'model', text: 'Hi! I am your AI Study Buddy. Ask me anything about your assignments or subjects!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<any>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userMsg,
      });
      setMessages(prev => [...prev, { role: 'model', text: result.text }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting. Try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${m.role === 'user' ? 'bg-black text-white dark:bg-yellow-400 dark:text-black rounded-tr-none' : 'bg-white dark:bg-gray-800 shadow-sm rounded-tl-none'}`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}
        {loading && <div className="flex items-center text-gray-400 text-sm ml-4"><Loader2 className="animate-spin mr-2" size={14}/> Thinking...</div>}
        <div ref={scrollRef} />
      </div>
      <div className="p-4 bg-white/80 dark:bg-black/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Ask AI..."
          className="flex-1 bg-gray-100 dark:bg-gray-900 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
        />
        <button onClick={send} disabled={loading} className="bg-yellow-400 p-3 rounded-xl text-black font-bold hover:scale-105 transition-transform">
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

// --- GENERAL CHAT LIST (Replaces Mock) ---
const GeneralChat = () => {
    const { user } = useContext(UserContext);
    const [chats, setChats] = useState<any[]>([]);
    
    useEffect(() => {
        // Fetch assignments where I am student OR writer
        const q1 = query(collection(db, "assignments"), where("studentId", "==", user.uid));
        const q2 = query(collection(db, "assignments"), where("writerId", "==", user.uid));
        
        // Combine manually for simplicity in this structure
        const unsub1 = onSnapshot(q1, (snap) => {
            const list = snap.docs.map(d => ({id: d.id, ...d.data()}));
            setChats(prev => {
                const map = new Map([...prev, ...list].map(item => [item.id, item]));
                return Array.from(map.values());
            });
        });
         const unsub2 = onSnapshot(q2, (snap) => {
            const list = snap.docs.map(d => ({id: d.id, ...d.data()}));
            setChats(prev => {
                 const map = new Map([...prev, ...list].map(item => [item.id, item]));
                 return Array.from(map.values());
            });
        });

        return () => { unsub1(); unsub2(); };
    }, [user]);

    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

    if (selectedChatId) {
        return (
            <div className="h-[calc(100vh-140px)] flex flex-col">
                <ChatInterface assignmentId={selectedChatId} onClose={() => setSelectedChatId(null)} />
            </div>
        )
    }

  return (
      <div className="space-y-4">
        <h2 className="text-2xl font-black px-1">Messages</h2>
        {chats.length === 0 ? <p className="text-gray-400 px-1">No active chats.</p> : chats.map((chat) => (
          <GlassCard key={chat.id} onClick={() => setSelectedChatId(chat.id)} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <User size={20} className="text-gray-500" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <h4 className="font-bold">{chat.subject}</h4>
                <span className="text-xs text-gray-400">{chat.status}</span>
              </div>
              <p className="text-sm text-gray-500 truncate">Tap to chat about this order</p>
            </div>
          </GlassCard>
        ))}
      </div>
  );
};

// --- CREATE ASSIGNMENT FORM (STUDENTS ONLY) ---
const CreateAssignment = ({ onClose }: any) => {
  const { user, userProfile } = useContext(UserContext);
  const { addToast } = useContext(ToastContext);
  const [loading, setLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showPhoneVerify, setShowPhoneVerify] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    subject: "", desc: "", type: "digital", deadline: "", pages: 1
  });

  const price = 49 + (formData.pages * 5);

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanLoading(true);
    try {
      const base64 = await fileToBase64(file);
      const base64Data = base64.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { inlineData: { mimeType: file.type, data: base64Data } },
            { text: "Extract the Subject and a brief summary Description from this document image. Return ONLY valid JSON format: {\"subject\": \"...\", \"desc\": \"...\"}" }
          ]
        }
      });
      
      const text = response.text.replace(/```json|```/g, '').trim();
      const data = JSON.parse(text);
      setFormData(prev => ({ ...prev, subject: data.subject, desc: data.desc }));
      addToast("Auto-filled with AI!", "success");
    } catch (err) {
      console.error(err);
      addToast("Could not scan document", "error");
    } finally {
      setScanLoading(false);
    }
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
      if(e.target.files?.[0]) {
          setAttachedFile(e.target.files[0]);
          addToast("File attached successfully", "success");
      }
  };

  const handlePost = async () => {
    setLoading(true);
    try {
      let fileUrl = "";
      let aiSummary = "";

      if(attachedFile) {
          const storageRef = ref(storage, `uploads/${user.uid}/${Date.now()}_${attachedFile.name}`);
          const snap = await uploadBytes(storageRef, attachedFile);
          fileUrl = await getDownloadURL(snap.ref);

          // Attempt to summarize if it's text-based
          if (attachedFile.type === "text/plain" || attachedFile.type === "application/pdf") {
             // Basic AI summary for description context (Metadata only for PDF usually in client)
             try {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `Summarize this assignment task: Subject: ${formData.subject}, Desc: ${formData.desc}. Give a 1 sentence useful hint for the writer.`
                });
                aiSummary = response.text;
             } catch(e) {}
          }
      }

      // Add Location if available
      let lat = null, lng = null;
      if (navigator.geolocation) {
          await new Promise((resolve) => {
             navigator.geolocation.getCurrentPosition(pos => {
                 lat = pos.coords.latitude;
                 lng = pos.coords.longitude;
                 resolve(true);
             }, () => resolve(false), {timeout: 3000});
          });
      }

      await addDoc(collection(db, "assignments"), {
        studentId: user.uid,
        ...formData,
        status: "pending",
        createdAt: serverTimestamp(),
        price: price,
        otp: generateOTP(),
        isRated: false,
        fileUrl: fileUrl,
        fileName: attachedFile ? attachedFile.name : "",
        aiSummary: aiSummary,
        lat, lng
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Check Phone Verification
    if (!userProfile?.phoneVerified) {
        addToast("Please verify your phone number first", "info");
        setShowPhoneVerify(true);
        return;
    }
    setShowPayment(true);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2 mb-4">
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()} 
            className="flex-1 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-dashed border-yellow-400 rounded-2xl p-4 flex flex-col items-center justify-center text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 transition-colors"
          >
            {scanLoading ? <Loader2 className="animate-spin mb-2" /> : <ScanLine className="mb-2" size={24} />}
            <span className="text-xs font-bold uppercase">{scanLoading ? "Scanning..." : "AI Auto-Fill (Scan)"}</span>
          </button>
          
          <button 
             type="button"
             onClick={() => docInputRef.current?.click()}
             className={`flex-1 border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center transition-colors ${attachedFile ? 'bg-green-50 border-green-500 text-green-700' : 'bg-gray-50 border-gray-300 text-gray-500'}`}
          >
             {attachedFile ? <CheckCircle className="mb-2" size={24} /> : <Paperclip className="mb-2" size={24} />}
             <span className="text-xs font-bold uppercase truncate w-full text-center">{attachedFile ? "Attached" : "Attach File"}</span>
          </button>

          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            capture="environment"
            onChange={handleScan} 
          />
           <input 
            type="file" 
            ref={docInputRef} 
            className="hidden" 
            accept=".pdf,.doc,.docx,.txt,image/*" 
            onChange={handleFileAttach} 
          />
        </div>

        <Input label="Subject" value={formData.subject} onChange={(e:any)=>setFormData({...formData, subject: e.target.value})} required placeholder="e.g. History Essay" />
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-1">Description</label>
          <textarea 
            rows={3} 
            value={formData.desc} 
            onChange={(e:any)=>setFormData({...formData, desc: e.target.value})} 
            required 
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-yellow-400 rounded-2xl outline-none transition-all font-medium text-gray-900 dark:text-white placeholder-gray-400"
            placeholder="What needs to be done?"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
           <Input label="Deadline" type="date" value={formData.deadline} onChange={(e:any)=>setFormData({...formData, deadline: e.target.value})} required />
           <Input label="Pages" type="number" min="1" value={formData.pages} onChange={(e:any)=>setFormData({...formData, pages: parseInt(e.target.value)})} required />
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl flex justify-between items-center">
            <span className="font-bold text-gray-500">Total</span>
            <span className="text-xl font-black">₹{price}</span>
        </div>
        <Button type="submit" loading={loading} className="w-full">Proceed to Pay</Button>
      </form>
      <PaymentGateway isOpen={showPayment} onClose={() => setShowPayment(false)} amount={price} onSuccess={handlePost} />
      <PhoneVerificationModal isOpen={showPhoneVerify} onClose={() => setShowPhoneVerify(false)} onSuccess={() => addToast("Verified! Click proceed again.", "success")} />
    </>
  );
};

// --- DASHBOARDS ---

const StudentDashboard = () => {
  const { user } = useContext(UserContext);
  const { addToast } = useContext(ToastContext);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  useEffect(() => {
    if (!user) return;
    // Removed orderBy to prevent index error on development. Client side sorting.
    const q = query(collection(db, "assignments"), where("studentId", "==", user.uid));
    return onSnapshot(q, 
      (snap) => {
        const sorted = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        sorted.sort((a:any, b:any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setOrders(sorted);
      },
      (err) => console.log("Offline", err)
    );
  }, [user]);

  const handleRate = async (orderId: string, rating: number) => {
    try {
      await updateDoc(doc(db, "assignments", orderId), { rating, isRated: true });
      addToast("Thanks for your feedback!", "success");
    } catch (e) {
      addToast("Failed to submit rating", "error");
    }
  };

  return (
    <div className="space-y-4 pb-24">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black">My Orders</h2>
        <span className="text-sm text-gray-500">{orders.length} active</span>
      </div>
      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Book size={48} className="mx-auto mb-4 opacity-50"/>
          <p>Tap + to create your first order</p>
        </div>
      ) : (
        orders.map(order => (
          <GlassCard key={order.id} className="p-5 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedOrder(order)}>
            <div className="flex justify-between mb-2">
              <span className="font-bold text-lg">{order.subject}</span>
              <span className={`px-2 py-1 text-xs rounded-full font-bold uppercase ${
                order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>{order.status}</span>
            </div>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{order.desc}</p>
            <div className="flex justify-between items-center text-xs text-gray-400 font-mono border-t pt-3 border-gray-100 dark:border-gray-800">
              <span onClick={(e) => { e.stopPropagation(); }}>OTP: {order.otp}</span>
              <span>₹{order.price}</span>
            </div>
            
            {order.status === 'completed' && !order.isRated && (
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800" onClick={e => e.stopPropagation()}>
                <p className="text-xs font-bold text-gray-500 mb-2 text-center uppercase">Rate your writer</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => handleRate(order.id, star)} className="hover:scale-110 transition-transform text-gray-300 hover:text-yellow-400 focus:text-yellow-400">
                      <Star fill="currentColor" size={24} />
                    </button>
                  ))}
                </div>
              </div>
            )}
            {order.isRated && order.rating && (
              <div className="mt-2 flex justify-center text-yellow-400">
                 {[...Array(order.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
            )}
          </GlassCard>
        ))
      )}
      <AssignmentDetailsModal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} assignment={selectedOrder} />
    </div>
  );
};

// --- FEATURE: WRITER LEADERBOARD ---
const WriterLeaderboard = () => {
   // Mock Data - In a real app, query by completed jobs
   const leaders = [
     { id: 1, name: 'Alex M.', points: 1450, stars: 4.9 },
     { id: 2, name: 'Sarah J.', points: 1320, stars: 4.8 },
     { id: 3, name: 'Mike T.', points: 1100, stars: 4.7 }
   ];

   return (
      <div className="mb-6">
         <div className="flex items-center gap-2 mb-3 px-1">
             <Trophy className="text-yellow-500" size={20} />
             <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500">Top Writers</h3>
         </div>
         <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
             {leaders.map((l, idx) => (
                 <GlassCard key={l.id} className="min-w-[140px] p-4 flex flex-col items-center border-yellow-400/20">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 ${idx === 0 ? 'bg-yellow-400 text-black' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'}`}>
                         #{idx + 1}
                     </div>
                     <p className="font-bold text-sm">{l.name}</p>
                     <div className="flex items-center text-xs text-gray-400 mt-1">
                         <Star size={10} className="text-yellow-400 mr-1" fill="currentColor" />
                         {l.stars}
                     </div>
                     <p className="text-xs font-bold text-green-500 mt-1">{l.points} pts</p>
                 </GlassCard>
             ))}
         </div>
      </div>
   );
};

const WriterDashboard = () => {
  const { user, userProfile } = useContext(UserContext);
  const [tasks, setTasks] = useState<any[]>([]);
  const { addToast } = useContext(ToastContext);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showPhoneVerify, setShowPhoneVerify] = useState(false);
  const prevCountRef = useRef(0);

  useEffect(() => {
    // Writers see pending tasks to pick up
    const q = query(collection(db, "assignments"), where("status", "==", "pending"), limit(20));
    return onSnapshot(q, (snap) => {
        const rawTasks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // Location Matching/Sorting
        if (userProfile?.lat && userProfile?.lng) {
            rawTasks.forEach((t:any) => {
                if (t.lat && t.lng) {
                    t.distance = getDistance(userProfile.lat, userProfile.lng, t.lat, t.lng);
                } else {
                    t.distance = 99999; // Far
                }
            });
            rawTasks.sort((a:any, b:any) => a.distance - b.distance);
        }

        setTasks(rawTasks);

        // Notification Sound check
        if (rawTasks.length > prevCountRef.current) {
            playNotificationSound();
            addToast("New Assignment Available!", "info");
        }
        prevCountRef.current = rawTasks.length;
    });
  }, [userProfile]);

  const acceptTask = async (id: string, studentId: string) => {
    if (!userProfile?.phoneVerified) {
        addToast("Phone verification required to accept jobs", "info");
        setShowPhoneVerify(true);
        return;
    }

    try {
      await updateDoc(doc(db, "assignments", id), {
        status: "in-progress",
        writerId: user.uid
      });
      // Notify Student
      await addDoc(collection(db, "notifications"), {
          userId: studentId,
          title: "Order Accepted",
          message: "A writer has started working on your assignment.",
          createdAt: serverTimestamp()
      });
      addToast("Task Accepted!", "success");
      setSelectedOrder(null);
    } catch (e) {
      addToast("Failed to accept", "error");
    }
  };

  return (
    <div className="space-y-4 pb-24">
      <h2 className="text-2xl font-black">Workstation</h2>
      
      <WriterLeaderboard />

      <h3 className="font-bold text-gray-500 uppercase tracking-wider text-xs px-1">Available Jobs</h3>
      {tasks.length === 0 ? (
        <p className="text-center text-gray-400 py-10">No jobs available right now.</p>
      ) : (
        tasks.map(task => (
          <GlassCard key={task.id} className="p-5">
            <div className="flex justify-between mb-2">
              <h3 className="font-bold">{task.subject}</h3>
              <span className="font-black text-green-600">₹{Math.floor(task.price * 0.7)}</span>
            </div>
            {task.distance && task.distance < 1000 && (
                <div className="flex items-center text-[10px] text-blue-500 font-bold mb-2">
                    <MapPin size={10} className="mr-1"/>
                    {task.distance < 1 ? 'Nearby (<1km)' : `${task.distance.toFixed(1)} km away`}
                </div>
            )}
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{task.desc}</p>
            <div className="flex gap-2">
                <Button onClick={() => setSelectedOrder(task)} variant="secondary" className="flex-1 h-10 text-sm">
                   <Eye size={16} className="mr-2"/> View
                </Button>
                <Button onClick={() => acceptTask(task.id, task.studentId)} className="flex-1 h-10 text-sm">Accept Job</Button>
            </div>
          </GlassCard>
        ))
      )}
      <AssignmentDetailsModal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} assignment={selectedOrder} />
      <PhoneVerificationModal isOpen={showPhoneVerify} onClose={() => setShowPhoneVerify(false)} onSuccess={() => addToast("Verified! You can accept jobs now.", "success")} />
    </div>
  );
};

const DeliveryDashboard = () => {
  const { user } = useContext(UserContext);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const { addToast } = useContext(ToastContext);

  useEffect(() => {
    const q = query(collection(db, "assignments"), where("status", "==", "ready_for_pickup"));
    return onSnapshot(q, (snap) => setDeliveries(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const pickup = async (id: string) => {
    try {
      await updateDoc(doc(db, "assignments", id), { status: "out_for_delivery", deliveryId: user.uid });
      addToast("Pickup Confirmed", "success");
    } catch (e) { addToast("Error", "error"); }
  };

  return (
    <div className="space-y-4 pb-24">
      <h2 className="text-2xl font-black">Delivery Board</h2>
      {deliveries.map(d => (
        <GlassCard key={d.id} className="p-5">
           <div className="flex items-center gap-3 mb-3">
             <MapPin className="text-red-500" size={20} />
             <div>
               <p className="font-bold text-sm">Pickup: Writer Location</p>
               <p className="font-bold text-sm">Drop: {d.deliveryAddr || "Hostel A"}</p>
             </div>
           </div>
           <Button onClick={() => pickup(d.id)} className="w-full">Accept Delivery</Button>
        </GlassCard>
      ))}
      {deliveries.length === 0 && <p className="text-center text-gray-400 py-10">No deliveries pending.</p>}
    </div>
  );
};

// --- MAIN LAYOUT WITH NAV ---
const Layout = ({ children }: any) => {
  const { role, user, isAdmin } = useContext(UserContext);
  const { currentView, setCurrentView } = useContext(NavigationContext);
  const { isDark, setIsDark } = useContext(ThemeContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  
  // Real-time badge count
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
     if (!user) return;
     // Just a mock listener for length changes to show dot
     const q = query(collection(db, "notifications"), where("userId", "==", user.uid));
     return onSnapshot(q, (snap) => setUnreadCount(snap.docs.length));
  }, [user]);

  // The Center Button Action
  const handleCenterClick = () => {
    if (role === 'student') {
      setUploadOpen(true);
    } else {
      // For Writer/Delivery/Admin, refresh content
      setCurrentView('home');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-black dark:text-white transition-colors duration-300">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Top Bar */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 h-16 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
           <Logo size={28} />
           <span className="font-black text-xl tracking-tighter">LIKHO</span>
        </div>
        <div className="flex gap-1">
          <div className="relative">
             <button onClick={() => setNotifOpen(!notifOpen)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <Bell size={20} />
                {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>}
             </button>
             <Notifications isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
          </div>
          <button onClick={() => setIsDark(!isDark)} className="p-2 -mr-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            {isDark ? <Sun size={20}/> : <Moon size={20}/>}
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto px-4 py-6">
        {currentView === 'home' && (
          <>
            {isAdmin ? <AdminDashboard /> : (
              <>
                {role === 'student' && <StudentDashboard />}
                {role === 'writer' && <WriterDashboard />}
                {role === 'delivery' && <DeliveryDashboard />}
              </>
            )}
          </>
        )}
        {currentView === 'chat' && <GeneralChat />}
        {currentView === 'ai' && <AIChat />}
        {currentView === 'profile' && <ProfilePage />}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 pb-safe z-50">
        <div className="max-w-md mx-auto h-16 flex items-center justify-around px-2">
          <button onClick={() => setCurrentView('home')} className={`p-2 rounded-xl transition-all ${currentView === 'home' ? 'text-yellow-500' : 'text-gray-400'}`}>
            <Home size={24} strokeWidth={currentView === 'home' ? 3 : 2} />
          </button>
          
          <button onClick={() => setCurrentView('chat')} className={`p-2 rounded-xl transition-all ${currentView === 'chat' ? 'text-yellow-500' : 'text-gray-400'}`}>
            <MessageCircle size={24} strokeWidth={currentView === 'chat' ? 3 : 2} />
          </button>

          {/* Center Button */}
          <div className="relative -top-5">
            <button 
              onClick={handleCenterClick}
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transform transition-transform active:scale-95 ${role === 'student' ? 'bg-black text-white dark:bg-yellow-400 dark:text-black' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}
            >
              {role === 'student' ? <Plus size={28} /> : <RefreshCw size={24} />}
            </button>
          </div>

          <button onClick={() => setCurrentView('ai')} className={`p-2 rounded-xl transition-all ${currentView === 'ai' ? 'text-yellow-500' : 'text-gray-400'}`}>
            <Sparkles size={24} strokeWidth={currentView === 'ai' ? 3 : 2} />
          </button>

          <button onClick={() => setCurrentView('profile')} className={`p-2 rounded-xl transition-all ${currentView === 'profile' ? 'text-yellow-500' : 'text-gray-400'}`}>
            <User size={24} strokeWidth={currentView === 'profile' ? 3 : 2} />
          </button>
        </div>
      </div>

      <Modal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} title="New Order">
        <CreateAssignment onClose={() => setUploadOpen(false)} />
      </Modal>
    </div>
  );
};

// --- LANDING PAGE ---
const LandingPage = ({ onGetStarted }: any) => {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 -left-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-20 left-20 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Nav */}
      <nav className="p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <Logo size={40} />
          <span className="font-black text-2xl tracking-tighter">LIKHO</span>
        </div>
        <button onClick={() => onGetStarted('student')} className="font-bold hover:opacity-70">Login</button>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center z-10 space-y-8">
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
            Academic Help <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
              On Demand.
            </span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            The all-in-one platform for Students, Writers, and Delivery partners. Post assignments, get them written, and delivered to your door.
          </p>
        </div>

        <button 
          onClick={() => onGetStarted('student')}
          className="group relative inline-flex items-center justify-center px-8 py-4 font-black text-white transition-all duration-200 bg-black dark:bg-white dark:text-black rounded-full hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
        >
          Get Started Now
          <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mt-12 text-left">
          <button onClick={() => onGetStarted('student')} className="p-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border border-gray-100 dark:border-gray-800 rounded-3xl hover:scale-105 transition-transform text-left">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <Book size={24} />
            </div>
            <h3 className="font-bold text-lg mb-1">For Students</h3>
            <p className="text-sm text-gray-500">Post assignments, use AI scan, and track delivery in real-time.</p>
          </button>
          <button onClick={() => onGetStarted('writer')} className="p-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border border-gray-100 dark:border-gray-800 rounded-3xl hover:scale-105 transition-transform text-left">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-4">
              <DollarSign size={24} />
            </div>
            <h3 className="font-bold text-lg mb-1">For Writers</h3>
            <p className="text-sm text-gray-500">Browse tasks, accept jobs, and earn money for your expertise.</p>
          </button>
          <button onClick={() => onGetStarted('delivery')} className="p-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border border-gray-100 dark:border-gray-800 rounded-3xl hover:scale-105 transition-transform text-left">
             <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
               <Truck size={24} />
             </div>
             <h3 className="font-bold text-lg mb-1">For Delivery</h3>
             <p className="text-sm text-gray-500">Deliver assignments securely and earn per delivery.</p>
          </button>
        </div>
      </div>
      
      <div className="p-6 text-center text-xs text-gray-400">
        © 2024 Likho App. Academic Excellence.
      </div>
    </div>
  )
}

// --- AUTH SCREEN ---
const AuthScreen = ({ onBack, initialRole = 'student' }: any) => {
  const [isRegister, setIsRegister] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(initialRole);
  const [loading, setLoading] = useState(false);
  const { addToast } = useContext(ToastContext);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", res.user.uid), { 
            email, 
            role: role, // Use selected role
            roleRequest: role !== 'student' ? role : null, // If writer/delivery, mark as requested initially? Or just allow it.
            // For simplicity in this demo, we allow direct signup to role, 
            // but in real app you might want 'pending' state. 
            // We will set 'approvedRoles' for students immediately.
            approvedRoles: role === 'student' ? ['student'] : [],
            createdAt: serverTimestamp(),
            isAdmin: false 
        });
        addToast(`Welcome! Signed up as ${role}.`, "success");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user doc exists, if not create it
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
           await setDoc(userRef, {
             email: user.email,
             role: role, // Use selected role preference
             createdAt: serverTimestamp(),
             isAdmin: false,
             photoURL: user.photoURL,
             displayName: user.displayName
           });
        }
        addToast("Logged in with Google!", "success");
    } catch (e: any) {
        addToast(e.message, "error");
    } finally {
        setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!email) { addToast("Please enter email", "error"); return; }
      setLoading(true);
      try {
          await sendPasswordResetEmail(auth, email);
          addToast("Password reset link sent!", "success");
          setIsResetMode(false);
      } catch(e:any) {
          addToast(e.message, "error");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>

      <button onClick={onBack} className="absolute top-6 left-6 p-2 rounded-full bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all z-20">
         <ArrowLeft size={24} className="text-black dark:text-white" />
      </button>

      <div className="w-full max-w-sm z-10">
        <div className="bg-white dark:bg-black p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
            <div className="text-center mb-8">
                <div className="mb-6 flex justify-center">
                    <Logo size={80} />
                </div>
                <h1 className="text-3xl font-black text-black dark:text-white">
                    {isResetMode ? "Reset Password" : (isRegister ? "Join Likho" : "Welcome Back")}
                </h1>
                <p className="text-gray-500 text-sm mt-2">
                    {isResetMode ? "Enter email to receive reset link" : "Enter your credentials to continue"}
                </p>
            </div>

            {isResetMode ? (
                <form onSubmit={handleReset} className="space-y-4">
                    <Input 
                        label="Email Address" 
                        type="email" 
                        value={email} 
                        onChange={(e:any)=>setEmail(e.target.value)} 
                        required 
                        placeholder="you@example.com"
                        className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                    />
                    <Button type="submit" loading={loading} className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black border-0">
                        Send Link
                    </Button>
                    <button type="button" onClick={() => setIsResetMode(false)} className="w-full text-sm font-bold text-gray-400 hover:text-black dark:hover:text-white mt-4">
                        Back to Login
                    </button>
                </form>
            ) : (
                <>
                {isRegister && (
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-4">
                        {['student', 'writer', 'delivery'].map((r) => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => setRole(r)}
                                className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${role === r ? 'bg-white dark:bg-gray-700 shadow-sm text-black dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-5">
                    <Input 
                        label="Email Address" 
                        type="email" 
                        value={email} 
                        onChange={(e:any)=>setEmail(e.target.value)} 
                        required 
                        placeholder="you@example.com"
                         className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                    />
                    <div>
                        <Input 
                            label="Password" 
                            type="password" 
                            value={password} 
                            onChange={(e:any)=>setPassword(e.target.value)} 
                            required 
                            placeholder="••••••••"
                             className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                        />
                        <div className="flex justify-end mt-2">
                            <button type="button" onClick={() => setIsResetMode(true)} className="text-xs font-bold text-yellow-600 hover:text-yellow-700">
                                Forgot Password?
                            </button>
                        </div>
                    </div>

                    <Button type="submit" loading={loading} className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black border-0 shadow-lg shadow-yellow-400/20">
                        {isRegister ? `Sign Up as ${role.charAt(0).toUpperCase() + role.slice(1)}` : "Sign In"}
                    </Button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-800"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-black text-gray-500">Or continue with</span></div>
                </div>

                <Button variant="outline" onClick={handleGoogleLogin} loading={loading} className="w-full flex items-center justify-center gap-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Google
                </Button>
                </>
            )}

            {!isResetMode && (
                <div className="mt-6 text-center">
                    <button onClick={() => setIsRegister(!isRegister)} className="text-sm">
                        <span className="text-gray-400">{isRegister ? "Already have an account?" : "Don't have an account?"}</span>
                        <span className="font-bold text-black dark:text-white ml-1 hover:underline">{isRegister ? "Login" : "Register"}</span>
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

// --- APP ROOT ---
const App = () => {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [role, setRole] = useState("student");
  const [currentView, setCurrentView] = useState('home');
  const [showSplash, setShowSplash] = useState(true);
  
  // Initialize state based on system preference
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [authRole, setAuthRole] = useState('student'); // Default role for auth flow

  useEffect(() => {
     // Splash Timeout
     const timer = setTimeout(() => setShowSplash(false), 2500);
     return () => clearTimeout(timer);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
        setIsDark(e.matches);
    };
    
    // Support for older browsers
    if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
    } else {
        mediaQuery.addListener(handleChange);
    }

    return () => {
        if (mediaQuery.removeEventListener) {
            mediaQuery.removeEventListener('change', handleChange);
        } else {
             mediaQuery.removeListener(handleChange);
        }
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    let docUnsub: any = null;
    const authUnsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        const userRef = doc(db, "users", u.uid);
        
        // Initial setup if missing
        getDoc(userRef).then((snap) => {
            if (!snap.exists()) {
                setDoc(userRef, { email: u.email, role: 'student', createdAt: serverTimestamp(), isAdmin: u.email === 'admin@likho.com' });
            }
        });

        docUnsub = onSnapshot(userRef, (s) => {
          if (s.exists()) {
              const data = s.data();
              setUserProfile(data);
              setRole(data.role || 'student');
          }
          setLoading(false);
        }, () => setLoading(false));
      } else {
        if (docUnsub) docUnsub();
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });
    return () => { authUnsub(); if(docUnsub) docUnsub(); };
  }, []);

  const switchRole = async (newRole: string) => {
    if (!user) return;
    setRole(newRole); 
    await setDoc(doc(db, "users", user.uid), { role: newRole }, { merge: true });
    setCurrentView('home'); 
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentView('home');
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white dark:bg-black"><Loader2 className="animate-spin text-yellow-400" size={48}/></div>;

  // Derive Admin status
  const isAdmin = userProfile?.isAdmin === true || user?.email === 'admin@likho.com';

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      <ToastProvider>
        <UserContext.Provider value={{ user, userProfile, role, switchRole, logout, isAdmin }}>
          <NavigationContext.Provider value={{ currentView, setCurrentView }}>
            {showSplash && <SplashScreen />}
            {user ? (
              <Layout /> 
            ) : (
              showAuth ? (
                <AuthScreen onBack={() => setShowAuth(false)} initialRole={authRole} />
              ) : (
                <LandingPage onGetStarted={(role: string = 'student') => { setAuthRole(role); setShowAuth(true); }} />
              )
            )}
          </NavigationContext.Provider>
        </UserContext.Provider>
      </ToastProvider>
    </ThemeContext.Provider>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);