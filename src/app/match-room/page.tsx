'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { ChevronLeft, Coins, Gamepad2, Search, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MatchRoom() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [entryFee, setEntryFee] = useState(10);
  
  // 'setup' | 'searching' | 'found'
  const [matchState, setMatchState] = useState<'setup' | 'searching' | 'found'>('setup');
  const [countdown, setCountdown] = useState(3);
  const [activeMatch, setActiveMatch] = useState<any>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const poolOptions = [
    { entry: 10, win: 18 },
    { entry: 25, win: 45 },
    { entry: 50, win: 90 },
    { entry: 100, win: 180 },
  ];

  // 1. Fetch secure balance
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setBalance(data.user.walletBalance);
        } else {
          router.push('/login');
        }
      } catch (e) {
        toast.error('Failed to load profile');
      }
    };
    fetchProfile();
  }, [router]);

  // 2. Handle Joining Match
  const handleFindMatch = async () => {
    if (balance < entryFee) return toast.error("Insufficient Wallet Balance! Please add cash.");
    
    setMatchState('searching');
    try {
      const res = await fetch('/api/matchmaking/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryFee })
      });
      const data = await res.json();
      
      if (!data.success) {
        toast.error(data.error || 'Failed to find match');
        setMatchState('setup');
        return;
      }

      setActiveMatch(data.match);
      setBalance(prev => prev - entryFee); // Optimistic UI deduct

      if (data.match.status === 'PLAYING') {
        // Found an opponent instantly
        setMatchState('found');
      } else {
        // Waiting for opponent - Start polling
        startPolling(data.match.id);
      }
    } catch (err) {
      toast.error('Network Error');
      setMatchState('setup');
    }
  };

  // 3. Polling Logic
  const startPolling = (matchId: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/matchmaking/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ matchId })
        });
        const data = await res.json();
        
        if (data.success && data.match.status === 'PLAYING') {
          setActiveMatch(data.match);
          setMatchState('found');
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        }
      } catch (e) {
        console.error("Polling error");
      }
    }, 2000); // Poll every 2 seconds
  };

  // 4. Cancel Search
  const handleCancelSearch = async () => {
    if (!activeMatch) {
      setMatchState('setup');
      return;
    }
    
    try {
      const res = await fetch('/api/matchmaking/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: activeMatch.id })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Search cancelled, entry fee refunded.');
        setBalance(prev => prev + activeMatch.entryFee); // Refund locally
        setMatchState('setup');
        setActiveMatch(null);
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      } else {
        toast.error(data.error || 'Cannot cancel match');
      }
    } catch (e) {
      toast.error('Network error');
    }
  };

  // 5. Found Countdown
  useEffect(() => {
    let startTimer: NodeJS.Timeout;

    if (matchState === 'found') {
      startTimer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(startTimer);
            toast.success("Game starts now! (Redirecting to Engine...)");
            if (activeMatch?.id) {
              router.push(`/game/ludo/${activeMatch.id}`);
            } else {
              router.push('/');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(startTimer);
  }, [matchState, router]);

  // Clean up
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const amIPlayer1 = activeMatch?.player1Id === user?.id;

  return (
    <div className={styles.matchContainer}>
      <div className={styles.header}>
        <button 
          onClick={() => {
            if (matchState === 'setup') router.push('/');
            else if (matchState === 'searching') handleCancelSearch();
          }} 
          className={styles.backBtn}
        >
          <ChevronLeft size={24} />
        </button>
        <div className={styles.headerTitle}>Skill Ludo 1v1</div>
        <div className={styles.walletBadge}>
          <Coins size={16} /> ₹{balance.toFixed(2)}
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
          <p className={styles.searchingSub}>Searching for players matching your entry fee of ₹{entryFee}</p>
          <button 
            className={`btn btn-outline ${styles.cancelBtn}`}
            onClick={handleCancelSearch}
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
              <div className={styles.playerName}>{user?.username || 'You'}</div>
            </div>

            <div className={styles.vsBadge}>VS</div>

            <div className={styles.playerCard}>
              <div className={`${styles.playerAvatar} ${styles.avatarOpp}`}>P2</div>
              <div className={styles.playerName}>
                {!amIPlayer1 ? activeMatch?.player1?.username : activeMatch?.player2?.username || 'Opponent'}
              </div>
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
