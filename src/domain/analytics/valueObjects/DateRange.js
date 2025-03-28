/**
 * DateRange.js
 * Value object that represents a date range for analytics
 * Encapsulates all date-related operations
 */

export class DateRange {
  constructor(startDate, endDate) {
    this.startDate = startDate instanceof Date ? startDate : new Date(startDate);
    this.endDate = endDate instanceof Date ? endDate : new Date(endDate);
    
    // Validate the date range
    if (this.startDate > this.endDate) {
      throw new Error('Start date cannot be after end date');
    }
  }

  // Get number of days in the range
  get days() {
    const differenceInTime = this.endDate.getTime() - this.startDate.getTime();
    return Math.ceil(differenceInTime / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates
  }

  // Format dates to YYYY-MM-DD for API requests
  get formattedStartDate() {
    return this.formatDate(this.startDate);
  }

  get formattedEndDate() {
    return this.formatDate(this.endDate);
  }

  // Check if a given date is within range
  contains(date) {
    const checkDate = date instanceof Date ? date : new Date(date);
    return checkDate >= this.startDate && checkDate <= this.endDate;
  }

  // Format a date to YYYY-MM-DD
  formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  // Create a date range from a number of days back from today
  static fromDaysAgo(days) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days + 1);
    return new DateRange(startDate, endDate);
  }

  // Create a date range from a predefined range identifier
  static fromRangeIdentifier(identifier) {
    switch (identifier) {
      case '1 day':
        return DateRange.fromDaysAgo(1);
      case '7 days':
        return DateRange.fromDaysAgo(7);
      case '14 days':
        return DateRange.fromDaysAgo(14);
      case '28 days':
      default:
        return DateRange.fromDaysAgo(28);
    }
  }
}