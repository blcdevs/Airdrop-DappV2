import { useState, useEffect } from "react"; // Add useEffect
import styles from "./AdminDashboard.module.css";
import { useWeb3 } from "../../context/Web3Context"; // Add this import
import { ethers } from "ethers";
import TimeRangeSettings from "../TimeInputComponent/TimeInputComponent";
import { useAdmin } from "../../context/AdminContext";
import {
  getAdminPermissions,
  hasPermission
} from "../../utils/adminUtils";

const AdminDashboard = ({
  isOpen,
  onClose,
  airdropInfo,
  setAirdropAmount,
  setAirdropBonus,
  updateAirdropAmount,
  updateReferralBonus,
  updateWithdrawTokens,
  contract,
  feeAmount,
  feeCollector,
  onUpdateFeeAmount,
  onUpdateFeeCollector,
  onWithdrawFees,
  onUpdateCooldown,
  account,
  showNotification
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [newFeeAmount, setNewFeeAmount] = useState("");
  const [newFeeCollector, setNewFeeCollector] = useState("");
  const [newCooldown, setNewCooldown] = useState("");
  const [tasks, setTasks] = useState([]);
  const { getAllTasks } = useWeb3();

  // Admin management
  const {
    isAdmin,
    isPrimaryAdmin,
    getAdminRole,
    getAdminList,
    formatAddress,
    addAdmin,
    removeAdmin,
    isValidAddress
  } = useAdmin();

  // State for admin management
  const [newAdminAddress, setNewAdminAddress] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminSuccess, setAdminSuccess] = useState("");

    // New state for task management
    const [newTask, setNewTask] = useState({
      title: "",
      description: "",
      link: "",
      rewardAmount: "",
      taskType: "YOUTUBE"
    });
    const [editingTask, setEditingTask] = useState(null);
  
    const taskTypes = [
      "YOUTUBE",
      "TELEGRAM",
      "TWITTER",
      "WEBSITE",
      "FACEBOOK",
      "DISCORD",
      "MEDIUM"
    ];

    useEffect(() => {
      const fetchTasks = async () => {
        if (contract) {
          const allTasks = await getAllTasks();
          setTasks(allTasks);
        }
      };
      fetchTasks();
    }, [contract]);
  
    const handleCreateTask = async () => {
      try {
        await contract.createTask(
          newTask.title,
          newTask.description,
          newTask.link,
          ethers.utils.parseEther(newTask.rewardAmount.toString()),
          taskTypes.indexOf(newTask.taskType)
        );
        
        // Refresh tasks after creation
        const updatedTasks = await getAllTasks();
        setTasks(updatedTasks);
        
        // Reset form
        setNewTask({
          title: "",
          description: "",
          link: "",
          rewardAmount: "",
          taskType: "YOUTUBE"
        });
      } catch (error) {
        console.error("Error creating task:", error);
      }
    };

    const handleUpdateTask = async (taskId) => {
      try {
        await contract.updateTask(
          taskId,
          editingTask.title,
          editingTask.description,
          editingTask.link,
          editingTask.rewardAmount,
          taskTypes.indexOf(editingTask.taskType)
        );
        setEditingTask(null);
      } catch (error) {
        console.error("Error updating task:", error);
      }
    };
  
    const handleDeleteTask = async (taskId) => {
      try {
        await contract.setTaskStatus(taskId, false);
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    };

    // Callback for when time is updated
    const handleTimeUpdate = () => {
      // Refresh the page or refetch data after time update
      if (typeof window !== 'undefined' && window.location.reload) {
        setTimeout(() => window.location.reload(), 1000);
      }
    };

    // Admin management functions
    const handleAddAdmin = async () => {
      setAdminError("");
      setAdminSuccess("");

      try {
        if (!newAdminAddress.trim()) {
          throw new Error("Please enter an admin address");
        }

        await addAdmin(newAdminAddress.trim());
        setAdminSuccess(`Admin ${formatAddress(newAdminAddress)} added successfully!`);
        setNewAdminAddress("");

        // Clear success message after 3 seconds
        setTimeout(() => setAdminSuccess(""), 3000);
      } catch (error) {
        setAdminError(error.message);
        setTimeout(() => setAdminError(""), 5000);
      }
    };

    const handleRemoveAdmin = async (address) => {
      setAdminError("");
      setAdminSuccess("");

      try {
        await removeAdmin(address);
        setAdminSuccess(`Admin ${formatAddress(address)} removed successfully!`);

        // Clear success message after 3 seconds
        setTimeout(() => setAdminSuccess(""), 3000);
      } catch (error) {
        setAdminError(error.message);
        setTimeout(() => setAdminError(""), 5000);
      }
    };


  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2>Admin Dashboard</h2>
            <div className={styles.adminInfo}>
              <span className={styles.adminRole}>{getAdminRole(account)}</span>
              <span className={styles.adminAddress}>{formatAddress(account)}</span>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tabButton} ${
              activeTab === "overview" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "settings" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </button>

          <button
            className={`${styles.tabButton} ${activeTab === "tasks" ? styles.active : ""}`}
            onClick={() => setActiveTab("tasks")}
          >
            Tasks
          </button>

          <button
            className={`${styles.tabButton} ${
              activeTab === "participants" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("participants")}
          >
            Participants
          </button>

          <button
            className={`${styles.tabButton} ${
              activeTab === "admins" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("admins")}
          >
            Admins
          </button>

        </div>

        <div className={styles.content}>
          {activeTab === "overview" && (
            <div className={styles.overview}>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <h3>Total Participants</h3>
                  <p className={styles.statValue}>
                    {airdropInfo?.totalParticipants || 0}
                  </p>
                </div>
                <div className={styles.statCard}>
                  <h3>Remaining Tokens</h3>
                  <p className={styles.statValue}>
                    {airdropInfo?.remainingTokens || 0}
                  </p>
                </div>
                <div className={styles.statCard}>
                  <h3>Airdrop Tokens</h3>
                  <p className={styles.statValue}>
                    {airdropInfo?.airdropAmount || 0}
                  </p>
                </div>
                <div className={styles.statCard}>
                  <h3>Referral Bonus Tokens</h3>
                  <p className={styles.statValue}>
                    {airdropInfo?.referralBonus || 0}
                  </p>
                </div>
                <div className={styles.statCard}>
                  <h3>Total Distributed</h3>
                  <p className={styles.statValue}>
                    {1000000 - airdropInfo?.airdropContractBalance || 0}
                  </p>
                </div>
                <div className={styles.statCard}>
                  <h3>Status</h3>
                  <p
                    className={`${styles.status} ${
                      airdropInfo?.isAirdropActive
                        ? styles.active
                        : styles.inactive
                    }`}
                  >
                    {airdropInfo?.isAirdropActive ? "Active" : "Inactive"}
                  </p>
                </div>
                {/* New Fee-related cards */}
                <div className={styles.statCard}>
                  <h3>Current Fee</h3>
                  <p className={styles.statValue}>
                    {feeAmount} BNB
                  </p>
                </div>
                <div className={styles.statCard}>
                  <h3>Fee Collector</h3>
                  <p className={styles.statValue} style={{ fontSize: '0.8em', wordBreak: 'break-all' }}>
                    {feeCollector}
                  </p>
                </div>
                <div className={styles.statCard}>
                  <h3>Total Fees Collected</h3>
                  <p className={styles.statValue}>
                    {airdropInfo?.totalFeesCollected || 0} BNB
                  </p>
                </div>

                {/* Contract Information Cards */}
                <div className={styles.statCard}>
                  <h3>Airdrop Contract Address</h3>
                  <p className={styles.statValue} style={{ fontSize: '0.7em', wordBreak: 'break-all' }}>
                    {contract?.address || process.env.NEXT_PUBLIC_AIRDROP_CONTRACT_ADDRESS || 'Not Available'}
                  </p>
                </div>

                <div className={styles.statCard}>
                  <h3>Token Contract Address</h3>
                  <p className={styles.statValue} style={{ fontSize: '0.7em', wordBreak: 'break-all' }}>
                    {airdropInfo?.tokenAddress || 'Not Available'}
                  </p>
                </div>

                <div className={styles.statCard}>
                  <h3>Admin Account</h3>
                  <p className={styles.statValue} style={{ fontSize: '0.7em', wordBreak: 'break-all' }}>
                    {account || 'Not Connected'}
                  </p>
                </div>

                <div className={styles.statCard}>
                  <h3>Token Information</h3>
                  <p className={styles.statValue}>
                    {airdropInfo?.tokenName || 'N/A'} ({airdropInfo?.tokenSymbol || 'N/A'})
                  </p>
                </div>

                <div className={styles.statCard}>
                  <h3>Total Token Supply</h3>
                  <p className={styles.statValue}>
                    {airdropInfo?.totalSupply ? parseFloat(airdropInfo.totalSupply).toLocaleString() : '0'} {airdropInfo?.tokenSymbol || 'Tokens'}
                  </p>
                </div>

                <div className={styles.statCard}>
                  <h3>Claim Cooldown</h3>
                  <p className={styles.statValue}>
                    {airdropInfo?.currentCooldown ? `${Math.floor(airdropInfo.currentCooldown / 3600)} Hours` : '6 Hours'}
                  </p>
                </div>

                <div className={styles.statCard}>
                  <h3>Airdrop Start Time</h3>
                  <p className={styles.statValue} style={{ fontSize: '0.8em' }}>
                    {airdropInfo?.startTime ? new Date(airdropInfo.startTime).toLocaleString() : 'Not Set'}
                  </p>
                </div>

                <div className={styles.statCard}>
                  <h3>Airdrop End Time</h3>
                  <p className={styles.statValue} style={{ fontSize: '0.8em' }}>
                    {airdropInfo?.endTime ? new Date(airdropInfo.endTime).toLocaleString() : 'Not Set'}
                  </p>
                </div>

                <div className={styles.statCard}>
                  <h3>Contract Balance</h3>
                  <p className={styles.statValue}>
                    {airdropInfo?.airdropContractBalance ? parseFloat(airdropInfo.airdropContractBalance).toLocaleString() : '0'} {airdropInfo?.tokenSymbol || 'Tokens'}
                  </p>
                </div>

                <div className={styles.statCard}>
                  <h3>Network</h3>
                  <p className={styles.statValue}>
                    BSC Mainnet
                  </p>
                </div>
              </div>

              <div className={styles.actionButtons}>
                {hasPermission(account, 'canWithdrawTokens') && (
                  <button
                    className={`${styles.actionButton} ${styles.dangerButton}`}
                    onClick={updateWithdrawTokens}
                  >
                    Withdraw Remaining Tokens
                  </button>
                )}
                {hasPermission(account, 'canWithdrawFees') && (
                  <button
                    className={`${styles.actionButton} ${styles.primaryButton}`}
                    onClick={onWithdrawFees}
                  >
                    Withdraw Collected Fees
                  </button>
                )}
                {!isPrimaryAdmin(account) && (
                  <div className={styles.permissionNote}>
                    <i className="fas fa-info-circle"></i>
                    Only the Primary Admin can withdraw tokens and fees
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rest of the component remains the same */}
          {activeTab === "settings" && (
            <div className={styles.settings}>
              <div className={styles.settingGroup}>
                <h3>Update Airdrop Amount</h3>
                <div className={styles.inputGroup}>
                  <input
                    type="number"
                    onChange={(e) => setAirdropAmount(e.target.value)}
                    placeholder="New airdrop amount"
                  />
                  <button onClick={updateAirdropAmount}>Update</button>
                </div>
              </div>

              <div className={styles.settingGroup}>
                <h3>Update Referral Bonus</h3>
                <div className={styles.inputGroup}>
                  <input
                    type="number"
                    onChange={(e) => setAirdropBonus(e.target.value)}
                    placeholder="New referral bonus"
                  />
                  <button onClick={updateReferralBonus}>Update</button>
                </div>
              </div>

              <div className={styles.settingGroup}>
                <h3>Update Fee Amount</h3>
                <div className={styles.inputGroup}>
                  <input
                    type="number"
                    step="0.000000000000000001"
                    value={newFeeAmount}
                    onChange={(e) => setNewFeeAmount(e.target.value)}
                    placeholder="New fee amount (BNB)"
                  />
                  <button onClick={() => onUpdateFeeAmount(newFeeAmount)}>
                    Update
                  </button>
                </div>
              </div>

              <div className={styles.settingGroup}>
                <h3>Update Fee Collector</h3>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    value={newFeeCollector}
                    onChange={(e) => setNewFeeCollector(e.target.value)}
                    placeholder="New fee collector address"
                  />
                  <button onClick={() => onUpdateFeeCollector(newFeeCollector)}>
                    Update
                  </button>
                </div>
              </div>

            
            <div className={styles.settingGroup}>
              <h3>Update Claim Cooldown</h3>
              <div className={styles.inputGroup}>
                <input
                  type="number"
                  value={newCooldown}
                  onChange={(e) => setNewCooldown(e.target.value)}
                  placeholder="New cooldown in hours"
                />
                <button onClick={() => onUpdateCooldown(newCooldown)}>
                  Update
                </button>
              </div>
            </div>

            {/* Time Range Settings Component */}
            <TimeRangeSettings
              contract={contract}
              airdropInfo={airdropInfo}
              showNotification={showNotification}
              onTimeUpdate={handleTimeUpdate}
              styles={styles}
            />
            </div>
          )}

{activeTab === "tasks" && (
    <div className={styles.tasksManagement}>
      <div className={styles.createTask}>
        <h3>Create New Task</h3>
        <div className={styles.taskForm}>
          <input
            type="text"
            placeholder="Task Title"
            value={newTask.title}
            onChange={(e) => setNewTask({...newTask, title: e.target.value})}
          />
          <textarea
            placeholder="Task Description"
            value={newTask.description}
            onChange={(e) => setNewTask({...newTask, description: e.target.value})}
          />
          <input
            type="text"
            placeholder="Task Link"
            value={newTask.link}
            onChange={(e) => setNewTask({...newTask, link: e.target.value})}
          />
          <input
            type="number"
            placeholder="Reward Points"
            value={newTask.rewardAmount}
            onChange={(e) => setNewTask({...newTask, rewardAmount: e.target.value})}
          />
          <select
            value={newTask.taskType}
            onChange={(e) => setNewTask({...newTask, taskType: e.target.value})}
          >
            {taskTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <button onClick={handleCreateTask}>Create Task</button>
        </div>
      </div>
  
      <div className={styles.tasksList}>
        <h3>Existing Tasks</h3>
        {tasks.map((task) => (
          <div key={task.id} className={styles.taskItem}>
            {editingTask?.id === task.id ? (
              <div className={styles.editTaskForm}>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                />
                <textarea
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                />
                <input
                  type="text"
                  value={editingTask.link}
                  onChange={(e) => setEditingTask({...editingTask, link: e.target.value})}
                />
                <input
                  type="number"
                  value={editingTask.rewardAmount}
                  onChange={(e) => setEditingTask({...editingTask, rewardAmount: e.target.value})}
                />
                <select
                  value={editingTask.taskType}
                  onChange={(e) => setEditingTask({...editingTask, taskType: e.target.value})}
                >
                  {taskTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <div className={styles.editActions}>
                  <button onClick={() => handleUpdateTask(task.id)}>Save</button>
                  <button onClick={() => setEditingTask(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.taskInfo}>
                  <h4>{task.title}</h4>
                  <p>{task.description}</p>
                  <span className={styles.taskReward}>{task.rewardAmount} Points</span>
                </div>
                <div className={styles.taskActions}>
                  <button onClick={() => setEditingTask(task)}>Edit</button>
                  <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
        {tasks.length === 0 && (
          <p className={styles.noTasks}>No tasks created yet</p>
        )}
      </div>
    </div>
  )}
          

          {activeTab === "participants" && (
            <div className={styles.participants}>
              <table className={styles.participantsTable}>
                <thead>
                  <tr>
                    <th>Address</th>
                    <th>Status</th>
                    <th>Referrals</th>
                    <th>Total Earned</th>
                    <th>Fee Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {airdropInfo?.allParticipants.map((participant, index) => (
                    <tr key={index}>
                      <td>{participant.address}</td>
                      <td>
                        <span className={styles.participationStatus}>
                          {participant.hasParticipated ? "✓" : "✗"}
                        </span>
                      </td>
                      <td>{participant.referralCount}</td>
                      <td>{participant.totalEarned} Tokens</td>
                      <td>{participant.feePaid} BNB</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "admins" && (
            <div className={styles.adminsManagement}>
              {/* Add New Admin Section */}
              {isPrimaryAdmin(account) && (
                <div className={styles.addAdminSection}>
                  <h3>Add New Admin</h3>
                  <div className={styles.addAdminForm}>
                    <input
                      type="text"
                      value={newAdminAddress}
                      onChange={(e) => setNewAdminAddress(e.target.value)}
                      placeholder="Enter admin wallet address (0x...)"
                      className={styles.adminInput}
                    />
                    <button
                      onClick={handleAddAdmin}
                      className={styles.addAdminButton}
                      disabled={!newAdminAddress.trim() || !isValidAddress(newAdminAddress)}
                    >
                      Add Admin
                    </button>
                  </div>

                  {adminError && (
                    <div className={styles.adminError}>
                      <i className="fas fa-exclamation-triangle"></i>
                      {adminError}
                    </div>
                  )}

                  {adminSuccess && (
                    <div className={styles.adminSuccess}>
                      <i className="fas fa-check-circle"></i>
                      {adminSuccess}
                    </div>
                  )}

                  <div className={styles.adminNote}>
                    <i className="fas fa-info-circle"></i>
                    Only the Primary Admin (Contract Owner) can add or remove other admins.
                  </div>
                </div>
              )}

              <div className={styles.adminsList}>
                <h3>Current Admin Addresses</h3>
                <div className={styles.adminCards}>
                  {getAdminList().map((admin, index) => (
                    <div key={index} className={styles.adminCard}>
                      <div className={styles.adminCardHeader}>
                        <h4>{admin.role}</h4>
                        <div className={styles.adminBadges}>
                          {admin.isPrimary && (
                            <span className={styles.primaryBadge}>Contract Owner</span>
                          )}
                          {admin.address.toLowerCase() === account?.toLowerCase() && (
                            <span className={styles.currentAdminBadge}>You</span>
                          )}
                        </div>
                      </div>
                      <div className={styles.adminCardContent}>
                        <p className={styles.adminAddress}>{admin.address}</p>
                        <p className={styles.adminAddressShort}>{formatAddress(admin.address)}</p>

                        {/* Remove button for non-primary admins */}
                        {!admin.isPrimary && isPrimaryAdmin(account) && (
                          <button
                            onClick={() => handleRemoveAdmin(admin.address)}
                            className={styles.removeAdminButton}
                            title="Remove this admin"
                          >
                            <i className="fas fa-trash"></i>
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.adminPermissions}>
                <h3>Your Permissions</h3>
                <div className={styles.permissionsList}>
                  {Object.entries(getAdminPermissions(account)).map(([permission, hasAccess]) => (
                    <div key={permission} className={styles.permissionItem}>
                      <span className={styles.permissionName}>
                        {permission.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <span className={`${styles.permissionStatus} ${hasAccess ? styles.allowed : styles.denied}`}>
                        {hasAccess ? '✓ Allowed' : '✗ Denied'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.adminNotes}>
                <h3>Important Notes</h3>
                <ul className={styles.notesList}>
                  <li>Only the <strong>Primary Admin (Contract Owner)</strong> can withdraw tokens and fees</li>
                  <li>All admins can modify airdrop settings and manage tasks</li>
                  <li>Changes are executed through the Primary Admin's account on the blockchain</li>
                  <li>Multiple admins share the same interface but only one owns the contract</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );


};

export default AdminDashboard;