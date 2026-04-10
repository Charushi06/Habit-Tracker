import { useEffect } from 'react';

/**
 * Custom hook to dynamically update the document title.
 * Automatically appends ' | Habit Tracker' to the provided title.
 * @param title - The page-specific title to display
 */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `${title} | Habit Tracker`;

    // Cleanup: restore original title when component unmounts or title changes
    return () => {
      document.title = originalTitle;
    };
  }, [title]);
}
