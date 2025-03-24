// Format date to YYYY-MM-DD
export const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

// Get date range based on days
export const getDateRange = (days) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);
  
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
};

// Calculate number of days between two dates
export const getDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const differenceInTime = end.getTime() - start.getTime();
  return Math.ceil(differenceInTime / (1000 * 3600 * 24));
};

// Format number with commas
export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Format number to percentage
export const formatPercentage = (num) => {
  return `${Math.round(num * 100) / 100}%`;
};

// Format number to currency
export const formatCurrency = (num) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
};

// Transform raw API data into chart-ready format
export const transformDataForCharts = (data, type) => {
  switch (type) {
    case 'userEngagement':
      return [
        { name: 'Active Users', value: data.active_users },
        { name: 'Accepted Suggestions', value: data.accepted_suggestions },
        { name: 'Total Suggestions', value: data.total_suggestions },
      ];
    case 'acceptanceRate':
      return [
        { name: 'Accepted', value: data.accepted_suggestions },
        { name: 'Rejected', value: data.total_suggestions - data.accepted_suggestions },
      ];
    case 'languageBreakdown':
      return Object.entries(data.language_breakdown || {}).map(([lang, count]) => ({
        name: lang,
        value: count,
      }));
    case 'editorBreakdown':
      return Object.entries(data.editor_breakdown || {}).map(([editor, count]) => ({
        name: editor,
        value: count,
      }));
    default:
      return [];
  }
};

// Sort array by specific key
export const sortByKey = (array, key, ascending = true) => {
  return [...array].sort((a, b) => {
    if (ascending) {
      return a[key] - b[key];
    } else {
      return b[key] - a[key];
    }
  });
};