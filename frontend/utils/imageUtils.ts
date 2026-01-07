/**
 * Utility function to construct full image URL from image path
 * Handles both absolute URLs (http/https) and relative paths
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export function getImageUrl(imagePath: string | undefined | null): string {
  // Return empty string if no image path
  if (!imagePath) return '';
  
  // If already an absolute URL (starts with http:// or https://), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If starts with /, it's already a root-relative path, just prepend API base
  if (imagePath.startsWith('/')) {
    return `${API_BASE_URL}${imagePath}`;
  }
  
  // Otherwise, it's a relative path, add / if needed
  const needsSlash = imagePath.startsWith('/') ? '' : '/';
  return `${API_BASE_URL}${needsSlash}${imagePath}`;
}

