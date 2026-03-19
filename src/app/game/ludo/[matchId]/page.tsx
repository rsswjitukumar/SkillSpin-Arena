'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, Dices, Trophy, CircleUser, MoveRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LudoEngine() {
  const router = useRouter();
  const params = useParams();
  const matchId = params.matchId as string;

  const [user, setUser] = useState<any>(null);
  const [match, setMatch] = useState<any>(null);
  const [gameState, setGameState] = useState<any>(null);

  useEffect(() => {
    fetch('/api/user/profile').then(res => res.json()).then(data => {
      if(data.user) setUser(data.user);
    });
  }, []);

  const fetchState = async () => {
    if (!matchId) return;
    try {
      const res = await fetch('/api/game/ludo/state', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId })
      });
      const data = await res.json();
      if(data.success) {
        setMatch(data.match);
        setGameState(data.gameState);
      }
    } catch(e) {}
  };

  useEffect(() => {
    if (!matchId) return;
    fetchState();
    const interval = setInterval(fetchState, 1500);
    return () => clearInterval(interval);
  }, [matchId]);

  const handleAction = async (action: string, tokenIndex?: number) => {
    try {
      const res = await fetch('/api/game/ludo/action', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, action, tokenIndex })
      });
      const data = await res.json();
      if(data.success) {
        setMatch(data.match);
        setGameState(data.gameState);
      } else {
        toast.error(data.error);
      }
    } catch(e) {
      toast.error("Network Error");
    }
  };

  if(!user || !match || !gameState) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-accent)' }}>
        Loading Ludo Engine...
      </div>
    );
  }

  const isPlayer1 = match.player1Id === user.id;
  const opponentData = isPlayer1 ? match.player2 : match.player1;
  const myData = isPlayer1 ? match.player1 : match.player2;

  const myScore = isPlayer1 ? gameState.player1Score : gameState.player2Score;
  const oppScore = isPlayer1 ? gameState.player2Score : gameState.player1Score;
  const myTokens = isPlayer1 ? gameState.player1Tokens : gameState.player2Tokens;
  const oppTokens = isPlayer1 ? gameState.player2Tokens : gameState.player1Tokens;
  
  const isMyTurn = gameState.currentTurn === user.id;

  if(match.status === 'FINISHED') {
    const isWinner = gameState.winnerId === user.id;
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at center, rgba(15, 16, 22, 1) 0%, rgba(0,0,0,1) 100%)', color: 'white' }}>
        <Trophy size={100} color={isWinner ? 'var(--accent-gold)' : 'var(--text-secondary)'} style={{ filter: `drop-shadow(0 0 20px ${isWinner ? 'var(--accent-gold)' : 'transparent'})` }} />
        <h1 style={{ fontSize: '3rem', margin: '20px 0', color: isWinner ? 'var(--accent-green)' : 'var(--accent-red)' }}>{isWinner ? 'VICTORY' : 'DEFEAT'}</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '1.2rem' }}>Final Score: {myScore} - {oppScore}</p>
        <button className="btn btn-primary" onClick={() => router.push('/')} style={{ padding: '15px 40px', fontSize: '1.2rem' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', background: 'var(--bg-dark)', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => router.push('/')} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
          <ChevronLeft size={28} />
        </button>
        <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Target: 50 Pts</div>
        <div style={{ color: 'var(--primary-accent)', fontWeight: 'bold' }}>₹{match.entryFee * 1.8} Prize</div>
      </div>

      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        
        {/* Opponent Zone */}
        <div className="glass-panel" style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px', border: !isMyTurn ? '2px solid var(--accent-red)' : '1px solid rgba(255,255,255,0.05)', opacity: !isMyTurn ? 1 : 0.6, transition: 'all 0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CircleUser color="var(--accent-red)" size={30} />
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{opponentData?.username}</div>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{oppScore} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>pts</span></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {oppTokens.map((pos: number, i: number) => (
              <div key={i} style={{ background: 'rgba(0,0,0,0.5)', height: '40px', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                <div style={{ width: `${(pos / 57) * 100}%`, height: '100%', background: 'linear-gradient(90deg, transparent, var(--accent-red))', transition: 'width 0.5s' }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.8rem', fontWeight: 'bold' }}>{pos}/57</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Center */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '30px 0' }}>
          <div style={{ fontSize: '1.1rem', marginBottom: '15px', color: 'var(--text-secondary)' }}>{gameState.message}</div>
          
          <button 
            onClick={() => handleAction('ROLL')}
            disabled={!isMyTurn || gameState.diceValue !== null}
            className={`btn ${isMyTurn && gameState.diceValue === null ? 'btn-primary' : ''}`}
            style={{ 
              width: '120px', height: '120px', borderRadius: '25%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
              background: isMyTurn && gameState.diceValue === null ? 'linear-gradient(135deg, #7928ca, #ff0080)' : 'rgba(255,255,255,0.1)',
              boxShadow: isMyTurn && gameState.diceValue === null ? '0 0 30px rgba(255,0,128,0.5)' : 'none',
              transform: isMyTurn && gameState.diceValue === null ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.3s',
              border: '2px solid rgba(255,255,255,0.2)'
            }}
          >
            {gameState.diceValue ? (
              <span style={{ fontSize: '4rem', fontWeight: 'bold' }}>{gameState.diceValue}</span>
            ) : (
              <Dices size={50} color={isMyTurn ? "white" : "rgba(255,255,255,0.3)"} />
            )}
          </button>
        </div>

        {/* My Zone */}
        <div className="glass-panel" style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px', border: isMyTurn ? '2px solid var(--accent-green)' : '1px solid rgba(255,255,255,0.05)', opacity: isMyTurn ? 1 : 0.6, transition: 'all 0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CircleUser color="var(--accent-green)" size={30} />
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>You ({myData?.username})</div>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{myScore} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>pts</span></div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {myTokens.map((pos: number, i: number) => (
              <button 
                key={i} 
                onClick={() => handleAction('MOVE', i)}
                disabled={!isMyTurn || gameState.diceValue === null || pos >= 57}
                style={{ 
                  background: 'rgba(0,0,0,0.5)', height: '50px', borderRadius: '8px', overflow: 'hidden', position: 'relative', cursor: isMyTurn && gameState.diceValue !== null && pos < 57 ? 'pointer' : 'default',
                  border: isMyTurn && gameState.diceValue !== null && pos < 57 ? '2px solid var(--accent-green)' : 'none'
                }}
              >
                <div style={{ width: `${(pos / 57) * 100}%`, height: '100%', background: 'linear-gradient(90deg, transparent, var(--accent-green))', transition: 'width 0.5s' }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontWeight: 'bold' }}>{pos}/57</span>
                  {isMyTurn && gameState.diceValue !== null && pos < 57 && <MoveRight size={14} color="white" />}
                </div>
              </button>
            ))}
          </div>
          {isMyTurn && gameState.diceValue !== null && (
            <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--accent-green)' }}>Tap a token above to move it {gameState.diceValue} steps!</div>
          )}
        </div>

      </div>
    </div>
  );
}
