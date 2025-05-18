import React, { CSSProperties, useEffect, useState } from 'react';
import { useTheme } from './ThemeContext';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';

interface LeaderboardItemProps {
  name: string;
  workouts: number;
}

interface UserStreakData {
  id: string;
  name: string;
  streakCount: number;
}

export default function Leaderboard() {
  const { theme } = useTheme();
  const [leaderboardData, setLeaderboardData] = useState<UserStreakData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const db = getFirestore();

  useEffect(() => {
    // ... (fetchLeaderboardData remains the same)
    const fetchLeaderboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const usersCollectionRef = collection(db, 'users');
        const q = query(usersCollectionRef, orderBy('streakCount', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedData: UserStreakData[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const streakCount = typeof data.streakCount === 'number' ? data.streakCount : 0;
          fetchedData.push({
            id: doc.id,
            name: data.displayName || data.email || 'Anonymous User',
            streakCount: streakCount,
          });
        });
        setLeaderboardData(fetchedData);
      } catch (err) {
        console.error("Error fetching leaderboard data:", err);
        setError("Failed to load leaderboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboardData();
  }, [db]);

  const LeaderboardItem: React.FC<LeaderboardItemProps> = ({ name, workouts }) => {
    // JavaScript truncation for a hard limit (optional, CSS can handle it too)
    const MAX_NAME_LENGTH = 25; // Increased a bit, CSS will be primary truncator
    const displayName = name.length > MAX_NAME_LENGTH
      ? `${name.substring(0, MAX_NAME_LENGTH)}...`
      : name;

    return (
      <div style={styles.leaderboardItem}>
        <span style={styles.name} title={name}>
          {displayName} {/* Or just {name} and let CSS handle all truncation */}
        </span>
        <span style={styles.workouts}>{workouts}</span>
      </div>
    );
  };

  const styles: { [key: string]: CSSProperties } = {
    container: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.primary,
      borderRadius: 10,
      padding: 10,
      boxSizing: 'border-box',
      maxHeight: "100%",
      maxWidth: "50vw", // Re-evaluate this if content doesn't fit
      // minWidth: "320px", // Consider a minimum pixel width for the whole component
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 15,
      textAlign: 'center',
      color: theme.textPrimary,
      flexShrink: 0,
    },
    header: {
      display: 'flex',
      flexDirection: 'row',
      // justifyContent: 'space-between', // We'll let flex properties on children manage space
      alignItems: 'center',
      paddingBottom: 10,
      borderBottom: `1px solid ${theme.secondary || '#cccccc'}`,
      marginBottom: 5,
      flexShrink: 0,
      paddingLeft: 5,
      paddingRight: 5,
    },
    headerTextBase: {
      fontWeight: 'bold',
      fontSize: '10pt',
      color: theme.textPrimary,
    },
    scrollableContent: {
      flex: 1,
      overflowY: 'auto',
      overflowX: 'hidden', // Keep this hidden for now unless you want horizontal scroll
    },
    leaderboardItem: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center', // Vertically align items
      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft: 5,
      paddingRight: 5,
      borderBottom: `1px solid ${theme.textPrimary || '#eeeeee'}`,
      minHeight: '40px',
    },
    name: {
      flexGrow: 1,         // Allow name to grow and take available space
      flexShrink: 1,       // Allow name to shrink if necessary
      flexBasis: '0%',     // Start with no intrinsic width, will grow from here.
                           // This often helps make flex-shrink behave more predictably.
      minWidth: 0,         //<<<< Allow it to shrink down to almost nothing before CSS ellipsis.
                           // If you want some absolute minimum text visible, set a small value like '50px'
      textAlign: 'left',
      color: theme.textPrimary,
      paddingRight: 10,
      whiteSpace: 'nowrap',   // CRUCIAL for ellipsis
      overflow: 'hidden',     // CRUCIAL for ellipsis
      textOverflow: 'ellipsis', // This will now be the primary truncation method
      fontSize: '10pt',
    },
    workouts: {
      flexGrow: 0,          // Don't grow
      flexShrink: 0,        // Don't shrink (preserve its width)
      flexBasis: 'auto',    // Size based on content or minWidth
      minWidth: '50px',     // Ensure streak has at least this much space (e.g., for "999")
      textAlign: 'right',
      color: theme.textPrimary,
      fontSize: '10pt',
      paddingLeft: '5px',   // Add a little space so it doesn't touch the name if name is long
    },
    messageText: {
      textAlign: 'center',
      marginTop: 20,
      color: theme.textSecondary || '#666666',
    }
  };

  // Apply styles to header children explicitly



  if (isLoading) {
    return <div style={styles.container}><p style={styles.messageText}>Loading leaderboard...</p></div>;
  }
  if (error) {
    return <div style={styles.container}><p style={styles.messageText}>{error}</p></div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Leaderboard</h2>
      {/* Apply specific flex properties to header children if not inheriting perfectly */}
      <div style={styles.header}>
      <span style={{...styles.headerTextBase, ...styles.name, textAlign: 'left'}}>Name</span>
        <span style={{...styles.headerTextBase, ...styles.workouts, textAlign: 'right'}}>Streak</span>
      </div>
      <div style={styles.scrollableContent}>
        {leaderboardData.length > 0 ? (
          leaderboardData.map((item) => (
            <LeaderboardItem
              key={item.id}
              name={item.name}
              workouts={item.streakCount}
            />
          ))
        ) : (
          <p style={styles.messageText}>No leaderboard data available.</p>
        )}
      </div>
    </div>
  );
}