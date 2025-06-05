import React from 'react';
import styles from './SkeletonLoader.module.css';

// Basic skeleton component
export const Skeleton = ({ 
  width = "100%", 
  height = "20px", 
  borderRadius = "4px",
  className = "",
  style = {}
}) => (
  <div 
    className={`${styles.skeleton} ${className}`}
    style={{
      width,
      height,
      borderRadius,
      ...style
    }}
  />
);

// Text skeleton with multiple lines
export const TextSkeleton = ({ lines = 1, className = "" }) => (
  <div className={`${styles.textSkeleton} ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton 
        key={index}
        width={index === lines - 1 ? "75%" : "100%"}
        height="16px"
        style={{ marginBottom: index < lines - 1 ? "8px" : "0" }}
      />
    ))}
  </div>
);

// Card skeleton
export const CardSkeleton = ({ className = "" }) => (
  <div className={`${styles.cardSkeleton} ${className}`}>
    <div className={styles.cardHeader}>
      <Skeleton width="40px" height="40px" borderRadius="50%" />
      <div className={styles.cardHeaderText}>
        <Skeleton width="120px" height="16px" />
        <Skeleton width="80px" height="14px" style={{ marginTop: "4px" }} />
      </div>
    </div>
    <div className={styles.cardContent}>
      <TextSkeleton lines={3} />
    </div>
  </div>
);

// Stats skeleton
export const StatsSkeleton = ({ className = "" }) => (
  <div className={`${styles.statsSkeleton} ${className}`}>
    <div className={styles.statsGrid}>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className={styles.statCard}>
          <Skeleton width="48px" height="48px" borderRadius="12px" />
          <div className={styles.statContent}>
            <Skeleton width="80px" height="14px" />
            <Skeleton width="100px" height="20px" style={{ marginTop: "8px" }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Header skeleton
export const HeaderSkeleton = ({ className = "" }) => (
  <div className={`${styles.headerSkeleton} ${className}`}>
    <div className={styles.headerMain}>
      <Skeleton width="200px" height="32px" />
      <Skeleton width="150px" height="16px" style={{ marginTop: "8px" }} />
    </div>
    <div className={styles.headerStats}>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className={styles.headerStat}>
          <Skeleton width="60px" height="12px" />
          <Skeleton width="80px" height="16px" style={{ marginTop: "4px" }} />
        </div>
      ))}
    </div>
  </div>
);

// Button skeleton
export const ButtonSkeleton = ({ 
  width = "120px", 
  height = "40px",
  className = "" 
}) => (
  <Skeleton 
    width={width} 
    height={height} 
    borderRadius="8px"
    className={`${styles.buttonSkeleton} ${className}`}
  />
);

// Table skeleton
export const TableSkeleton = ({ rows = 5, columns = 4, className = "" }) => (
  <div className={`${styles.tableSkeleton} ${className}`}>
    <div className={styles.tableHeader}>
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={index} width="100px" height="16px" />
      ))}
    </div>
    <div className={styles.tableBody}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className={styles.tableRow}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} width="80px" height="14px" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

// List skeleton
export const ListSkeleton = ({ items = 5, className = "" }) => (
  <div className={`${styles.listSkeleton} ${className}`}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className={styles.listItem}>
        <Skeleton width="40px" height="40px" borderRadius="50%" />
        <div className={styles.listContent}>
          <Skeleton width="150px" height="16px" />
          <Skeleton width="100px" height="14px" style={{ marginTop: "4px" }} />
        </div>
        <Skeleton width="60px" height="14px" />
      </div>
    ))}
  </div>
);

export default Skeleton;
