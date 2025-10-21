// Date utility functions for formatting dates as MM-YYYY

/**
 * Formats a date string to MM-YYYY format
 * @param dateString - Date string in various formats
 * @returns Formatted date string in MM-YYYY format
 */
export function formatDateToMMYYYY(dateString: string): string {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // If it's not a valid date, try to parse as MM-YYYY
      const parts = dateString.split('-');
      if (parts.length === 2 && parts[0].length <= 2 && parts[1].length === 4) {
        return dateString; // Already in MM-YYYY format
      }
      return "";
    }
    
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return "";
  }
}

/**
 * Formats a date string to MM-YYYY format for display
 * @param dateString - Date string in various formats
 * @returns Formatted date string in MM-YYYY format
 */
export function formatDateForDisplay(dateString: string): string {
  return formatDateToMMYYYY(dateString);
}

/**
 * Converts MM-YYYY format to a date object for sorting
 * @param mmYYYYString - Date string in MM-YYYY format
 * @returns Date object
 */
export function parseMMYYYYToDate(mmYYYYString: string): Date {
  if (!mmYYYYString) return new Date(0);
  
  try {
    const [month, year] = mmYYYYString.split('-');
    if (month && year) {
      return new Date(parseInt(year), parseInt(month) - 1, 1);
    }
    return new Date(0);
  } catch (error) {
    console.error('Error parsing MM-YYYY date:', error);
    return new Date(0);
  }
}

/**
 * Validates if a string is in MM-YYYY format
 * @param dateString - Date string to validate
 * @returns boolean indicating if the format is valid
 */
export function isValidMMYYYY(dateString: string): boolean {
  if (!dateString) return false;
  
  const regex = /^(0[1-9]|1[0-2])-\d{4}$/;
  return regex.test(dateString);
}

/**
 * Converts a date input value to MM-YYYY format
 * @param dateInputValue - Date input value (YYYY-MM-DD format)
 * @returns MM-YYYY formatted string
 */
export function convertDateInputToMMYYYY(dateInputValue: string): string {
  if (!dateInputValue) return "";
  
  try {
    const date = new Date(dateInputValue);
    if (isNaN(date.getTime())) return "";
    
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${year}`;
  } catch (error) {
    console.error('Error converting date input:', error);
    return "";
  }
}


