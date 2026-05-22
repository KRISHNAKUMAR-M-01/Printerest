import React, { useState, useEffect } from 'react';
import PinCard from './PinCard';

const MasonryGrid = ({ posts, savedPostIds = [], onToggleSave }) => {
  const [columnsCount, setColumnsCount] = useState(5);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 600) {
        setColumnsCount(2);
      } else if (width < 900) {
        setColumnsCount(3);
      } else if (width < 1200) {
        setColumnsCount(4);
      } else if (width < 1600) {
        setColumnsCount(5);
      } else {
        setColumnsCount(6);
      }
    };

    // Set initial size
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Distribute items into columns
  const getColumns = () => {
    const cols = Array.from({ length: columnsCount }, () => []);
    posts.forEach((post, index) => {
      cols[index % columnsCount].push(post);
    });
    return cols;
  };

  const columns = getColumns();

  if (!posts || posts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-light)' }}>
        <h2>No ideas found</h2>
        <p>Try searching for something else or upload your own pin!</p>
      </div>
    );
  }

  return (
    <div style={styles.gridContainer}>
      {columns.map((column, colIdx) => (
        <div key={colIdx} style={styles.gridColumn}>
          {column.map((post) => (
            <PinCard
              key={post.id}
              post={post}
              initialSaved={savedPostIds.includes(post.id)}
              onToggleSave={onToggleSave}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

const styles = {
  gridContainer: {
    display: 'flex',
    gap: '16px',
    padding: '0 24px',
    maxWidth: '1800px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box'
  },
  gridColumn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  }
};

export default MasonryGrid;
