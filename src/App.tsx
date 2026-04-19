/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Briefcase, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Printer,
  ShieldCheck,
  Building2,
  RefreshCw,
  AlertCircle,
  Gem,
  Upload
} from 'lucide-react';
// @ts-ignore
import DatePicker from "react-multi-date-picker";
// @ts-ignore
import arabic from "react-date-object/locales/arabic_ar";
// @ts-ignore
import hijri from "react-date-object/calendars/arabic";
import "react-multi-date-picker/styles/layouts/mobile.css";

// Form types
interface FormData {
  personalInfo: {
    name: string;
    idNumber: string;
  };
  jobInfo: {
    unit: string;
    rank: string;
    generalNumber: string;
    job: string;
  };
  appointment: {
    startDate: any;
    decisionNumber: string;
    decisionDate: any;
  };
  termination: {
    terminationDate: any;
    decisionNumber: string;
    decisionDate: any;
  };
  attachments: {
    idFileName: string;
    idFileBase64: string;
  };
}

export default function App() {
  const [formData, setFormData] = useState<FormData>({
    personalInfo: {
      name: 'ماجد ملفي مطر الحربي',
      idNumber: '1074665108'
    },
    jobInfo: {
      unit: '',
      rank: '',
      generalNumber: '',
      job: ''
    },
    appointment: {
      startDate: null,
      decisionNumber: '',
      decisionDate: null
    },
    termination: {
      terminationDate: null,
      decisionNumber: '',
      decisionDate: null
    },
    attachments: {
      idFileName: '',
      idFileBase64: ''
    }
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Login State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ id: '', password: '' });
  const [loginError, setLoginError] = useState<string | null>(null);

  // Set RTL direction on mount
  useEffect(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.id === '1074665108' && loginData.password === 'Mm123456') {
      setIsLoggedIn(true);
      setLoginError(null);
    } else {
      setLoginError('بيانات الدخول غير صحيحة، يرجى المحاولة مرة أخرى.');
    }
  };

  const handleInputChange = (section: keyof FormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange('attachments', 'idFileName', file.name);
        handleInputChange('attachments', 'idFileBase64', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    // Format Hijri dates to strings for the email
    const formattedData = {
      ...formData,
      appointment: {
        ...formData.appointment,
        startDate: formData.appointment.startDate?.format?.() || formData.appointment.startDate,
        decisionDate: formData.appointment.decisionDate?.format?.() || formData.appointment.decisionDate,
      },
      termination: {
        ...formData.termination,
        terminationDate: formData.termination.terminationDate?.format?.() || formData.termination.terminationDate,
        decisionDate: formData.termination.decisionDate?.format?.() || formData.termination.decisionDate,
      }
    };

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formData: formattedData }),
      });

      if (!response.ok) {
        throw new Error('فشل إرسال البيانات للبريد الإلكتروني');
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError('حدث خطأ أثناء إرسال البيانات. يرجى التأكد من تعبئة جميع الحقول وإرفاق الهوية.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onNumericInput = (section: keyof FormData, field: string, value: string) => {
    const cleaned = value.replace(/[^\d\u0660-\u0669]/g, '');
    handleInputChange(section, field, cleaned);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 font-sans text-right text-[#1e1b4b]" dir="rtl">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-3xl shadow-2xl shadow-indigo-900/5 max-w-sm w-full text-center border border-[#f1e6ff]"
        >
          <div className="w-16 h-16 bg-[#2e1065]/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#2e1065]/10">
            <CheckCircle2 className="w-8 h-8 text-[#2e1065]" />
          </div>
          <h2 className="text-xl font-bold text-[#2e1065] mb-2">تم الإرسال بنجاح</h2>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">نشكرك على تعبئة النموذج. تم استلام كافة البيانات والملحقات وإرسالها لإدارة ريفانس بنجاح.</p>
          
          <div className="space-y-3">
            <button 
              onClick={() => setIsSubmitted(false)}
              className="w-full bg-[#2e1065] hover:bg-[#1e0a45] text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-900/20 active:scale-95 text-xs text-center"
            >
              إرسال طلب جديد
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 font-sans text-right text-[#1e1b4b]" dir="rtl">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white p-8 rounded-3xl shadow-2xl shadow-indigo-900/5 max-w-md w-full border border-[#f1e6ff]"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="bg-[#2e1065] p-3 rounded-2xl shadow-lg shadow-indigo-900/20 mb-4">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-extrabold text-[#2e1065] mb-2 text-center">بوابة ريفانس المالية</h1>
            <p className="text-[11px] text-slate-400 text-center leading-relaxed font-medium">
              تم تأمين هذه الصفحة باستخدام أنظمة حماية وتشفير متقدمة لضمان سلامة البيانات أثناء الإدخال والمعالجة.
            </p>
          </div>

          <div className="bg-indigo-50/30 p-4 rounded-xl border border-indigo-100/50 mb-6">
            <p className="text-[12px] text-[#2e1065] font-bold leading-relaxed text-right">
              للوصول إلى طلبكم واستكمال الإجراءات المتعلقه بطلب الإعفاء من المنتجات المالية
              <br /><br />
              يرجى تسجيل الدخول عبر البيانات الرقمية التالية:
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 mr-1">رقم الهوية</label>
              <input 
                type="text" 
                required
                value={loginData.id}
                onChange={(e) => setLoginData({ ...loginData, id: e.target.value })}
                className="w-full bg-white border border-slate-200 focus:border-[#2e1065] focus:ring-4 focus:ring-indigo-50 rounded-lg px-3 py-2 text-xs outline-none transition-all text-right"
                placeholder="أدخل رقم الهوية"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 mr-1">الرقم السري</label>
              <input 
                type="password" 
                required
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="w-full bg-white border border-slate-200 focus:border-[#2e1065] focus:ring-4 focus:ring-indigo-50 rounded-lg px-3 py-2 text-xs outline-none transition-all text-right"
                placeholder="••••••••"
              />
            </div>
            
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-[10px] text-red-600 font-bold">{loginError}</span>
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-[#2e1065] hover:bg-[#1e0a45] text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-900/20 active:scale-95 text-xs"
            >
              تسجيل الدخول الآمن
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">Digital Security | Rifans Financial</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-right text-[#1e1b4b] flex flex-col" dir="rtl">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-[#f1e6ff] sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#2e1065] p-2 rounded-xl shadow-lg shadow-indigo-900/20">
              <Gem className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-base font-extrabold text-[#2e1065] tracking-tight">ريفانس المالية</h1>
              <span className="text-[10px] text-[#2e1065]/60 font-bold uppercase tracking-widest hidden sm:block">Financial Excellence</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6 pb-20">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-900/5 border border-[#f1e6ff] space-y-10">
            
            {/* القسم 1: المعلومات الشخصية */}
            <section className="space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <div className="p-2 bg-[#2e1065]/5 rounded-lg">
                  <User className="w-5 h-5 text-[#2e1065]" />
                </div>
                <h2 className="text-lg font-bold text-[#2e1065]">المعلومات الشخصية</h2>
              </div>
              <div className="grid grid-cols-1 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 mr-1">الاسم الكامل</label>
                  <input 
                    type="text" 
                    value={formData.personalInfo.name}
                    disabled
                    className="w-full bg-[#FDFBF7]/50 border border-slate-100 rounded-lg px-3 py-2 text-xs text-slate-400 font-medium cursor-not-allowed text-right"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 mr-1">رقم الهوية</label>
                  <input 
                    type="text" 
                    value={formData.personalInfo.idNumber}
                    disabled
                    className="w-full bg-[#FDFBF7]/50 border border-slate-100 rounded-lg px-3 py-2 text-xs text-slate-400 font-medium cursor-not-allowed tracking-wider text-right"
                  />
                </div>
              </div>
              <div className="p-4 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#2e1065]/60 mt-0.5 shrink-0" />
                <p className="text-[11px] text-[#2e1065]/50 leading-relaxed">
                   بيانات الهوية والاسم مسجلة مسبقاً في قاعدة بيانات
                </p>
              </div>
            </section>

            {/* القسم 2: معلومات الوظيفة */}
            <section className="space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <div className="p-2 bg-[#2e1065]/5 rounded-lg">
                  <Briefcase className="w-5 h-5 text-[#2e1065]" />
                </div>
                <h2 className="text-lg font-bold text-[#2e1065]">معلومات الوظيفة</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#2e1065]/70 mr-1">الوحدة</label>
                  <input 
                    type="text" 
                    required
                    value={formData.jobInfo.unit}
                    onChange={(e) => handleInputChange('jobInfo', 'unit', e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-[#2e1065] focus:ring-4 focus:ring-indigo-50 rounded-lg px-3 py-2 text-xs outline-none transition-all text-right"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#2e1065]/70 mr-1">الرتبة</label>
                  <input 
                    type="text" 
                    required
                    value={formData.jobInfo.rank}
                    onChange={(e) => handleInputChange('jobInfo', 'rank', e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-[#2e1065] focus:ring-4 focus:ring-indigo-50 rounded-lg px-3 py-2 text-xs outline-none transition-all text-right"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#2e1065]/70 mr-1">الرقم العام</label>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    required
                    value={formData.jobInfo.generalNumber}
                    onChange={(e) => onNumericInput('jobInfo', 'generalNumber', e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-[#2e1065] focus:ring-4 focus:ring-indigo-50 rounded-lg px-3 py-2 text-xs outline-none text-right transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#2e1065]/70 mr-1">الوظيفة</label>
                  <input 
                    type="text" 
                    required
                    value={formData.jobInfo.job}
                    onChange={(e) => handleInputChange('jobInfo', 'job', e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-[#2e1065] focus:ring-4 focus:ring-indigo-50 rounded-lg px-3 py-2 text-xs outline-none transition-all text-right"
                  />
                </div>
              </div>
            </section>

            {/* القسم 3: التعيين */}
            <section className="space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <div className="p-2 bg-[#2e1065]/5 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-[#2e1065]" />
                </div>
                <h2 className="text-lg font-bold text-[#2e1065]">التعيين</h2>
              </div>
              <div className="grid grid-cols-1 gap-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#2e1065]/70 mr-1">تاريخ المباشرة (هجري)</label>
                    <DatePicker
                      calendar={hijri}
                      locale={arabic}
                      required
                      value={formData.appointment.startDate}
                      onChange={(date: any) => handleInputChange('appointment', 'startDate', date)}
                      inputClass="w-full bg-white border border-slate-200 focus:border-[#2e1065] rounded-lg px-3 py-2 text-xs outline-none text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#2e1065]/70 mr-1">رقم القرار</label>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      required
                      value={formData.appointment.decisionNumber}
                      onChange={(e) => onNumericInput('appointment', 'decisionNumber', e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-[#2e1065] focus:ring-4 focus:ring-indigo-50 rounded-lg px-3 py-2 text-xs outline-none text-right"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#2e1065]/70 mr-1">تاريخ القرار (هجري)</label>
                  <DatePicker
                    calendar={hijri}
                    locale={arabic}
                    required
                    value={formData.appointment.decisionDate}
                    onChange={(date: any) => handleInputChange('appointment', 'decisionDate', date)}
                    inputClass="w-full bg-white border border-slate-200 focus:border-[#2e1065] rounded-lg px-3 py-2 text-xs outline-none text-right"
                  />
                </div>
              </div>
            </section>

            {/* القسم 4: إنهاء الخدمة */}
            <section className="space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <div className="p-2 bg-[#2e1065]/5 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-[#2e1065]" />
                </div>
                <h2 className="text-lg font-bold text-[#2e1065]">إنهاء الخدمة</h2>
              </div>
              <div className="grid grid-cols-1 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#2e1065]/70 mr-1">تاريخ إنهاء الخدمة (هجري)</label>
                  <DatePicker
                    calendar={hijri}
                    locale={arabic}
                    required
                    value={formData.termination.terminationDate}
                    onChange={(date: any) => handleInputChange('termination', 'terminationDate', date)}
                    inputClass="w-full bg-white border border-slate-200 focus:border-[#2e1065] rounded-lg px-3 py-2 text-xs outline-none text-right"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#2e1065]/70 mr-1">رقم القرار</label>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      required
                      value={formData.termination.decisionNumber}
                      onChange={(e) => onNumericInput('termination', 'decisionNumber', e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-[#2e1065] focus:ring-4 focus:ring-indigo-50 rounded-lg px-3 py-2 text-xs outline-none text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#2e1065]/70 mr-1">تاريخ القرار (هجري)</label>
                    <DatePicker
                      calendar={hijri}
                      locale={arabic}
                      required
                      value={formData.termination.decisionDate}
                      onChange={(date: any) => handleInputChange('termination', 'decisionDate', date)}
                      inputClass="w-full bg-white border border-slate-200 focus:border-[#2e1065] rounded-lg px-3 py-2 text-xs outline-none text-right"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* القسم 5: المرفقات */}
            <section className="space-y-5 pt-4">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <div className="p-2 bg-[#2e1065]/5 rounded-lg">
                  <Upload className="w-5 h-5 text-[#2e1065]" />
                </div>
                <h2 className="text-lg font-bold text-[#2e1065]">المرفقات</h2>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-[#2e1065]/70 mr-1">إرفاق الهوية الوطنية (صورة أو PDF)</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    required
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full bg-[#FDFBF7] border-2 border-dashed border-[#f1e6ff] group-hover:border-[#2e1065]/20 rounded-2xl p-6 transition-all flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 bg-[#2e1065]/5 rounded-full flex items-center justify-center">
                      <Upload className="w-5 h-5 text-[#2e1065]" />
                    </div>
                    <span className="text-[11px] font-bold text-[#2e1065]/60">
                      {formData.attachments.idFileName || ''}
                    </span>
                    <span className="text-[9px] text-slate-300">الحد الأقصى ٥ ميجابايت</span>
                  </div>
                </div>
              </div>
            </section>

            {submitError && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <p className="text-xs text-rose-700 font-medium">{submitError}</p>
              </div>
            )}

            {/* زر الإرسال */}
            <div className="pt-6 border-t border-slate-50 flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full max-w-sm flex items-center justify-center gap-2 bg-[#2e1065] hover:bg-[#1e0a45] text-white py-3 rounded-2xl text-sm font-extrabold transition-all shadow-xl shadow-indigo-900/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    جاري الإرسال...
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-200" />
                  </>
                ) : (
                  <>
                    إرسال كافة البيانات
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>

      <footer className="w-full px-6 py-8 text-center text-slate-400 text-[10px] font-medium tracking-wide">
        <p className="mb-1">© ٢٠٢٦ مـ - ريفانس المالية | إدارة التحول الرقمي</p>
        <p className="text-slate-300 font-bold uppercase tracking-[0.2em]">Rifans Financial</p>
      </footer>
    </div>
  );
}
