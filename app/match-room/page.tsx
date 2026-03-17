'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { ChevronLeft, Coins, Gamepad2, Search, Zap } from 'lucide-react';

export default function MatchRoom() {
  const router = useRouter();
  const [balance, setBalance] = useState(150);
  const [entryFee, setEntryFee] = useState(10);
  
  // 'setup' | 'searching' | 'found' | 'playing'
  const [matchState, setMatchState] = useState<'setup' | 'searching' | 'found'>('setup');
  const [countdown, setCountdown] = useState(3);

  const poolOptions = [
    { entry: 10, win: 18 },
    { entry: 25, win: 45 },
    { entry: 50, win: 90 },
    { entry: 100, win: 180 },
  ];

  const handleFindMatch = () => {
    if (balance < entryFee) {
      alert("Insufficient Balance!");
      return;
    }
    setBalance(prev => prev - entryFee);
    setMatchState('searching');
  };

  useEffect(() => {
    let searchTimer: NodeJS.Timeout;
    let startTimer: NodeJS.Timeout;

    if (matchState === 'searching') {
      // Simulate finding a match after 3-5 seconds
      const simulatedWait = Math.floor(Math.random() * 2000) + 2000;
      searchTimer = setTimeout(() => {
        setMatchState('found');
      }, simulatedWait);
    }

    if (matchState === 'found') {
      startTimer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(startTimer);
            alert("Game starts now! (Redirecting to Ludo Engine...)");
            router.push('/'); 
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      clearTimeout(searchTimer);
      clearInterval(startTimer);
    };
  }, [matchState, router]);

  return (
    <div className={styles.matchContainer}>
      
      {/* Header */}
      <div className={styles.header}>
        <button 
          onClick={() => {
            if (matchState === 'setup') router.push('/');
            else setMatchState('setup');
          }} 
          className={styles.backBtn}
        >
          <ChevronLeft size={24} />
        </button>
        <div className={styles.headerTitle}>Skill Ludo 1v1</div>
        <div className={styles.walletBadge}>
          <Coins size={16} /> ₹{balance}
        </div>
      </div>

      {matchState === 'setup' && (
        <div className={`glass-panel ${styles.setupCard}`}>
          <div className={styles.gameIcon}>
            <Gamepad2 size={60} color="white" />
          </div>
          <h2 className={styles.selectionTitle}>Select Match Pool</h2>
          <p className={styles.selectionSub}>Winner takes all (minus platform fee)</p>

          <div className={styles.poolSelector}>
            {poolOptions.map((pool) => (
              <div 
                key={pool.entry}
                className={`${styles.poolBtn} ${entryFee === pool.entry ? styles.poolBtnActive : ''}`}
                onClick={() => setEntryFee(pool.entry)}
              >
                <div className={styles.entryFee}>₹{pool.entry}</div>
                <div className={styles.winningPrize}>Win ₹{pool.win}</div>
              </div>
            ))}
          </div>

          <button 
            className={`btn btn-primary ${styles.findMatchBtn}`}
            onClick={handleFindMatch}
          >
            Find Opponent <Zap size={20} fill="white" />
          </button>
        </div>
      )}

      {matchState === 'searching' && (
        <div className={styles.searchingState}>
          <div className={styles.radarContainer}>
            <div className={styles.radarPulse}></div>
            <div className={styles.radarPulse}></div>
            <div className={styles.radarCenter}>
              <Search size={32} color="white" />
            </div>
          </div>
          
          <h2 className={styles.searchingText}>Finding Opponent...</h2>
          <p className={styles.searchingSub}>Searching for players near your skill level</p>

          <button 
            className={`btn btn-outline ${styles.cancelBtn}`}
            onClick={() => {
              setMatchState('setup');
              setBalance(prev => prev + entryFee); // Refund on cancel
            }}
          >
            Cancel Search
          </button>
        </div>
      )}

      {matchState === 'found' && (
        <div className={styles.searchingState} style={{ justifyContent: 'flex-start', paddingTop: '2rem' }}>
          
          <h2 className={styles.searchingText} style={{ marginBottom: '2rem', color: 'var(--accent-green)' }}>
            Match Found!
          </h2>

          <div className={styles.vsContainer} style={{ width: '100%' }}>
            
            <div className={styles.playerCard}>
              <div className={`${styles.playerAvatar} ${styles.avatarSelf}`}>You</div>
              <div className={styles.playerName}>You</div>
            </div>

            <div className={styles.vsBadge}>VS</div>

            <div className={styles.playerCard}>
              <div className={`${styles.playerAvatar} ${styles.avatarOpp}`}>P2</div>
              <div className={styles.playerName}>Opponent</div>
            </div>

          </div>

          <div className={styles.matchDetails}>
            <div className={styles.prizeLabel}>Prize Pool</div>
            <div className={styles.prizePool}>
              ₹{poolOptions.find(p => p.entry === entryFee)?.win}
            </div>
            
            <div style={{ marginTop: '2rem', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
              Game starting in... <span style={{ fontSize: '2rem', color: 'white', fontWeight: 'bold' }}>{countdown}</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
