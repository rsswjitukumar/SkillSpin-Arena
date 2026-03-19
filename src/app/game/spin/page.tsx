'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Coins, PlayCircle, Trophy, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const SLICES = [
  { label: '0x', color: '#ff4d4d', multiplier: 0 },
  { label: '0.5x', color: '#ffb84d', multiplier: 0.5 },
  { label: '1.5x', color: '#4dffff', multiplier: 1.5 },
  { label: '2x', color: '#4d4dff', multiplier: 2 },
  { label: '5x', color: '#d24dff', multiplier: 5 },
  { label: '10x', color: '#ff4dff', multiplier: 10 },
];

export default function SpinWheel() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [bet, setBet] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  
  // The accumulated degrees the wheel has rotated historically preventing snapbacks
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState<{win: number, multi: number} | null>(null);

  useEffect(() => {
    fetch('/api/user/profile').then(res => res.json()).then(data => {
      if (data.user) setBalance(data.user.walletBalance);
      else router.push('/login');
    });
  }, [router]);

  const spin = async () => {
    if (balance < bet) return toast.error('Insufficient balance to spin!');
    if (isSpinning) return;

    setIsSpinning(true);
    setShowResult(null);
    setBalance(prev => prev - bet); // Optimistic UX deduction

    try {
      const res = await fetch('/api/game/spin/play', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ betAmount: bet })
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error);
        setBalance(prev => prev + bet);
        setIsSpinning(false);
        return;
      }

      // Physics Engine: Find exact alignment lock angle + 5 intense rotations for suspense
      const currentWheelRotation = rotation % 360;
      const targetDeg = 360 - (data.multiplierIndex * 60) - 30; // 60 deg slices, offset to center
      const neededRotation = targetDeg - currentWheelRotation;
      const completeAngles = neededRotation > 0 ? neededRotation : 360 + neededRotation;
      
      const fastSpins = 360 * 5; // Spin 5 times super fast
      const nextRotationDegrees = rotation + completeAngles + fastSpins;

      setRotation(nextRotationDegrees);

      setTimeout(() => {
        setIsSpinning(false);
        setBalance(data.newBalance); // Sync real SQL balance securely
        setShowResult({ win: data.winAmount, multi: data.multiplier });
        
        if (data.multiplier > 0) {
           toast.success(`Jackpot! You won ₹${data.winAmount}!`);
        } else {
           toast.error('Ouch! Better luck next time!');
        }
      }, 3500); // Buffer matches the CSS transition delay identicaly

    } catch(e) {
      toast.error('Network Error. Connection interrupted.');
      setBalance(prev => prev + bet);
      setIsSpinning(false);
    }
  };

  const getConicGradient = () => {
    // dynamically generate pie CSS from standard slices logic explicitly
    let gradient = 'conic-gradient(';
    SLICES.forEach((slice, i) => {
      const start = i * 60;
      const end = (i + 1) * 60;
      gradient += `${slice.color} ${start}deg ${end}deg${i === SLICES.length - 1 ? '' : ', '}`;
    });
    gradient += ')';
    return gradient;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', background: 'var(--bg-dark)', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => router.push('/')} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', zIndex: 10 }}>
          <ChevronLeft size={28} />
        </button>
        <div style={{ fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles color="var(--accent-gold)" size={20} /> Spin Wheel Turbo
        </div>
        <div className="glass-panel" style={{ padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-gold)', fontWeight: 'bold' }}>
          <Coins size={16} /> ₹{balance.toFixed(2)}
        </div>
      </div>

      <div style={{ padding: '30px 20px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden' }}>
        
        {/* The Wheel Assembly */}
        <div style={{ position: 'relative', marginTop: '40px', marginBottom: '60px' }}>
          {/* External Marker Pointer Needle */}
          <div style={{
            position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)',
            width: '40px', height: '40px', background: 'white', clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
            zIndex: 10, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))'
          }} />

          {/* Glowing Outline Ring */}
          <div style={{
            width: '320px', height: '320px', borderRadius: '50%', padding: '10px',
            background: 'linear-gradient(135deg, var(--accent-gold), var(--primary-accent), var(--accent-gold))',
            boxShadow: '0 0 50px rgba(255, 184, 77, 0.4)',
            animation: isSpinning ? 'pulse 0.5s infinite alternate' : 'none'
          }}>
            {/* The Actual CSS Hardware Rendered Wheel */}
            <div style={{
              width: '100%', height: '100%', borderRadius: '50%', position: 'relative', overflow: 'hidden',
              background: getConicGradient(),
              transform: `rotate(${rotation}deg)`,
              transition: `transform ${isSpinning ? '3s cubic-bezier(0.2, 0.8, 0.2, 1)' : '0s'}`,
            }}>
              {/* Slice Labels (calculated mathematically inside the circle) */}
              {SLICES.map((slice, i) => {
                const rotationAngle = i * 60 + 30; // Center of slice
                return (
                  <div key={i} style={{
                    position: 'absolute', top: 0, left: '50%',
                    width: '60px', height: '50%',
                    transformOrigin: 'bottom center',
                    transform: `translateX(-50%) rotate(${rotationAngle}deg)`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px',
                    color: 'white', fontWeight: 'bold', fontSize: '1.2rem',
                    textShadow: '0px 2px 4px rgba(0,0,0,0.8)'
                  }}>
                    {slice.label}
                  </div>
                );
              })}
            </div>
            
            {/* Center Hub */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '60px', height: '60px', borderRadius: '50%', background: 'var(--bg-dark)',
              border: '4px solid var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)'
            }}>
              <Sparkles size={24} color="var(--accent-gold)" />
            </div>
          </div>
        </div>

        {/* Wager Selection Console */}
        <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '20px', padding: '25px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            {[10, 50, 100].map(amt => (
              <button 
                key={amt}
                onClick={() => setBet(amt)}
                disabled={isSpinning}
                className={`btn ${bet === amt ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '12px 0', fontSize: '1.1rem', opacity: isSpinning ? 0.5 : 1 }}
              >
                ₹{amt}
              </button>
            ))}
          </div>

          <button 
            onClick={spin}
            disabled={isSpinning}
            className="btn btn-primary"
            style={{ 
              padding: '20px', fontSize: '1.5rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px',
              background: isSpinning ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, var(--accent-green), #059669)',
              boxShadow: isSpinning ? 'none' : '0 10px 25px rgba(16, 185, 129, 0.4)', opacity: isSpinning ? 0.5 : 1
            }}
          >
            {isSpinning ? 'Spinning...' : 'SPIN TO WIN!'}
          </button>
        </div>

        {/* Dynamic Contextual Result Engine */}
        {showResult && (
          <div style={{ marginTop: '30px', textAlign: 'center', animation: 'fadeIn 0.5s ease-out' }}>
            {showResult.multi > 0 ? (
              <div style={{ color: 'var(--accent-green)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Trophy size={40} style={{ marginBottom: '10px' }} />
                <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', textShadow: '0 0 20px rgba(16,185,129,0.5)' }}>+₹{showResult.win.toFixed(2)}</h2>
                <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>You rolled a {showResult.multi}x Multiplier!</span>
              </div>
            ) : (
              <div style={{ color: 'var(--accent-red)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹0.00</h2>
                <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Oops! Better luck next time.</span>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
