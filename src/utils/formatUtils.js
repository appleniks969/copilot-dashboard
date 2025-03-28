/**
 * formatUtils.js
 * Utility functions for formatting values
 */

// Format number with commas
export const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Format number to percentage
export const formatPercentage = (num) => {
  if (num === undefined || num === null) return '0%';
  return `${Math.round(num * 100) / 100}%`;
};

// Format number to currency
export const formatCurrency = (num) => {
  if (num === undefined || num === null) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
};