'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Coins, Crosshair, Target as TargetIcon, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './target.module.css';

export default function TargetTap() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [bet, setBet] = useState(10);
  
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'processing' | 'result'>('setup');
  const [timeLeft, setTimeLeft] = useState(15.00);
  const [score, setScore] = useState(0);
  
  const [targetPos, setTargetPos] = useState({ top: '50%', left: '50%' });
  const [resultData, setResultData] = useState<any>(null);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    fetch('/api/user/profile').then(res => res.json()).then(data => {
      if (data.user) setBalance(data.user.walletBalance);
      else router.push('/login');
    });
  }, [router]);

  const startGame = () => {
    if (balance < bet) return toast.error('Insufficient real balance to play!');
    
    setBalance(prev => prev - bet);
    setScore(0);
    setTimeLeft(15.0);
    setGameState('playing');
    
    startTimeRef.current = Date.now();
    
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, 15.0 - elapsed);
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        endGame(15000);
      }
    }, 50); 
  };

  const endGame = async (elapsedMs: number) => {
    clearInterval(timerRef.current);
    setGameState('processing');

    try {
      const res = await fetch('/api/game/target/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ betAmount: bet, score, timeElapsedMs: elapsedMs })
      });
      const data = await res.json();
      
      if (!data.success) {
        toast.error(data.error);
        setBalance(prev => prev + bet);
        setGameState('setup');
        return;
      }
      
      setBalance(data.newBalance);
      setResultData(data);
      setGameState('result');
      
      if (data.isBot) {
        toast.error("Auto-clicker macro detected! Score rejected automatically.");
      } else if (data.winAmount > 0) {
        toast.success(`Amazing! You secured ₹${data.winAmount}!`);
      } else {
        toast.error("You need at least 31 taps to break even.");
      }

    } catch(e) {
      toast.error('Network Error. Reverting.');
      setGameState('setup');
    }
  };

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    if (gameState !== 'playing') return;
    e.preventDefault(); 
    e.stopPropagation(); 
    setScore(prev => prev + 1);
    moveTarget();
  };

  const moveTarget = () => {
    if (!gameAreaRef.current) return;
    const padding = 50; 
    const width = Math.max(100, gameAreaRef.current.clientWidth - padding * 2);
    const height = Math.max(100, gameAreaRef.current.clientHeight - padding * 2);
    const randomX = Math.floor(Math.random() * width) + padding;
    const randomY = Math.floor(Math.random() * height) + padding;
    setTargetPos({ top: `${randomY}px`, left: `${randomX}px` });
  };

  useEffect(() => {
    if (gameState === 'playing') {
      const timer = setTimeout(() => {
        moveTarget();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  return (
    <div className={styles.container}>
      {/* Universal Safe Header */}
      <div className={styles.header}>
        <button onClick={() => router.push('/')} className={styles.backBtn} aria-label="Go Back">
          <ChevronLeft size={24} />
        </button>
        <div className={styles.title}>Target Tap</div>
        <div className={styles.balanceBadge}>
          <Coins size={16} color="white" /> ₹{balance.toFixed(2)}
        </div>
      </div>

      <div className={styles.gameArea}>
        {/* GAME SETUP HUD */}
        {gameState === 'setup' && (
          <div className={styles.setupHud}>
            <div className={styles.crosshairWrapper}>
              <div className={styles.pulseRing} />
              <Crosshair size={90} color="#f87171" style={{ filter: 'drop-shadow(0 0 25px rgba(239,68,68,0.8))' }} />
            </div>
            
            <h1 className={styles.heroTitle}>
               FASTEST <span>FINGERS</span> WIN
            </h1>
            <p className={styles.description}>
              Tap the moving target as fast as possible in 15 seconds. <strong style={{color: 'white'}}>60+ taps</strong> doubles your cash!
            </p>
            
            <div className={styles.betSelector}>
               {[10, 50, 100].map(amt => (
                <button 
                  key={amt}
                  onClick={() => setBet(amt)}
                  className={`${styles.betBtn} ${bet === amt ? styles.betBtnActive : ''}`}
                >
                  ₹{amt}
                </button>
               ))}
            </div>

            <button onClick={startGame} className={styles.playBtn}>
              Play Now
            </button>
          </div>
        )}

        {/* ACTIVE PLAY ARENA */}
        {gameState === 'playing' && (
          <div className={styles.activeArena}>
            <div className={styles.radarAnim} />
            <div className={styles.arenaOverlay} />

            {/* Live Dashboard metrics */}
            <div className={styles.statsHud}>
               <div className={styles.statItem}>
                 <span className={styles.statLabel}>TIME LEFT</span>
                 <span className={styles.statValue} style={{ color: timeLeft <= 5 ? '#f87171' : 'white', textShadow: timeLeft <= 5 ? '0 0 20px rgba(248,113,113,0.8)' : 'none' }}>
                   {timeLeft.toFixed(2)}<span style={{fontSize: '1rem'}}>s</span>
                 </span>
               </div>
               <div className={`${styles.statItem} items-end`}>
                 <span className={styles.statLabel}>SCORE</span>
                 <span className={styles.scoreValue}>{score}</span>
               </div>
            </div>

            {/* Target Touch Surface Grid */}
            <div ref={gameAreaRef} className={styles.touchSurface}>
               <button
                 onMouseDown={handleTap}
                 onTouchStart={handleTap}
                 className={styles.target}
                 style={{ top: targetPos.top, left: targetPos.left }}
                 aria-label="Tap target"
               >
                 <div className={styles.targetInner} />
                 <TargetIcon size={45} color="white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
               </button>
            </div>
          </div>
        )}

        {/* PROCESSING & RESULTS UI */}
        {(gameState === 'processing' || gameState === 'result') && (
          <div className={styles.resultHud}>
            {gameState === 'processing' ? (
              <div className={styles.processing}>
                <div className={styles.loader} />
                <h2 style={{ marginTop: '25px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '1px' }}>Verifying Taps...</h2>
              </div>
            ) : (
              <div className={styles.resultCard}>
                <div style={{ marginBottom: '20px', position: 'relative' }}>
                  <Crosshair size={90} color={resultData?.winAmount > 0 ? "#10b981" : "#ef4444"} style={{ filter: `drop-shadow(0 0 20px ${resultData?.winAmount > 0 ? '#10b981' : '#ef4444'})` }} />
                  {resultData?.winAmount > 0 && <Zap size={35} color="#fbbf24" style={{ position: 'absolute', top: '-5px', right: '-15px', animation: 'pulse-ring 2s infinite' }} />}
                </div>

                <h1 className={styles.resultTitle} style={{ color: resultData?.winAmount > 0 ? '#34d399' : '#f87171' }}>
                  {resultData?.isBot ? 'REJECTED' : resultData?.score}
                </h1>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 800, letterSpacing: '2px', marginBottom: '20px' }}>TOTAL TAPS</div>

                {resultData?.isBot ? (
                   <div style={{ color: '#f87171', textAlign: 'center', background: 'rgba(239,68,68,0.1)', padding: '15px', borderRadius: '12px' }}>Autoclicker detected. Voided.</div>
                ) : (
                  <>
                    <div className={styles.multiplierBadge}>
                      <h2 style={{ fontSize: '1.2rem', color: 'white', margin: 0 }}>{resultData?.multiplier}x Multiplier</h2>
                    </div>
                    <h3 className={styles.winAmount} style={{ color: resultData?.winAmount > 0 ? '#fbbf24' : 'rgba(255,255,255,0.4)', textShadow: resultData?.winAmount > 0 ? '0 0 20px rgba(251,191,36,0.5)' : 'none' }}>
                      {resultData?.winAmount > 0 ? `+ ₹${resultData?.winAmount.toFixed(2)}` : 'You Lost.'}
                    </h3>
                  </>
                )}

                <div className={styles.actionBtns}>
                  <button onClick={() => router.push('/')} className={styles.dashboardBtn}>Dashboard</button>
                  <button onClick={() => setGameState('setup')} className={styles.playAgainBtn}>Play Again</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
