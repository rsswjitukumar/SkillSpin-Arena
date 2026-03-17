'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { Phone, Lock, ChevronLeft, Gamepad2, Sparkles, MessageCircle, ShieldCheck } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) return alert('Enter a valid 10-digit number');
    
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        alert('OTP sent on WhatsApp!');
      } else {
        alert(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      alert('Internal Server Error. Check if server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otp }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        alert('Welcome back! Login Successful.');
        router.push('/');
      } else {
        alert(data.error || 'Invalid OTP');
      }
    } catch (err) {
      alert('Verification Error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      {/* Back Button */}
      <button onClick={() => router.push('/')} className={styles.backBtn}>
        <ChevronLeft size={20} />
        Back to Home
      </button>

      <div className={`glass-panel ${styles.authCard}`}>
        <div className={styles.brandLogo}>
          <Gamepad2 size={40} color="var(--primary-accent)" style={{ margin: '0 auto 12px' }} />
          <h1><span className="text-gradient">SkillSpin</span> Arena</h1>
          <p className={styles.authSubtitle}>
            {otpSent 
              ? 'Verify the 6-digit code' 
              : isLogin 
                ? 'Login via WhatsApp OTP' 
                : 'Sign up and get ₹50 bonus!'}
          </p>
        </div>

        <form className={styles.authForm} onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
          
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Mobile Number</label>
            <div className={styles.inputWrapper}>
              <Phone size={18} className={styles.iconPrefix} />
              <input 
                type="tel" 
                placeholder="Enter 10-digit number" 
                className={`input-glass ${styles.inputWithIcon}`}
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={otpSent}
              />
            </div>
          </div>

          {otpSent && (
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>OTP Code</label>
              <div className={styles.inputWrapper}>
                <ShieldCheck size={18} className={styles.iconPrefix} />
                <input 
                  type="text" 
                  placeholder="Enter 6-digit OTP" 
                  className={`input-glass ${styles.inputWithIcon}`}
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            </div>
          )}

          {!isLogin && !otpSent && (
             <div className={styles.inputGroup}>
               <label className={styles.inputLabel}>Referral Code (Optional)</label>
               <div className={styles.inputWrapper}>
                 <Sparkles size={18} className={styles.iconPrefix} />
                 <input 
                   type="text" 
                   placeholder="Have a referral code?" 
                   className={`input-glass ${styles.inputWithIcon}`}
                 />
               </div>
             </div>
          )}

          <button 
            type="submit" 
            className={`btn btn-primary ${loading ? 'loading' : ''}`} 
            style={{ marginTop: '8px', gap: '10px' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : (
              <>
                {otpSent ? 'Verify OTP' : (
                  <>Send OTP <MessageCircle size={18} fill="white" /></>
                )}
              </>
            )}
          </button>
        </form>

        <div className={styles.divider}>
          <span>OR</span>
        </div>

        <button className={styles.socialBtn}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" width={20} height={20} />
          Continue with Google
        </button>

        <div className={styles.authFooter}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            className={styles.authLink} 
            onClick={() => {
              setIsLogin(!isLogin);
              setOtpSent(false);
            }}
          >
            {isLogin ? 'Sign up here' : 'Login here'}
          </span>
        </div>
      </div>
    </div>
  );
}
