'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { Phone, Lock, ChevronLeft, Gamepad2, Sparkles } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);

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
            {isLogin 
              ? 'Login to resume your winning streak!' 
              : 'Create an account and get ₹50 free bonus!'}
          </p>
        </div>

        <form className={styles.authForm} onSubmit={(e) => { e.preventDefault(); router.push('/'); }}>
          
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
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Password</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.iconPrefix} />
              <input 
                type="password" 
                placeholder="Enter secure password" 
                className={`input-glass ${styles.inputWithIcon}`}
                required
              />
            </div>
          </div>

          {!isLogin && (
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

          <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
            {isLogin ? 'Secure Login' : 'Create Account'}
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
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign up here' : 'Login here'}
          </span>
        </div>
      </div>
    </div>
  );
}
