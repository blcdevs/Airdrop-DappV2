import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [adminAddresses, setAdminAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Storage keys
  const ADMIN_STORAGE_KEY = 'airdrop_admin_addresses';
  const ADMIN_VERSION_KEY = 'airdrop_admin_version';
  const CURRENT_VERSION = '1.0';

  // Initialize admin addresses from localStorage and environment
  useEffect(() => {
    initializeAdmins();
  }, []);

  const initializeAdmins = () => {
    try {
      // Get environment admins (fallback)
      const envAdmins = getEnvAdmins();
      
      // Check if we have stored admins
      const storedAdmins = localStorage.getItem(ADMIN_STORAGE_KEY);
      const storedVersion = localStorage.getItem(ADMIN_VERSION_KEY);
      
      if (storedAdmins && storedVersion === CURRENT_VERSION) {
        // Use stored admins
        const parsedAdmins = JSON.parse(storedAdmins);
        setAdminAddresses(parsedAdmins);
      } else {
        // Initialize with environment admins
        setAdminAddresses(envAdmins);
        saveAdminsToStorage(envAdmins);
      }
    } catch (error) {
      console.error('Error initializing admins:', error);
      // Fallback to environment admins
      const envAdmins = getEnvAdmins();
      setAdminAddresses(envAdmins);
    } finally {
      setIsLoading(false);
    }
  };

  const getEnvAdmins = () => {
    const envAdminAddresses = process.env.NEXT_PUBLIC_ADMIN_ADDRESSES;
    const singleAdmin = process.env.NEXT_PUBLIC_ADMIN_ADDRESS;
    
    if (envAdminAddresses) {
      return envAdminAddresses
        .split(',')
        .map(address => address.trim())
        .filter(address => address.length > 0);
    } else if (singleAdmin) {
      return [singleAdmin];
    }
    
    return [];
  };

  const saveAdminsToStorage = (admins) => {
    try {
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admins));
      localStorage.setItem(ADMIN_VERSION_KEY, CURRENT_VERSION);
    } catch (error) {
      console.error('Error saving admins to storage:', error);
    }
  };

  const addAdmin = (address) => {
    if (!address || !isValidAddress(address)) {
      throw new Error('Invalid admin address');
    }

    const normalizedAddress = address.trim();
    
    // Check if admin already exists
    if (adminAddresses.some(admin => admin.toLowerCase() === normalizedAddress.toLowerCase())) {
      throw new Error('Admin address already exists');
    }

    const updatedAdmins = [...adminAddresses, normalizedAddress];
    setAdminAddresses(updatedAdmins);
    saveAdminsToStorage(updatedAdmins);
    
    return true;
  };

  const removeAdmin = (address) => {
    if (!address) {
      throw new Error('Address is required');
    }

    // Prevent removing the primary admin (first in list)
    if (adminAddresses.length > 0 && adminAddresses[0].toLowerCase() === address.toLowerCase()) {
      throw new Error('Cannot remove the primary admin (contract owner)');
    }

    const updatedAdmins = adminAddresses.filter(
      admin => admin.toLowerCase() !== address.toLowerCase()
    );
    
    if (updatedAdmins.length === adminAddresses.length) {
      throw new Error('Admin address not found');
    }

    setAdminAddresses(updatedAdmins);
    saveAdminsToStorage(updatedAdmins);
    
    return true;
  };

  const isAdmin = (address) => {
    if (!address) return false;
    return adminAddresses.some(admin => admin.toLowerCase() === address.toLowerCase());
  };

  const isPrimaryAdmin = (address) => {
    if (!address || adminAddresses.length === 0) return false;
    return adminAddresses[0].toLowerCase() === address.toLowerCase();
  };

  const getPrimaryAdmin = () => {
    return adminAddresses.length > 0 ? adminAddresses[0] : null;
  };

  const getAdminRole = (address) => {
    if (!address) return null;
    
    if (isPrimaryAdmin(address)) {
      return 'Primary Admin (Contract Owner)';
    } else if (isAdmin(address)) {
      return 'Admin';
    }
    
    return null;
  };

  const getAdminList = () => {
    return adminAddresses.map((address, index) => ({
      address,
      role: index === 0 ? 'Primary Admin (Contract Owner)' : 'Admin',
      isPrimary: index === 0
    }));
  };

  const resetToEnvAdmins = () => {
    const envAdmins = getEnvAdmins();
    setAdminAddresses(envAdmins);
    saveAdminsToStorage(envAdmins);
    return envAdmins;
  };

  const isValidAddress = (address) => {
    if (!address) return false;
    // Basic Ethereum address validation
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethAddressRegex.test(address.trim());
  };

  const formatAddress = (address) => {
    if (!address) return '';
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const value = {
    // State
    adminAddresses,
    isLoading,
    
    // Admin management
    addAdmin,
    removeAdmin,
    resetToEnvAdmins,
    
    // Admin checks
    isAdmin,
    isPrimaryAdmin,
    getPrimaryAdmin,
    getAdminRole,
    getAdminList,
    
    // Utilities
    isValidAddress,
    formatAddress
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};
