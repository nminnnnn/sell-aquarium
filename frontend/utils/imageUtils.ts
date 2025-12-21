/**
 * Image URL Helper
 * Converts relative image paths to absolute URLs for backend images
 */

const BACKEND_URL = 'http://localhost:8000';

/**
 * Converts image path to full URL
 * - Absolute URLs (http://...) are returned as is
 * - Relative paths starting with /uploads/ are converted to backend URL
 * - Other relative paths (like /img/...) are returned as is (served by frontend)
 */
export const getImageUrl = (imagePath: string | undefined | null): string => {
  if (!imagePath) return '';
  
  // If already absolute URL (http:// or https://), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If relative path starting with /uploads/, convert to backend URL
  if (imagePath.startsWith('/uploads/')) {
    return `${BACKEND_URL}${imagePath}`;
  }
  
  // Other relative paths (like /img/...) return as is (served by frontend)
  return imagePath;
};

