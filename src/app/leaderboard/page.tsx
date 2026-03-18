'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { ChevronLeft, Trophy, Crown } from 'lucide-react';

export default function LeaderboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('daily');

  const topPlayers = [
    { id: 1, name: 'Rahul.K', winnings: '₹14,500', initial: 'R' },
    { id: 2, name: 'Neha99', winnings: '₹12,200', initial: 'N' },
    { id: 3, name: 'Vikram_S', winnings: '₹9,800', initial: 'V' }
  ];

  const remainingPlayers = [
    { rank: 4, name: 'PriyaSharma', winnings: '₹8,450', initial: 'P' },
    { rank: 5, name: 'GamerDude', winnings: '₹7,200', initial: 'G' },
    { rank: 6, name: 'Kartik_OP', winnings: '₹6,900', initial: 'K' },
    { rank: 7, name: 'Anjali.V', winnings: '₹5,100', initial: 'A' },
    { rank: 8, name: 'RohanPlays', winnings: '₹4,300', initial: 'R' },
  ];

  return (
    <div className={styles.leaderboardContainer}>
      
      {/* Header */}
      <div className={styles.header}>
        <button onClick={() => router.push('/')} className={styles.backBtn}>
          <ChevronLeft size={24} />
        </button>
        <h2 className={styles.headerTitle}>
          <Trophy size={24} color="var(--accent-gold)" /> Leaderboard
        </h2>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <div 
          className={`${styles.tab} ${activeTab === 'daily' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('daily')}
        >
          Daily
        </div>
        <div 
          className={`${styles.tab} ${activeTab === 'weekly' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('weekly')}
        >
          Weekly
        </div>
        <div 
          className={`${styles.tab} ${activeTab === 'monthly' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('monthly')}
        >
          Monthly
        </div>
      </div>

      {/* Podium */}
      <div className={styles.podium}>
        {/* Rank 2 */}
        <div className={styles.podiumItem}>
          <div className={`${styles.avatar} ${styles.avatarTop2}`}>{topPlayers[1].initial}</div>
          <div className={styles.pilotName}>{topPlayers[1].name}</div>
          <div className={styles.pilotScore}>{topPlayers[1].winnings}</div>
          <div className={`${styles.podiumBase} ${styles.base2}`}>2</div>
        </div>

        {/* Rank 1 */}
        <div className={styles.podiumItem} style={{ zIndex: 10 }}>
          <div className={`${styles.avatar} ${styles.avatarTop1}`}>
            <Crown size={32} className={styles.crown} />
            {topPlayers[0].initial}
          </div>
          <div className={styles.pilotName} style={{ fontSize: '1.1rem', color: 'var(--accent-gold)' }}>
            {topPlayers[0].name}
          </div>
          <div className={styles.pilotScore}>{topPlayers[0].winnings}</div>
          <div className={`${styles.podiumBase} ${styles.base1}`}>1</div>
        </div>

        {/* Rank 3 */}
        <div className={styles.podiumItem}>
          <div className={`${styles.avatar} ${styles.avatarTop3}`}>{topPlayers[2].initial}</div>
          <div className={styles.pilotName}>{topPlayers[2].name}</div>
          <div className={styles.pilotScore}>{topPlayers[2].winnings}</div>
          <div className={`${styles.podiumBase} ${styles.base3}`}>3</div>
        </div>
      </div>

      {/* Remaining Ranks List */}
      <div className={styles.rankingList}>
        {remainingPlayers.map((player) => (
          <div className={styles.rankItem} key={player.rank}>
            <div className={styles.rankNumber}>#{player.rank}</div>
            <div className={styles.rankAvatar}>{player.initial}</div>
            <div className={styles.rankDetails}>
              <div className={styles.rankName}>{player.name}</div>
            </div>
            <div className={styles.rankWinnings}>{player.winnings}</div>
          </div>
        ))}
      </div>

    </div>
  );
}
