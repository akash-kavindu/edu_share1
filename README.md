# Edu Share - Student Group Chat Application

A modern React-based group chat application for students to share school notes, chat, and share images. Built with React, Supabase, and TailwindCSS.

## Features

- 🔐 **Authentication**: Email/password sign up and login
- 💬 **Real-time Chat**: Live messaging with Supabase subscriptions
- 📸 **Image Sharing**: Upload and share images in chat
- 👥 **Online Users**: See who's currently online
- 📱 **Responsive Design**: Mobile-first design with desktop sidebar
- 🌙 **Dark/Light Mode**: Toggle between themes
- ⚡ **Real-time Updates**: Messages and online status update instantly

## Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS
- **Backend**: Supabase (Authentication, Database, Storage, Realtime)
- **Icons**: Lucide React
- **Routing**: React Router DOM

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Supabase database**:
   - Follow the instructions in [DATABASE_SETUP.md](./DATABASE_SETUP.md)
   - Create the required tables and storage bucket

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** to `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React context providers
│   ├── AuthContext.jsx # Authentication state management
│   └── ThemeContext.jsx # Dark/light mode state
├── pages/              # Main application pages
│   ├── Login.jsx       # Login page
│   ├── SignUp.jsx      # Registration page
│   └── Chat.jsx        # Main chat interface
├── utils/              # Utility functions
│   └── supabase.js     # Supabase configuration
├── App.jsx             # Main application component
├── main.jsx            # Application entry point
└── index.css           # Global styles with TailwindCSS
```

## Database Schema

### Messages Table
- `id`: UUID primary key
- `content`: Message text or image URL
- `user_id`: User who sent the message
- `user_email`: User's email
- `user_name`: Display name
- `message_type`: 'text' or 'image'
- `created_at`: Timestamp

### Online Users Table
- `id`: User ID (UUID)
- `email`: User's email
- `full_name`: Display name
- `last_seen`: Last activity timestamp

## Features in Detail

### Authentication
- Secure email/password authentication via Supabase Auth
- Automatic session management
- Protected routes

### Real-time Chat
- Live message updates using Supabase subscriptions
- Message history persistence
- User identification and timestamps

### Image Sharing
- Upload images to Supabase Storage
- Automatic image compression and validation
- Public URL generation for sharing

### Responsive Design
- Mobile-first approach
- Desktop sidebar for online users
- Collapsible mobile navigation

### Dark Mode
- System preference detection
- Manual toggle
- Persistent theme selection

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

## Configuration

The application is pre-configured with Supabase credentials. No additional environment setup is required.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
