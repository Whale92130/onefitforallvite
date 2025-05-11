import React, { CSSProperties } from 'react'; // Import CSSProperties for type checking styles

// Assuming you have a colors definition file (e.g., src/styles/colors.ts)
// If not, replace Colors.primary etc. with actual color values.
// Make sure the path is correct relative to this file.
import { Colors } from './colors'; // Adjust the path as needed

// Interface for the props of a single leaderboard row item
interface LeaderboardItemProps {
  name: string;
  workouts: number;
  rank: number;
}

// --- Leaderboard Item Component ---
const LeaderboardItem: React.FC<LeaderboardItemProps> = ({ name, workouts, rank }) => (
  // Use div for the row container
  <div style={styles.leaderboardItem}>
    {/* Use span for text elements within the row */}
    <span style={styles.rank}>{rank}</span>
    <span style={styles.name}>{name}</span>
    <span style={styles.workouts}>{workouts}</span>
  </div>
);

// --- Leaderboard Component Props Interface ---
interface LeaderboardProps {
  // Allow leaderboardData to be potentially undefined, handle default later
  leaderboardData?: { name: string; workouts: number; }[];
}

// Default data if none is provided
const defaultLeaderboardData = [
    { name: 'Noah Sacks', workouts: 12 },
    { name: 'Alexander Sementchenko', workouts: 11 },
    { name: 'Peter Jones', workouts: 10 },
    { name: 'Alice Brown', workouts: 9 },
    { name: 'Bob White', workouts: 8 },
];

// --- Main Leaderboard Component ---
export default function Leaderboard({ leaderboardData = defaultLeaderboardData }: LeaderboardProps) {
  return (
    // Main container div
    <div style={styles.container}>
      {/* Title heading */}
      <h2 style={styles.title}>Leaderboard</h2>

      {/* Header row div */}
      <div style={styles.header}>
        {/* Use span for header text elements */}
        {/* Merge styles using object spread */}
        <span style={{ ...styles.headerTextBase, ...styles.rank }}>Rank</span>
        <span style={{ ...styles.headerTextBase, ...styles.name }}>Name</span>
        <span style={{ ...styles.headerTextBase, ...styles.workouts }}>Workouts</span>
      </div>

      {/* Scrollable area div */}
      <div style={styles.scrollableContent}>
        {/* Check if data is an array before mapping */}
        {Array.isArray(leaderboardData) && leaderboardData.length > 0 ? (
          leaderboardData.map((item, index) => (
            <LeaderboardItem key={index} name={item.name} workouts={item.workouts} rank={index + 1} />
          ))
        ) : (
          // Fallback message if no data
          <p style={styles.noDataText}>No leaderboard data available.</p>
        )}
      </div>
    </div>
  );
}

// --- Styles Definition (Inline JavaScript Object) ---
const styles: { [key: string]: CSSProperties } = {
  container: {
   height: '100%',
   display: 'flex', // Needed for flex properties below
   flexDirection: 'column',
   backgroundColor: Colors.primary,
   borderRadius: 10,
   padding: 10,
   boxSizing: 'border-box',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15, // Adjusted margin
    textAlign: 'center',
    color: Colors.textPrimary,
    flexShrink: 0, // Prevent title from shrinking
  },
  header: {
    display: 'flex', // Use flexbox for horizontal layout
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Align header text vertically
    paddingBottom: 10,
    // Combine border properties into one shorthand
    borderBottom: `1px solid ${Colors.secondary || '#cccccc'}`, // Added fallback color
    marginBottom: 5, // Space between header and first item
    flexShrink: 0, // Prevent header from shrinking
    paddingLeft: 5, // Add some padding to align with items below
    paddingRight: 5,
  },
  // Base style for header text, specific alignment/width applied by merging
  headerTextBase: {
    fontWeight: 'bold',
    fontSize: '10pt',
    color: Colors.textPrimary,
  },
  // Scrollable container for the list items
  scrollableContent: {
    flex: 1, // Allows this div to take up remaining vertical space
    overflowY: 'auto', // Enable vertical scrolling *only* when needed
    overflowX: 'hidden', // Hide horizontal scrollbar
  },
  leaderboardItem: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Vertically align items in the row
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 5, // Add consistent padding with header
    paddingRight: 5,
    // Use border shorthand, added fallback color
    borderBottom: `1px solid ${Colors.textPrimary || '#eeeeee'}`, // Assuming a lighter border color for items
    // Remove border from the very last item (cannot use :last-child with inline styles easily)
    // This would require JS logic if strictly needed with inline styles.
  },
  rank: {
    //width: 50, // Adjusted width slightly
    textAlign: 'left',
    color: Colors.textPrimary,
    flexShrink: 0, // Prevent shrinking
  },
  name: {
    flex: 1, // Allow name column to take available space
    textAlign: 'left', // Changed to left align for readability
    color: Colors.textPrimary,
    paddingLeft: 10, // Add spacing between rank and name
    paddingRight: 10, // Add spacing between name and workouts
    // Add text overflow handling if names can be long
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  workouts: {
    width: 50,
    textAlign: 'right',
    color: Colors.textPrimary,
    flexShrink: 0, // Prevent shrinking
  },
  noDataText: {
      textAlign: 'center',
      marginTop: 20,
      color: Colors.textSecondary || '#666666', // Use secondary color, add fallback
  }
};