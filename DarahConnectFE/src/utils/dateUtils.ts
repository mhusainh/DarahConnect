/**
 * Date utilities for DarahConnect
 * Handles proper date formatting for backend API compatibility
 */

export const formatDateForBackend = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    // Create a date object from the datetime-local input
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date string:', dateString);
      return '';
    }
    
    // Format to include timezone offset (e.g., +07:00 for Jakarta)
    const offset = -date.getTimezoneOffset();
    const offsetHours = Math.floor(offset / 60);
    const offsetMinutes = offset % 60;
    const sign = offset >= 0 ? '+' : '-';
    const formattedOffset = `${sign}${Math.abs(offsetHours).toString().padStart(2, '0')}:${Math.abs(offsetMinutes).toString().padStart(2, '0')}`;
    
    // Format: YYYY-MM-DDTHH:mm:ss+HH:mm
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = '00'; // Default seconds to 00
    
    const formatted = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${formattedOffset}`;
    
    console.log('🕐 Date formatting debug:');
    console.log('  Input:', dateString);
    console.log('  Parsed Date:', date.toISOString());
    console.log('  Timezone Offset:', offset, 'minutes');
    console.log('  Formatted Output:', formatted);
    
    return formatted;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date for display:', error);
    return dateString;
  }
};

export const isValidDateTime = (dateString: string): boolean => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

export const isDateInFuture = (dateString: string): boolean => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  const now = new Date();
  
  return date > now;
};

// Example formats that backend expects
export const EXPECTED_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss+HH:mm';
export const EXAMPLE_FORMATTED_DATE = '2025-07-09T14:12:00+07:00';

export const calculateAge = (birthDate: string): number => {
  const birth = new Date(birthDate);
  const today = new Date();
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

export default {
  formatDateForBackend,
  formatDateForDisplay,
  isValidDateTime,
  isDateInFuture,
  EXPECTED_DATE_FORMAT,
  EXAMPLE_FORMATTED_DATE
}; 