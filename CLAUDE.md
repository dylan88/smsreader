# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SMS Reader is a React-based web application for viewing and searching SMS backups from SMS Backup & Restore XML files. The application uses IndexedDB for local storage and runs entirely in the browser.

## Development Commands

```bash
npm run dev      # Start development server (Vite)
npm run build    # Build for production
npm run preview  # Preview production build
```

## Architecture

### Data Flow
1. **Import**: XML files → `xmlParser.js` → parsed SMS objects → IndexedDB (via Dexie)
2. **Display**: IndexedDB → React components (using `dexie-react-hooks` for live queries)
3. **Search**: In-memory filtering of IndexedDB data

### Key Components

- **App.jsx**: Root component managing application state and conditional rendering based on message count
- **FileImport.jsx**: Handles XML file import via drag-and-drop or file selection
  - Parses multiple XML files concurrently
  - Deduplicates messages using `address-date-body` composite key
  - Stores in IndexedDB using bulk operations
  - Provides data clearing functionality
- **MessageList.jsx**: Displays conversations and messages
  - Groups messages by contact (address)
  - Live queries using `useLiveQuery` hook
  - Search functionality with in-memory filtering
  - "View in context" feature to jump from search results to full conversation

### Database Schema

**db.js** - Dexie database with single `sms` table:
- Primary key: auto-incrementing `id`
- Indexed fields: `address`, `date`, `type`, `body`, `contact_name`, `readable_date`
- Compound index: `[address+date+body]` for deduplication

### XML Parser

**xmlParser.js** contains two main functions:
- `parseXMLFile(xmlContent)`: Parses SMS Backup & Restore XML format into normalized objects
- `removeDuplicates(smsArray)`: Uses Map with composite key `${address}-${date}-${body}` to filter duplicates

### Technology Stack

- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **Dexie**: IndexedDB wrapper with React hooks
- **fast-xml-parser**: XML parsing
- **Tailwind CSS**: Styling

## Important Implementation Details

### Deduplication Strategy
The app deduplicates at two levels:
1. Within imported files (before DB insertion)
2. Against existing DB records (prevents re-importing same messages)

### Message Types
- Type `1`: Received messages (left-aligned, white background)
- Type `2`: Sent messages (right-aligned, blue background)

### Search Implementation
Search is performed client-side by:
1. Fetching all messages from IndexedDB
2. Filtering in JavaScript (body and contact_name fields)
3. Sorting by date descending

The "view in context" feature:
- Sets selected contact to the message's address
- Highlights the message with yellow ring
- Scrolls to message position
- Auto-removes highlight after 3 seconds
