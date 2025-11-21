# UI Refactor: Centralized Data Export & Dashboard Cleanup

## 🚀 Summary
This update refactors the data export workflow. It moves the export functionality out of the main Dashboard to declutter the UI and centralizes it within the Progress view, adding support for multiple file formats (JSON, CSV, PDF) via a unified modal.

## 📦 File Changes

### 1. Dashboard Cleanup (`src/components/Dashboard.tsx`)
- **Removed:** The "Export Data" button from the "Today's Habits" header.
- **Removed:** The `ExportModal` import and its associated state (`showExportModal`).
- **Impact:** The Dashboard is now strictly focused on daily habit tracking and management.

### 2. Progress View Integration (`src/components/ProgressView.tsx`)
- **Refactored:** Removed the individual JSON/CSV/PDF buttons from the "Habit Statistics" card header.
- **Added:** A primary "Export Data" action button at the bottom of the view.
- **Logic:** Imported `ExportModal` and wired it to the existing export logic functions (`exportData` for JSON/CSV and `exportPDF`).

### 3. Export Modal Upgrade (`src/components/ExportModal.tsx`)
- **Props Update:** Updated interface to accept `onExportJSON`, `onExportCSV`, and `onExportPDF` callbacks.
- **UI Overhaul:** - Replaced the single "Export PDF" button in the preview pane with a selection menu.
  - Added distinct buttons with icons for JSON, CSV, and PDF formats.
  - Added logic to trigger the specific export function based on the user's selection and close the modal.