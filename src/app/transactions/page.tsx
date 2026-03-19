'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Receipt, ArrowUpRight, ArrowDownLeft, Clock, History } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch('/api/user/transactions');
        if (res.ok) {
          const data = await res.json();
          setTransactions(data.transactions);
        } else {
          router.push('/login');
        }
      } catch (e) {
        toast.error('Failed to load transaction history');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, [router]);

  const getTransactionStyles = (type: string) => {
    if (type.includes('DEPOSIT') || type.includes('WIN') || type.includes('BONUS')) {
      return { color: 'var(--accent-green)', icon: <ArrowDownLeft size={20} color="var(--accent-green)" />, sign: '+' };
    }
    if (type.includes('WITHDRAWAL') || type.includes('LOSS') || type.includes('MATCH_FEE')) {
      return { color: 'var(--accent-red)', icon: <ArrowUpRight size={20} color="var(--accent-red)" />, sign: '-' };
    }
    return { color: 'var(--text-secondary)', icon: <Receipt size={20} color="var(--text-secondary)" />, sign: '' };
  };

  const formatType = (type: string) => {
    return type.replace(/_/g, ' ');
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-accent)' }}>Loading History...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', background: 'var(--bg-dark)', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, background: 'rgba(15, 16, 22, 0.95)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
        <button onClick={() => router.back()} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex' }}>
          <ChevronLeft size={28} />
        </button>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={20} color="var(--primary-accent)" /> Transaction History
        </h1>
      </div>

      <div style={{ padding: '20px', flex: 1 }}>
        {transactions.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: '100px', opacity: 0.5 }}>
            <Receipt size={60} style={{ marginBottom: '15px' }} />
            <h2 style={{ fontSize: '1.2rem' }}>No Transactions Yet</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Your recent activity will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {transactions.map((tx) => {
              const { color, icon, sign } = getTransactionStyles(tx.type);
              return (
                <div key={tx.id} className="glass-panel" style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {icon}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{formatType(tx.type)}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {formatDate(tx.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={{ fontWeight: '900', fontSize: '1.1rem', color }}>
                      {sign}₹{tx.amount.toFixed(2)}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: tx.status === 'SUCCESS' ? 'var(--accent-green)' : (tx.status === 'FAILED' ? 'var(--accent-red)' : 'var(--accent-gold)'), background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
