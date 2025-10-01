// Utility functions for preloading route components

export const preloadDashboard = () => import('../pages/Dashboard')
export const preloadAssets = () => import('../pages/Assets/AssetList')
export const preloadInspections = () => import('../pages/Inspections/InspectionList')
export const preloadAnalytics = () => import('../pages/Analytics/AIAnalytics')
export const preloadAlerts = () => import('../pages/Alerts/AlertList')

// Preload commonly accessed routes after initial load
export const preloadCommonRoutes = () => {
  // Use requestIdleCallback to preload during browser idle time
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      preloadAssets()
      preloadInspections()
    })
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      preloadAssets()
      preloadInspections()
    }, 1000)
  }
}
