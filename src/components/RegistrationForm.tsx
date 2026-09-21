'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  CreditCard, 
  Send, 
  Copy, 
  Check, 
  ShieldCheck, 
  Zap,
  Image as ImageIcon
} from 'lucide-react';

export default function RegistrationForm() {
  const easypaisaNumber = process.env.NEXT_PUBLIC_EASYPAISA_NUMBER || '03453155319';
  const easypaisaTitle = process.env.NEXT_PUBLIC_EASYPAISA_TITLE || 'Noushad Ali Khan';
  const whatsappContact = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '03152799576';

  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    email: '',
    city: '',
    format: 'Live + Recorded Classes',
    transaction_id: '',
  });

  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ name: string; registrationId?: number } | null>(null);

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(easypaisaNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select an image file for the screenshot.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File size must be under 5MB.');
      return;
    }

    setErrorMsg(null);
    setScreenshotFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Client-side Validation
    if (!formData.name.trim()) {
      setErrorMsg('Please enter your Full Name.');
      return;
    }

    if (!formData.whatsapp.trim()) {
      setErrorMsg('Please enter your WhatsApp Number.');
      return;
    }

    const cleanWhatsapp = formData.whatsapp.replace(/[^0-9]/g, '');
    if (cleanWhatsapp.length < 9) {
      setErrorMsg('Please enter a valid numeric WhatsApp number.');
      return;
    }

    if (!formData.city.trim()) {
      setErrorMsg('Please enter your City.');
      return;
    }

    if (!formData.transaction_id.trim()) {
      setErrorMsg('Please enter your Easypaisa Transaction ID / Reference Number.');
      return;
    }

    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('whatsapp', formData.whatsapp.trim());
      data.append('email', formData.email.trim());
      data.append('city', formData.city.trim());
      data.append('format', formData.format);
      data.append('transaction_id', formData.transaction_id.trim());

      if (screenshotFile) {
        data.append('screenshot', screenshotFile);
      }

      const res = await fetch('/api/register', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to submit registration');
      }

      setSuccessData({
        name: result.name || formData.name,
        registrationId: result.registrationId,
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred while submitting your registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (successData) {
    return (
      <div className="w-full max-w-lg mx-auto p-4 sm:p-6 my-8">
        <div className="glass-panel rounded-3xl p-8 text-center glow-border relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#2dd4bf] opacity-10 rounded-full blur-2xl" />
          
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#2dd4bf]/20 to-[#10b981]/20 border border-[#2dd4bf]/40 mb-6 text-[#2dd4bf] shadow-lg shadow-[#2dd4bf]/10">
            <CheckCircle2 className="w-10 h-10 animate-pulse" />
          </div>

          <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
            Registration Received!
          </h2>

          <div className="h-1 w-16 bg-gradient-to-r from-[#2dd4bf] to-[#10b981] mx-auto rounded-full mb-6" />

          <p className="text-lg text-emerald-300 font-medium mb-4">
            Thank you, <span className="text-white font-bold">{successData.name}</span>!
          </p>

          <p className="text-slate-300 text-sm leading-relaxed mb-8 bg-[#0d1117]/80 p-5 rounded-2xl border border-slate-800">
            Your registration is received. We&apos;ll verify your payment and confirm your seat within <span className="text-[#2dd4bf] font-semibold">24 hours</span> via WhatsApp.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => {
                setSuccessData(null);
                setFormData({
                  name: '',
                  whatsapp: '',
                  email: '',
                  city: '',
                  format: 'Live Classes',
                  transaction_id: '',
                });
                setScreenshotFile(null);
                setScreenshotPreview(null);
              }}
              className="w-full py-3.5 px-6 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition duration-200"
            >
              Submit Another Registration
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-[#2dd4bf]" />
            <span>AI-Powered Frontend Developer by Laiba Khan</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card text-xs font-semibold text-[#2dd4bf] mb-4 border border-[#2dd4bf]/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Laiba Khan presents</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3">
          AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2dd4bf] via-[#34d399] to-[#10b981] glow-text-teal">Frontend Developer</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 font-medium max-w-md mx-auto flex items-center justify-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 bg-emerald-950/60 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-500/20">
            <Zap className="w-3.5 h-3.5 text-[#2dd4bf]" />
            8 Weeks
          </span>
          <span className="text-slate-600">•</span>
          <span className="bg-slate-900/80 text-slate-300 px-3 py-1 rounded-full text-xs font-semibold border border-slate-800">
            Live Classes
          </span>
          <span className="text-slate-600">•</span>
          <span className="bg-slate-900/80 text-slate-300 px-3 py-1 rounded-full text-xs font-semibold border border-slate-800">
            2 Classes a Week
          </span>
        </p>
      </div>

      {/* Main Registration Form Card */}
      <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 sm:p-8 glow-border shadow-2xl relative">
        
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/80 border border-red-500/40 text-red-200 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}

        {/* Student Details Section */}
        <div className="space-y-5 mb-8">
          <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2dd4bf]" />
            Student Details
          </h3>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Full Name <span className="text-[#2dd4bf]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ayesha Malik"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#0d1117]/90 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#2dd4bf] focus:ring-1 focus:ring-[#2dd4bf] transition"
            />
          </div>

          {/* WhatsApp Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              WhatsApp Number <span className="text-[#2dd4bf]">*</span>
            </label>
            <input
              type="tel"
              required
              placeholder="03001234567"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className="w-full bg-[#0d1117]/90 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#2dd4bf] focus:ring-1 focus:ring-[#2dd4bf] transition"
            />
            <p className="text-[11px] text-slate-400 mt-1">We will contact you on this number to confirm your seat.</p>
          </div>

          {/* Email (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <input
              type="email"
              placeholder="ayesha@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[#0d1117]/90 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#2dd4bf] focus:ring-1 focus:ring-[#2dd4bf] transition"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              City <span className="text-[#2dd4bf]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Lahore, Karachi, Islamabad"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full bg-[#0d1117]/90 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#2dd4bf] focus:ring-1 focus:ring-[#2dd4bf] transition"
            />
          </div>

          {/* Course Format Package Card */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Course Package <span className="text-[#2dd4bf]">*</span>
            </label>
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-[#2dd4bf] shadow-lg shadow-[#2dd4bf]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-white">Live + Recorded Classes</span>
                  <span className="bg-[#2dd4bf]/20 text-[#2dd4bf] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-[#2dd4bf]/30">Full Access</span>
                </div>
                <p className="text-xs text-slate-300">Interactive live sessions + Full recorded access included</p>
              </div>
              <div className="sm:text-right shrink-0">
                <span className="text-base sm:text-lg font-extrabold text-[#2dd4bf]">PKR 8,500</span>
                <p className="text-[10px] text-slate-400">Total Course Fee</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fee & Payment Info Card */}
        <div className="mb-8 p-5 rounded-2xl bg-gradient-to-b from-emerald-950/40 to-[#0d1117]/80 border border-[#2dd4bf]/30 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-900/40">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#2dd4bf]" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Payment Instructions</span>
            </div>
            <span className="text-xs font-extrabold text-[#2dd4bf] bg-[#2dd4bf]/10 px-2.5 py-1 rounded-full border border-[#2dd4bf]/20">
              Easypaisa
            </span>
          </div>

          <div className="flex flex-wrap gap-4 justify-between items-center bg-[#0d1117]/90 p-3.5 rounded-xl border border-slate-800 mb-3">
            <div>
              <p className="text-[11px] text-slate-400">Account Title</p>
              <p className="text-sm font-bold text-white">{easypaisaTitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <div>
                <p className="text-[11px] text-slate-400">Easypaisa Number</p>
                <p className="text-sm font-mono font-bold text-[#2dd4bf]">{easypaisaNumber}</p>
              </div>
              <button
                type="button"
                onClick={handleCopyNumber}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Copy Number"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Send the fee (<span className="text-[#2dd4bf] font-bold">PKR 8,500</span>) to the Easypaisa number above, then fill in your payment details below so we can confirm your seat.
          </p>
        </div>

        {/* Payment Verification Fields */}
        <div className="space-y-5 mb-8">
          <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            Payment Details
          </h3>

          {/* Transaction ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Transaction ID / Reference Number <span className="text-[#2dd4bf]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. TRX987654321"
              value={formData.transaction_id}
              onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
              className="w-full bg-[#0d1117]/90 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm font-mono placeholder-slate-500 focus:outline-none focus:border-[#2dd4bf] focus:ring-1 focus:ring-[#2dd4bf] transition"
            />
          </div>

          {/* Payment Screenshot Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Payment Screenshot <span className="text-slate-500 font-normal">(Optional, max 5MB)</span>
            </label>
            
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="screenshot-upload"
              />
              
              <label
                htmlFor="screenshot-upload"
                className="flex items-center justify-center gap-3 p-4 rounded-xl border border-dashed border-slate-700 bg-[#0d1117]/60 hover:bg-slate-900/60 cursor-pointer transition text-slate-400 hover:text-white"
              >
                <Upload className="w-5 h-5 text-[#2dd4bf]" />
                <span className="text-xs font-medium">
                  {screenshotFile ? screenshotFile.name : 'Click to upload payment receipt screenshot'}
                </span>
              </label>
            </div>

            {screenshotPreview && (
              <div className="mt-3 relative w-full h-40 rounded-xl overflow-hidden border border-slate-800 bg-black/40 flex items-center justify-center">
                {/* eslint-disable-next-next/no-img-element */}
                <img
                  src={screenshotPreview}
                  alt="Screenshot preview"
                  className="max-h-full max-w-full object-contain"
                />
                <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-[10px] text-emerald-400 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" /> Ready
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 px-6 rounded-2xl btn-gradient text-base font-bold flex items-center justify-center gap-2 shadow-xl"
        >
          {submitting ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Submitting...</span>
            </div>
          ) : (
            <>
              <span>Complete Registration</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="mt-4 pt-4 border-t border-slate-800/60 text-center space-y-1">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2dd4bf]" />
            Instant verification & instant confirmation on WhatsApp
          </p>
          <p className="text-xs text-slate-300">
            For support / queries, contact WhatsApp: {' '}
            <a
              href={`https://wa.me/${whatsappContact.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2dd4bf] hover:underline font-bold font-mono"
            >
              {whatsappContact}
            </a>
          </p>
        </div>

      </form>
    </div>
  );
}
