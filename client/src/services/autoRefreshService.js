// Auto-refresh service for real-time data updates
class AutoRefreshService {
  constructor() {
    this.intervals = new Map(); // Store active intervals
    this.subscribers = new Map(); // Store subscribers for each data type
  }

  // Subscribe to auto-refresh updates
  subscribe(componentId, dataType, callback, interval = 30000) {
    // Clear existing interval for this component if it exists
    if (this.intervals.has(componentId)) {
      clearInterval(this.intervals.get(componentId));
    }

    // Store subscriber
    if (!this.subscribers.has(dataType)) {
      this.subscribers.set(dataType, new Map());
    }
    this.subscribers.get(dataType).set(componentId, callback);

    // Set up interval
    const intervalId = setInterval(() => {
      this.refreshDataType(dataType);
    }, interval);

    // Store interval
    this.intervals.set(componentId, intervalId);
  }

  // Unsubscribe from auto-refresh updates
  unsubscribe(componentId) {
    // Clear interval
    if (this.intervals.has(componentId)) {
      clearInterval(this.intervals.get(componentId));
      this.intervals.delete(componentId);
    }

    // Remove subscriber from all data types
    this.subscribers.forEach((subscribers, dataType) => {
      if (subscribers.has(componentId)) {
        subscribers.delete(componentId);
      }
    });
  }

  // Refresh specific data type
  async refreshDataType(dataType) {
    if (this.subscribers.has(dataType)) {
      const subscribers = this.subscribers.get(dataType);
      subscribers.forEach((callback, componentId) => {
        try {
          callback();
        } catch (error) {
          console.error(`Error refreshing ${dataType} for component ${componentId}:`, error);
        }
      });
    }
  }

  // Trigger immediate refresh for all subscribers of a data type
  triggerRefresh(dataType) {
    this.refreshDataType(dataType);
  }

  // Get active subscribers count for a data type
  getSubscriberCount(dataType) {
    if (this.subscribers.has(dataType)) {
      return this.subscribers.get(dataType).size;
    }
    return 0;
  }

  // Clear all intervals and subscribers
  clearAll() {
    this.intervals.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    this.intervals.clear();
    this.subscribers.clear();
  }
}

// Create singleton instance
const autoRefreshService = new AutoRefreshService();

export default autoRefreshService;