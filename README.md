# SMS Reader

A privacy-focused web application for viewing and searching SMS backups from SMS Backup & Restore XML files. All data processing happens entirely in your browser - no server uploads, no data collection.

**[Live Demo](https://smsreader.vercel.app/)**

## Features

- **📱 Import SMS Backups** - Drag and drop XML files from [SMS Backup & Restore](https://play.google.com/store/apps/details?id=com.riteshsahu.SMSBackupRestore)
- **🔍 Full-Text Search** - Search across message content and contact names
- **💬 Conversation View** - Messages grouped by contact with threaded display
- **🔒 Privacy First** - All data stays local in your browser's IndexedDB
- **⚡ Fast Performance** - Handles large SMS archives with ease
- **🎯 Jump to Context** - Click search results to view messages in conversation thread
- **🔢 Phone Number Normalization** - Convert French mobile numbers (6/7xxxxxxx → 336/337xxxxxxx)
- **📦 Multiple File Import** - Import multiple XML files simultaneously with automatic deduplication

## Privacy & Security

SMS Reader is designed with privacy as the top priority:

- **100% Client-Side** - No backend server, no data uploads
- **Offline Capable** - Works without internet after initial load
- **Local Storage Only** - Data stored in browser IndexedDB
- **Open Source** - Full transparency, audit the code yourself
- **No Tracking** - No analytics, no cookies, no data collection

## Getting Started

### Online Usage

1. Visit [https://smsreader.vercel.app/](https://smsreader.vercel.app/)
2. Create SMS backup using [SMS Backup & Restore](https://play.google.com/store/apps/details?id=com.riteshsahu.SMSBackupRestore)
3. Transfer XML file(s) to your computer
4. Drag and drop or select files in SMS Reader

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/smsreader.git
cd smsreader

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## How It Works

### Data Flow

1. **Import**: XML files → Parser → Structured SMS objects → IndexedDB
2. **Display**: IndexedDB → React components (live queries)
3. **Search**: Client-side filtering of indexed data

### Architecture

- **React 18** - Modern UI framework with hooks
- **Vite** - Lightning-fast build tool and dev server
- **Dexie** - IndexedDB wrapper with React integration
- **fast-xml-parser** - Efficient XML parsing
- **Tailwind CSS** - Utility-first styling

### Key Components

- **App.jsx** - Root component managing application state
- **FileImport.jsx** - File handling, parsing, and database operations
- **MessageList.jsx** - Conversation display with live queries and search
- **xmlParser.js** - XML parsing and phone number normalization
- **db.js** - Dexie database schema and configuration

### Message Types

- **Type 1**: Received messages (white background, left-aligned)
- **Type 2**: Sent messages (blue background, right-aligned)

## Supported XML Format

SMS Reader works with XML files exported by **SMS Backup & Restore** app:

```xml
<?xml version='1.0' encoding='UTF-8' standalone='yes' ?>
<smses count="100">
  <sms address="+1234567890"
       date="1609459200000"
       type="1"
       body="Message content"
       contact_name="John Doe"
       readable_date="Jan 1, 2021 12:00:00 AM" />
  <!-- More SMS entries -->
</smses>
```

## Browser Compatibility

- Chrome/Edge 87+
- Firefox 78+
- Safari 14+

Requires IndexedDB support (available in all modern browsers).

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- [SMS Backup & Restore](https://play.google.com/store/apps/details?id=com.riteshsahu.SMSBackupRestore) for the XML backup format
- Built with [React](https://react.dev/), [Vite](https://vitejs.dev/), and [Dexie](https://dexie.org/)

## Support

If you encounter issues or have questions:
- Open an issue on GitHub
- Check existing issues for solutions


