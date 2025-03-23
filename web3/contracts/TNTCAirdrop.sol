// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IERC20Extended is IERC20 {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
}

contract TNTCAirdrop is Ownable, ReentrancyGuard {
    IERC20Extended public token;
    
    string public airdropName;
    string public airdropDescription;
    
    uint256 public airdropAmount = 5 * 10**18; // 100 tokens
    uint256 public referralBonus = 1 * 10**18;  // 20 tokens
    uint256 public startTime;
    uint256 public endTime;

    // Fee management
    address public feeCollector;
    uint256 public feeAmount;

    // Cooldown management
    uint256 public claimCooldown = 6 hours; // Default 6 hours cooldown
    mapping(address => uint256) public lastClaimTime;

    address[] public participantAddresses;

    struct ParticipantInfo {
        address userAddress;
        bool hasParticipated;
        uint256 referralCount;
        address referrer;
        uint256 totalEarned;
        uint256 participationTime;
        uint256 feePaid;
    }
    
    mapping(address => bool) public hasParticipated;
    mapping(address => uint256) public referralCount;
    mapping(address => address) public referredBy;
    mapping(address => uint256) public feesPaid;
        mapping(address => uint256) public userClaimCount; 

    // Task System
    enum TaskType { 
        YOUTUBE,
        TELEGRAM,
        TWITTER,
        WEBSITE,
        FACEBOOK,
        DISCORD,
        MEDIUM
    }

    struct Task {
        uint256 id;
        string title;
        string description;
        string link;
        uint256 rewardAmount;
        TaskType taskType;
        bool isActive;
    }

    struct UserTaskStatus {
        bool isCompleted;
        uint256 completedAt;
    }

    uint256 public taskCount;
    mapping(uint256 => Task) public tasks;
    mapping(address => mapping(uint256 => UserTaskStatus)) public userTaskStatus;
    mapping(address => uint256) public userTaskPoints;

    // Events (Existing)
    event AirdropClaimed(address indexed user, uint256 amount);
    event ReferralBonusClaimed(address indexed referrer, address indexed referee, uint256 amount);
    event TokensTransferred(address indexed from, address indexed to, uint256 amount);
    event TransferFailed(address indexed from, address indexed to, uint256 amount);
    event FeeCollectorUpdated(address indexed oldCollector, address indexed newCollector);
    event FeeAmountUpdated(uint256 oldAmount, uint256 newAmount);
    event FeePaid(address indexed user, uint256 amount);
    event StartTimeUpdated(uint256 newStartTime);
    event EndTimeUpdated(uint256 newEndTime);
    event AirdropTimingUpdated(uint256 newStartTime, uint256 newEndTime);
    event ClaimCooldownUpdated(uint256 newCooldown);

    // New Task Events
    event TaskCreated(uint256 indexed taskId, string title, uint256 rewardAmount);
    event TaskCompleted(address indexed user, uint256 indexed taskId, uint256 rewardAmount);
    event TaskUpdated(uint256 indexed taskId, string title, uint256 rewardAmount);
    event TaskStatusChanged(uint256 indexed taskId, bool isActive);

    constructor(
        address _tokenAddress,
        uint256 _startTime,
        uint256 _endTime,
        string memory _airdropName,
        string memory _airdropDescription
    ) {
        require(_tokenAddress != address(0), "Invalid token address");
        require(_startTime < _endTime, "Invalid time range");
        
        token = IERC20Extended(_tokenAddress);
        startTime = _startTime;
        endTime = _endTime;
        airdropName = _airdropName;
        airdropDescription = _airdropDescription;
        feeCollector = msg.sender;
    }

    // Keep all existing functions...
    // Fee management functions
    function setFeeCollector(address _newCollector) external onlyOwner {
        require(_newCollector != address(0), "Invalid address");
        address oldCollector = feeCollector;
        feeCollector = _newCollector;
        emit FeeCollectorUpdated(oldCollector, _newCollector);
    }

    function setFeeAmount(uint256 _newFeeAmount) external onlyOwner {
        uint256 oldAmount = feeAmount;
        feeAmount = _newFeeAmount;
        emit FeeAmountUpdated(oldAmount, _newFeeAmount);
    }

    function setClaimCooldown(uint256 _newCooldown) external onlyOwner {
        require(_newCooldown > 0, "Cooldown must be greater than 0");
        claimCooldown = _newCooldown;
        emit ClaimCooldownUpdated(_newCooldown);
    }

    // Existing modifiers
    modifier isActive() {
        require(_isAirdropActive(), "Airdrop is not active");
        _;
    }

    function _isAirdropActive() internal view returns (bool) {
        return (block.timestamp >= startTime && block.timestamp <= endTime);
    }

    // Existing participation functions
    function participate(address referrer) external payable nonReentrant isActive {
        require(block.timestamp >= lastClaimTime[msg.sender] + claimCooldown || lastClaimTime[msg.sender] == 0, "Cooldown period not elapsed");
        require(referrer != msg.sender, "Cannot refer yourself");
        require(token.balanceOf(address(this)) >= airdropAmount, "Insufficient tokens");
        
        // Handle fee
        if (feeAmount > 0) {
            require(msg.value >= feeAmount, "Insufficient fee");
            (bool success, ) = feeCollector.call{value: feeAmount}("");
            require(success, "Fee transfer failed");
            
            // Refund excess payment
            if (msg.value > feeAmount) {
                (bool refundSuccess, ) = msg.sender.call{value: msg.value - feeAmount}("");
                require(refundSuccess, "Refund failed");
            }
            feesPaid[msg.sender] = feeAmount;
            emit FeePaid(msg.sender, feeAmount);
        }

        lastClaimTime[msg.sender] = block.timestamp;
        
        if (!hasParticipated[msg.sender]) {
            hasParticipated[msg.sender] = true;
            participantAddresses.push(msg.sender);
            
            if (referrer != address(0) && hasParticipated[referrer]) {
                referredBy[msg.sender] = referrer;
                referralCount[referrer]++;
                
                if (token.balanceOf(address(this)) >= referralBonus) {
                    require(token.transfer(referrer, referralBonus), "Referral bonus transfer failed");
                    emit ReferralBonusClaimed(referrer, msg.sender, referralBonus);
                }
            }
        }
        
        require(token.transfer(msg.sender, airdropAmount), "Token transfer failed");
        emit AirdropClaimed(msg.sender, airdropAmount);
    }

    // Continue with existing functions...
      function participateWithoutReferral() external payable nonReentrant isActive {
        require(block.timestamp >= lastClaimTime[msg.sender] + claimCooldown || lastClaimTime[msg.sender] == 0, "Cooldown period not elapsed");
        require(token.balanceOf(address(this)) >= airdropAmount, "Insufficient tokens");
        
        if (feeAmount > 0) {
            require(msg.value >= feeAmount, "Insufficient fee");
            (bool success, ) = feeCollector.call{value: feeAmount}("");
            require(success, "Fee transfer failed");
            
            if (msg.value > feeAmount) {
                (bool refundSuccess, ) = msg.sender.call{value: msg.value - feeAmount}("");
                require(refundSuccess, "Refund failed");
            }
            feesPaid[msg.sender] += feeAmount;  // Changed from = to += to accumulate fees
            emit FeePaid(msg.sender, feeAmount);
        }

        lastClaimTime[msg.sender] = block.timestamp;
        
        if (!hasParticipated[msg.sender]) {
            hasParticipated[msg.sender] = true;
            participantAddresses.push(msg.sender);
        }
        
        userClaimCount[msg.sender]++;
        
        require(token.transfer(msg.sender, airdropAmount), "Token transfer failed");
        emit AirdropClaimed(msg.sender, airdropAmount);
    }

    // New Task System Functions
    function createTask(
        string memory _title,
        string memory _description,
        string memory _link,
        uint256 _rewardAmount,
        TaskType _taskType
    ) external onlyOwner {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_rewardAmount > 0, "Reward must be greater than 0");
        
        uint256 taskId = taskCount;
        tasks[taskId] = Task({
            id: taskId,
            title: _title,
            description: _description,
            link: _link,
            rewardAmount: _rewardAmount,
            taskType: _taskType,
            isActive: true
        });
        
        taskCount++;
        emit TaskCreated(taskId, _title, _rewardAmount);
    }

function completeTask(uint256 taskId) external {
    require(taskId < taskCount, "Invalid task ID");
    require(!userTaskStatus[msg.sender][taskId].isCompleted, "Task already completed");
    require(tasks[taskId].isActive, "Task is not active");

    Task storage task = tasks[taskId];
    
    // Update task status
    userTaskStatus[msg.sender][taskId] = UserTaskStatus({
        isCompleted: true,
        completedAt: block.timestamp
    });

    // Update user's task points
    userTaskPoints[msg.sender] += task.rewardAmount;

    // Transfer tokens for task completion
    bool success = token.transfer(msg.sender, task.rewardAmount);
    require(success, "Token transfer failed");

    emit TaskCompleted(msg.sender, taskId, task.rewardAmount);
}

    function updateTask(
        uint256 _taskId,
        string memory _title,
        string memory _description,
        string memory _link,
        uint256 _rewardAmount,
        TaskType _taskType
    ) external onlyOwner {
        require(_taskId < taskCount, "Invalid task ID");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_rewardAmount > 0, "Reward must be greater than 0");
        
        Task storage task = tasks[_taskId];
        task.title = _title;
        task.description = _description;
        task.link = _link;
        task.rewardAmount = _rewardAmount;
        task.taskType = _taskType;
        
        emit TaskUpdated(_taskId, _title, _rewardAmount);
    }

    function setTaskStatus(uint256 _taskId, bool _isActive) external onlyOwner {
        require(_taskId < taskCount, "Invalid task ID");
        tasks[_taskId].isActive = _isActive;
        emit TaskStatusChanged(_taskId, _isActive);
    }

    // Task View Functions
    function getTask(uint256 _taskId) external view returns (Task memory) {
        require(_taskId < taskCount, "Invalid task ID");
        return tasks[_taskId];
    }

    function getAllTasks() external view returns (Task[] memory) {
        Task[] memory allTasks = new Task[](taskCount);
        for(uint256 i = 0; i < taskCount; i++) {
            allTasks[i] = tasks[i];
        }
        return allTasks;
    }

    function getUserTaskStatus(address _user, uint256 _taskId) external view returns (bool isCompleted, uint256 completedAt) {
        UserTaskStatus memory status = userTaskStatus[_user][_taskId];
        return (status.isCompleted, status.completedAt);
    }

    // Keep all existing view and admin functions...
    function getNextClaimTime(address user) external view returns (uint256) {
        if (lastClaimTime[user] == 0) {
            return 0;
        }
        return lastClaimTime[user] + claimCooldown;
    }
    
    function setAirdropAmount(uint256 _amount) external onlyOwner {
        airdropAmount = _amount;
    }
    
    function setReferralBonus(uint256 _amount) external onlyOwner {
        referralBonus = _amount;
    }
    
    function withdrawTokens() external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        require(token.transfer(owner(), balance), "Token transfer failed");
    }

    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        (bool success, ) = feeCollector.call{value: balance}("");
        require(success, "Fee withdrawal failed");
    }
    
    function getReferralCount(address user) external view returns (uint256) {
        return referralCount[user];
    }
    
    function getReferrer(address user) external view returns (address) {
        return referredBy[user];
    }

    function setStartTime(uint256 _newStartTime) external onlyOwner {
        require(_newStartTime < endTime, "Start time must be before end time");
        require(_newStartTime > block.timestamp, "Start time must be in the future");
        startTime = _newStartTime;
        emit StartTimeUpdated(_newStartTime);
    }

    function setEndTime(uint256 _newEndTime) external onlyOwner {
        require(_newEndTime > startTime, "End time must be after start time");
        require(_newEndTime > block.timestamp, "End time must be in the future");
        endTime = _newEndTime;
        emit EndTimeUpdated(_newEndTime);
    }

    function updateAirdropTiming(uint256 _newStartTime, uint256 _newEndTime) external onlyOwner {
        require(_newStartTime < _newEndTime, "Invalid time range");
        require(_newEndTime > block.timestamp, "End time must be in the future");
        startTime = _newStartTime;
        endTime = _newEndTime;
        emit AirdropTimingUpdated(_newStartTime, _newEndTime);
    }

    // Update existing getAirdropInfo function to include task information
    function getAirdropInfo() external view returns (
        string memory name,
        string memory description,
        uint256 baseAmount,
        uint256 referralAmount,
        uint256 start,
        uint256 end,
        uint256 remainingTokens,
        uint256 totalParticipants,
        bool isAirdropActive,
        uint256 currentFeeAmount,
        address currentFeeCollector,
        uint256 totalFeesCollected,
        uint256 currentCooldown,
        uint256 totalTasks,
        uint256 userCompletedTasks,
        uint256 userPoints
    ) {
        uint256 completedCount = 0;
        for(uint256 i = 0; i < taskCount; i++) {
            if(userTaskStatus[msg.sender][i].isCompleted) {
                completedCount++;
            }
        }

        return (
            airdropName,
            airdropDescription,
            airdropAmount,
            referralBonus,
            startTime,
            endTime,
            token.balanceOf(address(this)),
            getTotalParticipants(),
            _isAirdropActive(),
            feeAmount,
            feeCollector,
            address(this).balance,
            claimCooldown,
            taskCount,
            completedCount,
            userTaskPoints[msg.sender]
        );
    }

    // Keep existing functions...
    function getTokenInfo() external view returns (
        address tokenAddress,
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 totalSupply,
        uint256 airdropContractBalance
    ) {
        return (
            address(token),
            token.name(),
            token.symbol(),
            token.decimals(),
            token.totalSupply(),
            token.balanceOf(address(this))
        );
    }

function getUserParticipationInfo(address user) public view returns (
    bool hasParticipated_,
    uint256 referralCount_,
    address referrer_,
    uint256 totalEarned,
    uint256 feePaid_,
    uint256 nextClaimTime_
) {
    hasParticipated_ = hasParticipated[user];
    referralCount_ = referralCount[user];
    referrer_ = referredBy[user];
    totalEarned = userClaimCount[user] * airdropAmount;  // Changed this line
    totalEarned += referralCount_ * referralBonus;
    totalEarned += userTaskPoints[user];
    feePaid_ = feesPaid[user];
    nextClaimTime_ = lastClaimTime[user] == 0 ? 0 : lastClaimTime[user] + claimCooldown;
}

    function getAllParticipants() external view returns (ParticipantInfo[] memory) {
        uint256 totalParticipants = participantAddresses.length;
        ParticipantInfo[] memory participants = new ParticipantInfo[](totalParticipants);
        
        for (uint256 i = 0; i < totalParticipants; i++) {
            address participant = participantAddresses[i];
            participants[i] = ParticipantInfo({
                userAddress: participant,
                hasParticipated: hasParticipated[participant],
                referralCount: referralCount[participant],
                referrer: referredBy[participant],
                totalEarned: airdropAmount + (referralCount[participant] * referralBonus),
                participationTime: block.timestamp,
                feePaid: feesPaid[participant]
            });
        }
        
        return participants;
    }

    function getTotalParticipants() public view returns (uint256) {
        return participantAddresses.length;
    }

    receive() external payable {}
}