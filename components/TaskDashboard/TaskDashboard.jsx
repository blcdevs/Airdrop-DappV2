import React, { useState, useEffect } from "react";
import { useWeb3 } from "../../context/Web3Context";
import styles from "./TaskDashboard.module.css";
import { ethers } from "ethers";
import { useNotification } from "../../context/NotificationContext";
import {
  Skeleton,
  HeaderSkeleton,
  CardSkeleton,
  ButtonSkeleton
} from "../SkeletonLoader/SkeletonLoader";

// Configuration constants
const TASK_COMPLETION_DELAY = 2 * 60; // 2 minutes in seconds
const STORAGE_KEY = 'taskTimers';

// Task type to icon mapping
const TASK_ICONS = {
  0: { icon: "fab fa-youtube", name: "YouTube", color: "#FF0000" }, // YouTube
  1: { icon: "fab fa-telegram", name: "Telegram", color: "#0088cc" }, // Telegram
  2: { icon: "fab fa-twitter", name: "Twitter", color: "#1DA1F2" }, // Twitter
  3: { icon: "fas fa-globe", name: "Website", color: "#4CAF50" }, // Website
  4: { icon: "fab fa-facebook-f", name: "Facebook", color: "#4267B2" }, // Facebook
  5: { icon: "fab fa-discord", name: "Discord", color: "#7289DA" }, // Discord
  6: { icon: "fab fa-medium", name: "Medium", color: "#00ab6c" }, // Medium
};

const TaskDashboard = ({ userPoints, onPointsUpdate }) => {
  const { contract, account, getAllTasks, getPoints } = useWeb3();
  const [tasks, setTasks] = useState([]);
  const [userTaskStatuses, setUserTaskStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [tasksByType, setTasksByType] = useState({});
  const [visibleTaskTypes, setVisibleTaskTypes] = useState([]);
  const [localUserPoints, setLocalUserPoints] = useState(userPoints);
  const [taskTimers, setTaskTimers] = useState(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Only load timers that haven't expired
        const currentTime = Date.now() / 1000;
        const validTimers = {};
        Object.entries(parsed).forEach(([taskId, startTime]) => {
          if (currentTime - startTime < TASK_COMPLETION_DELAY) {
            validTimers[taskId] = startTime;
          }
        });
        return validTimers;
      }
    }
    return {};
  });
  const [countdowns, setCountdowns] = useState({});
  const { showNotification } = useNotification();

  // Initialize localUserPoints with the userPoints prop
  useEffect(() => {
    setLocalUserPoints(userPoints);
  }, [userPoints]);

  // Load tasks
  useEffect(() => {
    const loadTasks = async () => {
      if (contract) {
        try {
          const allTasks = await getAllTasks();
          console.log("Fetched tasks:", allTasks);
          setTasks(allTasks);
          
          // Organize tasks by type
          const tasksByTypeMap = {};
          const taskTypes = new Set();
          
          allTasks.forEach(task => {
            const type = Number(task.taskType);
            if (!tasksByTypeMap[type]) {
              tasksByTypeMap[type] = [];
            }
            tasksByTypeMap[type].push(task);
            taskTypes.add(type);
          });
          
          setTasksByType(tasksByTypeMap);
          setVisibleTaskTypes(Array.from(taskTypes));
        } catch (error) {
          console.error("Error loading tasks:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadTasks();
  }, [contract, getAllTasks]);

  // Load task statuses
  useEffect(() => {
    const loadTaskStatuses = async () => {
      if (contract && account && tasks.length > 0) {
        try {
          const statuses = {};
          for (const task of tasks) {
            const [isCompleted, completedAt] = await contract.getUserTaskStatus(account, task.id);
            statuses[task.id] = { isCompleted, completedAt: Number(completedAt) };
          }
          setUserTaskStatuses(statuses);
        } catch (error) {
          console.error("Error loading task statuses:", error);
        }
      }
    };

    loadTaskStatuses();
  }, [tasks, account, contract]);

  // Persist timers to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(taskTimers));
    }
  }, [taskTimers]);

  // Countdown timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Date.now() / 1000;
      const newCountdowns = {};
      
      Object.entries(taskTimers).forEach(([taskId, startTime]) => {
        const elapsed = currentTime - startTime;
        const remaining = TASK_COMPLETION_DELAY - elapsed;
        
        if (remaining > 0) {
          const minutes = Math.floor(remaining / 60);
          const seconds = Math.floor(remaining % 60);
          newCountdowns[taskId] = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
      });
      
      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [taskTimers]);

  const startTaskTimer = (taskId) => {
    const startTime = Date.now() / 1000;
    setTaskTimers(prev => ({
      ...prev,
      [taskId]: startTime
    }));
  };

  const getTaskStatus = (taskId) => {
    const startTime = taskTimers[taskId];
    if (!startTime) return "START";

    const currentTime = Date.now() / 1000;
    const timeElapsed = currentTime - startTime;

    if (timeElapsed < TASK_COMPLETION_DELAY) {
      return "WAIT";
    }

    return "CLAIM";
  };

  const handleTaskClick = async (task) => {
    if (!contract || !account) return;
    if (userTaskStatuses[task.id]?.isCompleted) return;

    const status = getTaskStatus(task.id);

    switch (status) {
      case "START":
        // Open task link and start timer
        window.open(task.link, '_blank');
        startTaskTimer(task.id);
        showNotification(`Complete the task and wait ${TASK_COMPLETION_DELAY / 60} minutes to claim your reward`, "info");
        break;

      case "CLAIM":
        try {
          const tx = await contract.completeTask(task.id);
          showNotification("Claiming reward...", "info");
          
          const receipt = await tx.wait();
          console.log("Task completed:", receipt);

          // Update task status
          const [isCompleted, completedAt] = await contract.getUserTaskStatus(account, task.id);
          setUserTaskStatuses(prev => ({
            ...prev,
            [task.id]: { isCompleted, completedAt: Number(completedAt) }
          }));

          // Clear timer
          setTaskTimers(prev => {
            const newTimers = { ...prev };
            delete newTimers[task.id];
            return newTimers;
          });

          // Immediately fetch and update user points
          try {
            const updatedPoints = await getPoints(account);
            console.log("Updated points after task completion:", updatedPoints);
            setLocalUserPoints(updatedPoints);
          } catch (error) {
            console.error("Error fetching updated points:", error);
          }

          // Still call the parent update callback for consistency
          if (onPointsUpdate) {
            onPointsUpdate();
          }

          showNotification("Task completed successfully!", "success");
        } catch (error) {
          console.error("Error completing task:", error);
          showNotification("Failed to complete task. Please try again.", "error");
        }
        break;

      case "WAIT":
        showNotification(`Please wait ${countdowns[task.id]} before claiming`, "warning");
        break;
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getCompletedTaskCount = () => {
    return Object.values(userTaskStatuses).filter(status => status.isCompleted).length;
  };

  const getTasksForActiveTab = () => {
    if (activeTab === "all") {
      return tasks;
    }
    
    const tabType = parseInt(activeTab);
    return tasksByType[tabType] || [];
  };

  // Task Header Skeleton Component
  const TaskHeaderSkeleton = () => (
    <header className={styles.dashboardHeader}>
      <div className={styles.headerContent}>
        <h1 className={styles.title}>Task Center</h1>
        <div className={styles.statsContainer}>
          <div className={styles.stat}>
            <Skeleton width="40px" height="24px" />
            <span className={styles.statLabel}>Total Points</span>
          </div>
          <div className={styles.stat}>
            <Skeleton width="20px" height="24px" />
            <span className={styles.statLabel}>Tasks Completed</span>
          </div>
          <div className={styles.stat}>
            <Skeleton width="30px" height="24px" />
            <span className={styles.statLabel}>Your Points</span>
          </div>
          <div className={styles.statValue}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: "0%" }} />
            </div>
            <Skeleton width="80px" height="16px" />
          </div>
        </div>
      </div>
    </header>
  );

  // Task Card Skeleton Component
  const TaskCardSkeleton = () => (
    <div className={styles.taskCard}>
      <div className={styles.taskIconBadge}>
        <Skeleton width="24px" height="24px" borderRadius="50%" />
      </div>
      <div className={styles.taskContent}>
        <div className={styles.taskHeader}>
          <Skeleton width="200px" height="20px" />
          <Skeleton width="80px" height="16px" />
        </div>
        <Skeleton width="100%" height="16px" style={{ margin: "8px 0" }} />
        <div className={styles.taskFooter}>
          <Skeleton width="120px" height="16px" />
          <ButtonSkeleton width="100px" height="36px" />
        </div>
      </div>
    </div>
  );

  // Tab Skeleton Component
  const TabsSkeleton = () => (
    <div className={styles.tabsContainer}>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className={styles.tabButton}>
          <Skeleton width="20px" height="20px" borderRadius="50%" />
          <Skeleton width="80px" height="16px" />
        </div>
      ))}
    </div>
  );

  const displayTasks = getTasksForActiveTab();
  const completedCount = getCompletedTaskCount();
  const totalTasks = tasks.length;

  // Calculate total available points from all tasks
  const totalAvailablePoints = tasks && tasks.length > 0 ? tasks.reduce((total, task) => {
    return total + parseFloat(ethers.utils.formatUnits(task.rewardAmount, 18));
  }, 0) : 0;

  // Use localUserPoints for user's earned points
  const userEarnedPoints = localUserPoints || userPoints;

  return (
    <div className={styles.taskDashboard}>
      {/* Header with progressive loading */}
      {loading ? (
        <TaskHeaderSkeleton />
      ) : (
        <header className={styles.dashboardHeader}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Task Center</h1>
            <div className={styles.statsContainer}>
              <div className={styles.stat}>
                <span className={styles.statValue}>{totalAvailablePoints % 1 === 0 ? totalAvailablePoints.toFixed(0) : totalAvailablePoints.toFixed(1)}</span>
                <span className={styles.statLabel}>Total Points</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{completedCount}</span>
                <span className={styles.statLabel}>Tasks Completed</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{ethers.utils.formatUnits(userEarnedPoints.toString(), 18) || "0"}</span>
                <span className={styles.statLabel}>Your Points</span>
              </div>
              <div className={styles.statValue}>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0}%` }}
                  />
                </div>
                <span className={styles.progressText}>
                  {completedCount}/{totalTasks} Tasks
                </span>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Tabs with progressive loading */}
      {loading ? (
        <TabsSkeleton />
      ) : (
        <div className={styles.tabsContainer}>
          <button
            className={`${styles.tabButton} ${activeTab === "all" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("all")}
          >
            <i className="fas fa-th-list"></i>
            <span>All Tasks</span>
            <div className={styles.tabIndicator}></div>
          </button>

          {visibleTaskTypes.map(type => (
            <button
              key={type}
              className={`${styles.tabButton} ${activeTab === String(type) ? styles.activeTab : ""}`}
              onClick={() => setActiveTab(String(type))}
              style={{
                '--tab-color': TASK_ICONS[type]?.color || '#6366f1'
              }}
            >
              <i className={TASK_ICONS[type]?.icon || "fas fa-tasks"}></i>
              <span>{TASK_ICONS[type]?.name || `Type ${type}`}</span>
              <div className={styles.tabIndicator}></div>
            </button>
          ))}
        </div>
      )}

      {/* Task List with progressive loading */}
      <div className={styles.taskListWrapper}>
        <div className={styles.taskList}>
          {loading ? (
            // Show skeleton cards while loading
            Array.from({ length: 6 }).map((_, index) => (
              <TaskCardSkeleton key={index} />
            ))
          ) : displayTasks && displayTasks.length > 0 ? (
            displayTasks.map((task) => {
              const taskType = Number(task.taskType);
              const taskIcon = TASK_ICONS[taskType] || { icon: "fas fa-tasks", color: "#6366f1" };
              const status = getTaskStatus(task.id);
              const isCompleted = userTaskStatuses[task.id]?.isCompleted;

              return (
                <div
                  key={task.id}
                  className={`${styles.taskCard} ${isCompleted ? styles.completed : ''}`}
                  style={{ '--task-color': taskIcon.color }}
                >
                  <div className={styles.taskIconBadge}>
                    <i className={taskIcon.icon}></i>
                  </div>

                  <div className={styles.taskContent}>
                    <div className={styles.taskHeader}>
                      <h3 className={styles.taskTitle}>{task.title}</h3>
                      <span className={styles.taskReward}>
                        +{ethers.utils.formatUnits(task.rewardAmount, 18)} Points
                      </span>
                    </div>

                    <p className={styles.taskDescription}>{task.description}</p>

                    <div className={styles.taskFooter}>
                      <div className={styles.taskStatus}>
                        {isCompleted ? (
                          <span className={styles.completedStatus}>
                            <i className="fas fa-check-circle"></i> Completed on {formatDate(userTaskStatuses[task.id].completedAt)}
                          </span>
                        ) : status === "WAIT" ? (
                          <span className={styles.waitingStatus}>
                            <i className="fas fa-hourglass-half"></i> Waiting: {countdowns[task.id]}
                          </span>
                        ) : (
                          <span className={styles.pendingStatus}>
                            <i className="fas fa-clock"></i> Pending
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleTaskClick(task)}
                        className={`${styles.taskAction} ${isCompleted ? styles.completed : ''} ${status === "WAIT" ? styles.waiting : ''} ${status === "CLAIM" ? styles.claim : ''}`}
                        disabled={isCompleted}
                      >
                        {isCompleted ? (
                          <>
                            <i className="fas fa-check"></i> Completed
                          </>
                        ) : status === "START" ? (
                          <>
                            <i className="fas fa-play"></i> Start Task
                          </>
                        ) : status === "WAIT" ? (
                          <>
                            <i className="fas fa-hourglass-half"></i> {countdowns[task.id]}
                          </>
                        ) : (
                          <>
                            <i className="fas fa-gift"></i> Claim Reward
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>
                <i className="fas fa-tasks"></i>
              </div>
              <h3>No Tasks Available</h3>
              <p>{activeTab === "all" ? "There are no tasks available at the moment." : "There are no tasks of this type available right now."}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDashboard;