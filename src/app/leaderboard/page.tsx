'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Trophy, UserCircle, Home as HomeIcon, Gift, 
  Crown
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LeaderboardPage() {
  const router = useRouter();
  const [leaders, setLeaders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/leaderboard');
        if (res.ok) {
          const data = await res.json();
          setLeaders(data.leaderboard);
        }
      } catch (e) {
        toast.error('Failed to load leaderboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (isLoading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)' }}>Loading Champions...</div>;
  }

  const top3 = leaders.slice(0, 3);
  const remainingList = leaders.slice(3);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 0px', paddingBottom: '90px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ padding: '1.5rem 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)' }}>
          <Trophy size={24} /> Global Leaderboard
        </h2>
      </div>

      {/* Top 3 Podium Section */}
      <div style={{ padding: '60px 20px', background: 'radial-gradient(circle at top, rgba(251, 191, 36, 0.1) 0%, transparent 60%)', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '15px' }}>
        
        {/* RANK 2 - SILVER */}
        {top3[1] && (
          <div className="glass-panel" style={{ width: '100px', padding: '15px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'linear-gradient(to top, rgba(160, 174, 192, 0.2), transparent)', borderColor: '#a0aec0', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-15px', background: '#a0aec0', color: '#000', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#a0aec0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
              <UserCircle size={24} color="#000" />
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>@{top3[1].username}</div>
            <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>₹{top3[1].totalWinnings.toFixed(0)}</div>
          </div>
        )}

        {/* RANK 1 - GOLD */}
        {top3[0] && (
          <div className="glass-panel" style={{ width: '120px', padding: '20px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'linear-gradient(to top, rgba(251, 191, 36, 0.3), transparent)', borderColor: '#fbbf24', position: 'relative', transform: 'translateY(-20px)', zIndex: 10, boxShadow: '0 0 20px rgba(251,191,36,0.2)' }}>
            <div style={{ position: 'absolute', top: '-20px', color: '#fbbf24', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Crown size={32} />
            </div>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', marginTop: '15px' }}>
              <UserCircle size={30} color="#000" />
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fbbf24', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>@{top3[0].username}</div>
            <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>₹{top3[0].totalWinnings.toFixed(0)}</div>
          </div>
        )}

        {/* RANK 3 - BRONZE */}
        {top3[2] && (
          <div className="glass-panel" style={{ width: '100px', padding: '15px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'linear-gradient(to top, rgba(184, 115, 51, 0.2), transparent)', borderColor: '#b87333', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-15px', background: '#b87333', color: '#000', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>3</div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#b87333', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
              <UserCircle size={24} color="#000" />
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>@{top3[2].username}</div>
            <div style={{ fontSize: '0.8rem', color: '#b87333' }}>₹{top3[2].totalWinnings.toFixed(0)}</div>
          </div>
        )}
      </div>

      {/* Rest of the List */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {remainingList.map((player, index) => (
          <div key={player.id} className="glass-panel" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '30px', fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>#{index + 4}</div>
              <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'var(--background-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserCircle size={20} color="var(--primary-accent)" />
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>@{player.username}</div>
            </div>
            <div style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>₹{player.totalWinnings.toFixed(0)}</div>
          </div>
        ))}
        {remainingList.length === 0 && leaders.length <= 3 && (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
            No more champions to display.
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', display: 'flex', justifyContent: 'space-around', background: 'rgba(15, 16, 22, 0.95)', backdropFilter: 'blur(15px)', padding: '12px 0', borderTop: '1px solid rgba(255, 255, 255, 0.05)', zIndex: 100 }}>
        <Link href="/" passHref style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
            <HomeIcon size={24} style={{ filter: 'grayscale(1)', opacity: 0.6 }} />
            <span>Home</span>
          </div>
        </Link>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--accent-gold)', fontSize: '0.75rem', fontWeight: 600 }}>
          <Trophy size={24} style={{ filter: 'grayscale(0)', opacity: 1, transform: 'translateY(-2px)' }} />
          <span>Contests</span>
        </div>
        <Link href="/refer" passHref style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
            <Gift size={24} style={{ filter: 'grayscale(1)', opacity: 0.6 }} />
            <span>Refer</span>
          </div>
        </Link>
        <Link href="/profile" passHref style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
            <UserCircle size={24} style={{ filter: 'grayscale(1)', opacity: 0.6 }} />
            <span>Profile</span>
          </div>
        </Link>
      </nav>
    </div>
  );
}
