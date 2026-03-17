'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { ChevronLeft, Coins, Trophy } from 'lucide-react';

export default function SpinGame() {
  const router = useRouter();
  const [balance, setBalance] = useState(150);
  const [bet, setBet] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<number | null>(null);

  const segments = [
    { id: 1, colorClass: styles.s1, value: 0 },
    { id: 2, colorClass: styles.s2, value: 20 },
    { id: 3, colorClass: styles.s3, value: 50 },
    { id: 4, colorClass: styles.s4, value: 0 },
    { id: 5, colorClass: styles.s5, value: 15 },
    { id: 6, colorClass: styles.s6, value: 5 },
  ];

  const handleSpin = () => {
    if (balance < bet) {
      alert("Insufficient balance!");
      return;
    }
    
    setIsSpinning(true);
    setWinner(null);
    setBalance(prev => prev - bet);
    
    // Simulate spin between 5 to 10 full rotations + random segment
    const randomSegment = Math.floor(Math.random() * 6);
    const spins = Math.floor(Math.random() * 5) + 5; 
    const degreesPerSegment = 360 / 6;
    
    // Calculate new rotation
    const newRotation = rotation + (spins * 360) + (randomSegment * degreesPerSegment);
    setRotation(newRotation);

    // Determine winner value based on segment (simplified for UI demo)
    setTimeout(() => {
      setIsSpinning(false);
      // Actual logic would be offset calculation based on degrees, simulating win here
      const wonAmount = segments[5 - randomSegment].value; 
      
      if (wonAmount > 0) {
        setWinner(wonAmount);
        setBalance(prev => prev + wonAmount);
      } else {
        setWinner(0); // Better luck next time
      }
    }, 4000); // matches CSS animation duration
  };

  return (
    <div className={styles.gameContainer}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={() => router.push('/')} className={styles.backBtn}>
          <ChevronLeft size={24} />
        </button>
        <div className={styles.poolInfo}>
          <Coins size={16} /> ₹{balance}
        </div>
      </div>

      {/* Wheel Area */}
      <div className={styles.wheelSection}>
        <div className={styles.wheelOuter}>
          <div className={styles.wheelPointer}></div>
          <div 
            className={styles.wheelInner} 
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {segments.map((seg) => (
              <div key={seg.id} className={`${styles.segment} ${seg.colorClass}`}>
                <div className={styles.segmentContent}>
                  {seg.value > 0 ? `₹${seg.value}` : '0'}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.wheelCenter}>SPIN</div>
        </div>

        {/* Winner Overlay */}
        {winner !== null && (
          <div className={styles.winnerOverlay} onClick={() => setWinner(null)}>
            <Trophy size={60} color="var(--accent-gold)" style={{ marginBottom: '16px' }} />
            <div className={styles.winnerText}>
              {winner > 0 ? `Won ₹${winner}!` : 'Try Again!'}
            </div>
            <p style={{ color: 'white', opacity: 0.8 }}>Tap to continue</p>
          </div>
        )}
      </div>

      {/* Betting Controls */}
      <div className={styles.controlsPanel}>
        <span className={styles.betLabel}>Select Entry Amount</span>
        
        <div className={styles.betOptions}>
          {[5, 10, 20, 50].map((amount) => (
            <button
              key={amount}
              className={`${styles.betBtn} ${bet === amount ? styles.betBtnActive : ''}`}
              onClick={() => !isSpinning && setBet(amount)}
              disabled={isSpinning}
            >
              ₹{amount}
            </button>
          ))}
        </div>

        <button 
          className={`btn btn-primary animate-pulse-glow ${styles.spinBtn}`}
          style={{ background: 'linear-gradient(135deg, #7928ca, #ff0080)' }}
          onClick={handleSpin}
          disabled={isSpinning}
        >
          {isSpinning ? 'SPINNING...' : `SPIN FOR ₹${bet}`}
        </button>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
          Win upto 10x your entry!
        </p>
      </div>

    </div>
  );
}
