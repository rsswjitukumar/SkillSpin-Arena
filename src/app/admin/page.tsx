'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Users, LayoutDashboard, History, Settings, LogOut, Swords, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        } else {
           // Middleware catches unauthorized, but just in case
           router.push('/');
        }
      } catch (err) {
        toast.error('Failed to load admin parameters');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [router]);

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff0080', background: '#0f1016' }}>Authorizing Admin...</div>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0f', color: '#ffffff' }}>
      
      {/* Sidebar */}
      <div style={{ width: '250px', background: '#13141c', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#ff0080', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={24} /> Admin Hub
          </h2>
        </div>

        <nav style={{ padding: '24px 12px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <div style={{ padding: '12px 16px', background: 'rgba(255,0,128,0.1)', borderRadius: '8px', color: '#ff0080', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 'bold' }}>
            <LayoutDashboard size={20} /> Dashboard Overview
          </div>
          <div style={{ padding: '12px 16px', color: '#9da3b9', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <Users size={20} /> Manage Users
          </div>
          <div style={{ padding: '12px 16px', color: '#9da3b9', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <History size={20} /> Transaction Logs
          </div>
          <div style={{ padding: '12px 16px', color: '#9da3b9', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <Swords size={20} /> Match History
          </div>
          <div style={{ padding: '12px 16px', color: '#9da3b9', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <Settings size={20} /> Settings
          </div>
        </nav>

        <div style={{ padding: '24px 12px' }}>
          <Link href="/" passHref style={{ textDecoration: 'none' }}>
            <div style={{ padding: '12px 16px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px' }}>
              <LogOut size={20} /> Exit Admin
            </div>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <h1 style={{ fontSize: '2rem', margin: 0 }}>Platform Overview</h1>
        <p style={{ color: '#9da3b9', marginBottom: '32px' }}>Welcome back, Super Admin. Here is the latest system data.</p>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ color: '#9da3b9', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Total Platform Wealth</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fbbf24' }}>₹{stats?.totalWealth?.toFixed(2) || 0}</div>
              </div>
              <div style={{ background: 'rgba(251, 191, 36, 0.1)', padding: '12px', borderRadius: '12px' }}>
                <Wallet color="#fbbf24" size={24} />
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ color: '#9da3b9', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Registered Players</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{stats?.totalUsers || 0}</div>
              </div>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '12px' }}>
                <Users color="#3b82f6" size={24} />
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ color: '#9da3b9', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Active Ludo Matches</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{stats?.activeMatches || 0}</div>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px' }}>
                <Swords color="#10b981" size={24} />
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ color: '#9da3b9', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Successful Deposits</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#a855f7' }}>{stats?.totalDeposits || 0}</div>
              </div>
              <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '12px', borderRadius: '12px' }}>
                <History color="#a855f7" size={24} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
