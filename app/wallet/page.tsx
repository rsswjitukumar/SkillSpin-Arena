'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { ChevronLeft, Wallet, ArrowDownToLine, ArrowUpFromLine, ShieldCheck, ChevronRight } from 'lucide-react';

export default function WalletPage() {
  const router = useRouter();
  const [balance] = useState(150.00);
  const [addAmount, setAddAmount] = useState('100');

  const presetAmounts = ['50', '100', '200', '500', '1000', '2000'];

  return (
    <div className={styles.walletContainer}>
      
      {/* Header */}
      <div className={styles.header}>
        <button onClick={() => router.push('/')} className={styles.backBtn}>
          <ChevronLeft size={24} />
        </button>
        <h2 className={styles.headerTitle}>My Wallet</h2>
      </div>

      {/* Main Balance Card */}
      <div className={`glass-panel ${styles.balanceCard}`}>
        <span className={styles.balanceLabel}>Total Balance</span>
        <div className={styles.balanceAmount}>₹{balance.toFixed(2)}</div>
        
        <div className={styles.actionRow}>
          <button className={`btn btn-success ${styles.actionBtn}`}>
            <ArrowDownToLine size={18} /> Add Cash
          </button>
          <button className={`btn btn-outline ${styles.actionBtn}`}>
            <ArrowUpFromLine size={18} /> Withdraw
          </button>
        </div>
      </div>

      {/* Add Money Section */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 className={styles.sectionTitle}>
          <Wallet size={20} color="var(--accent-green)" /> Add Money to Wallet
        </h3>
        
        <div className={styles.presetAmounts}>
          {presetAmounts.map((amt) => (
            <button 
              key={amt}
              className={`${styles.presetBtn} ${addAmount === amt ? styles.presetBtnActive : ''}`}
              onClick={() => setAddAmount(amt)}
            >
              ₹{amt}
            </button>
          ))}
        </div>

        <div className={styles.customInputWrapper}>
          <span className={styles.currencySymbol}>₹</span>
          <input 
            type="number"
            value={addAmount}
            onChange={(e) => setAddAmount(e.target.value)}
            className={`input-glass ${styles.customInput}`}
            placeholder="Enter Amount"
          />
        </div>

        <button className="btn btn-success" style={{ width: '100%', fontSize: '1.1rem', padding: '16px' }}>
          Proceed to Pay ₹{addAmount}
        </button>
        
        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
          <ShieldCheck size={14} color="var(--accent-green)" /> 100% Safe & Secure Payments
        </div>
      </div>

      {/* Payment Methods Info */}
      <div className={styles.paymentMethods}>
        <h3 className={styles.sectionTitle} style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Supported Methods</h3>
        
        <div className={styles.upiOption}>
          <div className={styles.upiDetails}>
            <div className={styles.upiIcon} style={{ color: '#005f73' }}>UPI</div>
            <div>
              <div className={styles.upiName}>Paytm / PhonePe / GPay</div>
              <div className={styles.upiSub}>Instant Deposit</div>
            </div>
          </div>
          <ChevronRight size={20} color="var(--text-secondary)" />
        </div>
        
        <div className={styles.upiOption}>
          <div className={styles.upiDetails}>
            <div className={styles.upiIcon} style={{ background: '#1e293b', color: 'white' }}>💳</div>
            <div>
              <div className={styles.upiName}>Cards & Netbanking</div>
              <div className={styles.upiSub}>All Major Banks Supported</div>
            </div>
          </div>
          <ChevronRight size={20} color="var(--text-secondary)" />
        </div>
      </div>

    </div>
  );
}
