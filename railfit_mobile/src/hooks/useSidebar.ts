import { useState } from 'react';

export const useSidebar = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const openSidebar = () => setSidebarVisible(true);
  const closeSidebar = () => setSidebarVisible(false);
  const toggleSidebar = () => setSidebarVisible(prev => !prev);

  return {
    sidebarVisible,
    openSidebar,
    closeSidebar,
    toggleSidebar,
  };
};

export default useSidebar;