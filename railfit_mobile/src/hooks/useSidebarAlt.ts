import { useState } from 'react';

export const useSidebar = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const closeSidebar = () => {
    setSidebarVisible(false);
  };

  const openSidebar = () => {
    setSidebarVisible(true);
  };

  return {
    sidebarVisible,
    toggleSidebar,
    closeSidebar,
    openSidebar,
    setSidebarVisible,
  };
};