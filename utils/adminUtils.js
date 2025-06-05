/**
 * Admin utility functions for managing multiple admin addresses
 */

// Legacy functions for backward compatibility
// These are now handled by AdminContext but kept for any remaining usage

// Get all admin addresses from environment variables (legacy)
export const getAdminAddresses = () => {
  const adminAddresses = process.env.NEXT_PUBLIC_ADMIN_ADDRESSES;
  if (!adminAddresses) {
    // Fallback to single admin address
    const singleAdmin = process.env.NEXT_PUBLIC_ADMIN_ADDRESS;
    return singleAdmin ? [singleAdmin] : [];
  }

  return adminAddresses
    .split(',')
    .map(address => address.trim())
    .filter(address => address.length > 0);
};

// Validate admin address format
export const isValidAdminAddress = (address) => {
  if (!address) return false;
  
  // Basic Ethereum address validation
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethAddressRegex.test(address);
};

// Format address for display (shortened)
export const formatAdminAddress = (address) => {
  if (!address) return '';
  
  if (address.length <= 10) return address;
  
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Admin permissions - you can extend this for more granular control
export const getAdminPermissions = (address) => {
  // Get admin addresses from environment (fallback method)
  const adminAddresses = getAdminAddresses();
  const isAdminAddress = adminAddresses.some(admin =>
    admin.toLowerCase() === address?.toLowerCase()
  );
  const isPrimary = adminAddresses.length > 0 &&
    adminAddresses[0].toLowerCase() === address?.toLowerCase();

  return {
    // Contract functions that require owner
    canWithdrawTokens: isPrimary,
    canWithdrawFees: isPrimary,
    canTransferOwnership: isPrimary,

    // Functions that all admins can do (through primary admin's account)
    canSetFeeAmount: isAdminAddress,
    canSetFeeCollector: isAdminAddress,
    canSetClaimCooldown: isAdminAddress,
    canCreateTasks: isAdminAddress,
    canUpdateTasks: isAdminAddress,
    canSetTaskStatus: isAdminAddress,
    canSetAirdropAmount: isAdminAddress,
    canSetReferralBonus: isAdminAddress,
    canViewAdminPanel: isAdminAddress,

    // Display permissions
    canViewAllStats: isAdminAddress,
    canViewParticipants: isAdminAddress
  };
};

// Check if user has specific permission
export const hasPermission = (address, permission) => {
  const permissions = getAdminPermissions(address);
  return permissions[permission] || false;
};

export default {
  getAdminAddresses,
  getAdminPermissions,
  hasPermission
};
