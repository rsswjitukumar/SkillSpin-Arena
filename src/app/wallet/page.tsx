'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { ChevronLeft, Wallet, ArrowDownToLine, ArrowUpFromLine, ShieldCheck, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function WalletPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [addAmount, setAddAmount] = useState('100');
  const [loading, setLoading] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<'RAZORPAY' | 'PAYTM'>('RAZORPAY');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setBalance(parsedUser.balance || 0);
    } else {
      router.push('/login');
    }
  }, [router]);

  const handlePay = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Create Order in Backend
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, 
          amount: addAmount, 
          gateway: selectedGateway 
        }),
      });
      const orderData = await orderRes.json();

      if (orderData.success) {
        // 2. Simulate Gateway Redirect & Success
        // In real app, this is where Razorpay Checkout JS opens
        alert(`Redirecting to ${selectedGateway}...`);
        
        // 3. Verify Payment in Backend (Simulated success callback)
        const verifyRes = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            orderId: orderData.order.id, 
            status: 'SUCCESS' 
          }),
        });
        const verifyData = await verifyRes.json();

        if (verifyData.success) {
          const newBalance = balance + parseFloat(addAmount);
          setBalance(newBalance);
          // Update local user state
          const updatedUser = { ...user, balance: newBalance };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          alert('Cash Added Successfully to your Beast Wallet!');
        }
      }
    } catch (err) {
      alert('Payment Failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const presetAmounts = ['50', '100', '200', '500', '1000', '2000'];

  return (
    <div className={styles.walletContainer}>
      
      {/* Header */}
      <div className={styles.header}>
        <button onClick={() => router.push('/')} className={styles.backBtn}>
          <ChevronLeft size={24} />
        </button>
        <h2 className={styles.headerTitle}>My Beast Wallet</h2>
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
          <Wallet size={20} color="var(--accent-green)" /> Add Money
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

        {/* Gateway Selection */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
           <button 
             onClick={() => setSelectedGateway('RAZORPAY')}
             className={`btn ${selectedGateway === 'RAZORPAY' ? 'btn-primary' : 'btn-outline'}`}
             style={{ flex: 1, fontSize: '0.8rem' }}
           >
             Razorpay {selectedGateway === 'RAZORPAY' && <CheckCircle2 size={14} />}
           </button>
           <button 
             onClick={() => setSelectedGateway('PAYTM')}
             className={`btn ${selectedGateway === 'PAYTM' ? 'btn-primary' : 'btn-outline'}`}
             style={{ flex: 1, fontSize: '0.8rem' }}
           >
             Paytm {selectedGateway === 'PAYTM' && <CheckCircle2 size={14} />}
           </button>
        </div>

        <button 
          onClick={handlePay}
          className={`btn btn-success ${loading ? 'loading' : ''}`}
          style={{ width: '100%', fontSize: '1.1rem', padding: '16px' }}
          disabled={loading || !addAmount}
        >
          {loading ? 'Processing...' : `Pay ₹${addAmount} via ${selectedGateway}`}
        </button>
        
        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
          <ShieldCheck size={14} color="var(--accent-green)" /> 100% Safe Payment Gateway
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
              <div className={styles.upiSub}>Instant Deposit via Razorpay</div>
            </div>
          </div>
          <ChevronRight size={20} color="var(--text-secondary)" />
        </div>
      </div>

    </div>
  );
}
