# SocialConnect - Modern Social Media Platform

A full-featured social media platform built with Next.js, featuring real-time messaging, groups, events, and comprehensive social networking capabilities.

![SocialConnect Banner](https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1200&h=400&fit=crop&crop=center)

## ✨ Features

### 🔐 Authentication & User Management

- **Secure Authentication** - JWT-based authentication system
- **User Profiles** - Customizable profiles with bio, location, and work info
- **Profile Privacy** - Control who can see your information
- **Account Settings** - Comprehensive settings management

### 👥 Social Networking

- **Friend System** - Send/accept friend requests with mutual friends display
- **Friend Suggestions** - AI-powered friend recommendations
- **User Search** - Advanced search with filters and suggestions
- **Profile Viewing** - Rich profile pages with posts, friends, and about sections

### 📝 Posts & Content

- **Rich Post Creation** - Text, images, feelings, and activities
- **Post Interactions** - Like, comment, share, and save functionality
- **Content Feed** - Personalized timeline with trending content
- **Save/Bookmark** - Save posts for later viewing
- **Post Privacy** - Control post visibility (public, friends, private)

### 💬 Real-time Messaging

- **Direct Messages** - One-on-one conversations
- **Real-time Updates** - Instant message delivery with Socket.io
- **Message Status** - Read receipts and online status

### 🏢 Groups & Communities

- **Create Groups** - Public and private group creation
- **Group Management** - Admin and moderator roles
- **Group Discovery** - Browse and search groups by category
- **Group Posts** - Dedicated group timelines
- **Member Management** - Invite, remove, and manage members

### 🎉 Events

- **Event Creation** - Create and manage events
- **Event Discovery** - Browse upcoming and trending events
- **RSVP System** - Join/leave events with attendee management
- **Event Details** - Rich event pages with descriptions and attendee lists
- **Event Reminders** - Notification system for upcoming events

### 📊 Trending & Discovery

- **Trending Posts** - Popular content discovery
- **Trending Events** - Popular upcoming events
- **Trending Groups** - Popular communities
- **Marketplace** - Buy/sell items within the community
- **Hashtag System** - Content categorization and discovery

### 🔔 Notifications

- **Real-time Notifications** - Instant updates for interactions
- **Notification Types** - Friend requests, likes, comments, mentions
- **Notification Settings** - Customize notification preferences
- **Push Notifications** - Browser and mobile notifications

## 🛠️ Tech Stack

### Frontend

- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[React 18](https://reactjs.org/)** - UI library with latest features
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Modern UI component library
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library
- **[React Query](https://tanstack.com/query)** - Data fetching and caching

### Backend & Database

- **[Node.js](https://nodejs.org/)** - JavaScript runtime
- **[MongoDB](https://www.mongodb.com/)** - NoSQL database
- **[Mongoose](https://mongoosejs.com/)** - MongoDB object modeling
- **[Socket.io](https://socket.io/)** - Real-time communication
- **[JWT](https://jwt.io/)** - JSON Web Tokens for authentication

### Development Tools

- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Husky](https://typicode.github.io/husky/)** - Git hooks
- **[Vercel](https://vercel.com/)** - Deployment platform

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB database
- Git

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/AR-Raju/social-media-client.git
   cd socialconnect
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install

   # or

   yarn install
   \`\`\`

3. **Environment Setup**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

4. **Configure environment variables**
   \`\`\`env

   # Database

   MONGODB_URI=mongodb://localhost:27017/socialconnect

   # Authentication

   JWT_SECRET=your-super-secret-jwt-key
   NEXTAUTH_SECRET=your-nextauth-secret
   NEXTAUTH_URL=http://localhost:3000

   # File Upload

   CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-cloudinary-key
   CLOUDINARY_API_SECRET=your-cloudinary-secret

   # Email (Optional)

   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password

   # Socket.io

   SOCKET_URL=http://localhost:3001
   \`\`\`

5. **Start the development server**
   \`\`\`bash
   npm run dev

   # or

   yarn dev
   \`\`\`

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

\`\`\`
socialconnect/
├── app/ # Next.js App Router
│ ├── (auth)/ # Authentication pages
│ │ ├── login/
│ │ └── register/
│ ├── (main)/ # Main application pages
│ │ ├── events/
│ │ ├── friends/
│ │ ├── groups/
│ │ ├── messages/
│ │ ├── notifications/
│ │ ├── profile/
│ │ ├── saved/
│ │ ├── search/
│ │ ├── settings/
│ │ └── trending/
│ ├── api/ # API routes
│ ├── globals.css
│ └── layout.tsx
├── components/ # Reusable components
│ ├── ui/ # shadcn/ui components
│ ├── layout/ # Layout components
│ ├── posts/ # Post-related components
│ ├── friends/ # Friend-related components
│ ├── groups/ # Group-related components
│ ├── events/ # Event-related components
│ ├── messages/ # Messaging components
│ ├── profile/ # Profile components
│ ├── trending/ # Trending components
│ └── modals/ # Modal components
├── context/ # React contexts
│ ├── auth-context.tsx
│ └── socket-context.tsx
├── hooks/ # Custom React hooks
├── lib/ # Utility functions
├── services/ # API services
├── types/ # TypeScript type definitions
├── src/app/modules/ # Backend models
│ ├── user/
│ ├── post/
│ ├── comment/
│ ├── friend/
│ ├── group/
│ ├── event/
│ ├── message/
│ ├── notification/
│ └── reaction/
└── public/ # Static assets
\`\`\`

## 🔧 Development

### Available Scripts

\`\`\`bash

# Development

npm run dev # Start development server
npm run build # Build for production
npm run start # Start production server
npm run lint # Run ESLint
npm run type-check # Run TypeScript checks

# Database

npm run db:seed # Seed database with sample data
npm run db:reset # Reset database
npm run db:migrate # Run database migrations
\`\`\`

### Code Style

This project uses ESLint and Prettier for code formatting:

\`\`\`bash
npm run lint # Check for linting errors
npm run lint:fix # Fix linting errors
npm run format # Format code with Prettier
\`\`\`

### Git Hooks

Pre-commit hooks are set up with Husky to ensure code quality:

- Runs ESLint and TypeScript checks
- Formats code with Prettier
- Runs tests (if available)

## 🌐 API Documentation

### Authentication Endpoints

\`\`\`typescript
POST /api/auth/register # User registration
POST /api/auth/login # User login
POST /api/auth/logout # User logout
GET /api/auth/me # Get current user
PUT /api/auth/profile # Update profile
\`\`\`

### Posts Endpoints

\`\`\`typescript
GET /api/posts # Get posts feed
POST /api/posts # Create new post
GET /api/posts/[id] # Get specific post
PUT /api/posts/[id] # Update post
DELETE /api/posts/[id] # Delete post
POST /api/posts/[id]/like # Like/unlike post
POST /api/posts/[id]/save # Save/unsave post
\`\`\`

### Friends Endpoints

\`\`\`typescript
GET /api/friends # Get friends list
POST /api/friends/request # Send friend request
PUT /api/friends/[id]/accept # Accept friend request
DELETE /api/friends/[id] # Remove friend
GET /api/friends/suggestions # Get friend suggestions
\`\`\`

### Groups Endpoints

\`\`\`typescript
GET /api/groups # Get user's groups
POST /api/groups # Create new group
GET /api/groups/[id] # Get group details
PUT /api/groups/[id] # Update group
DELETE /api/groups/[id] # Delete group
POST /api/groups/[id]/join # Join group
POST /api/groups/[id]/leave # Leave group
\`\`\`

### Events Endpoints

\`\`\`typescript
GET /api/events # Get events
POST /api/events # Create new event
GET /api/events/[id] # Get event details
PUT /api/events/[id] # Update event
DELETE /api/events/[id] # Delete event
POST /api/events/[id]/join # Join event
POST /api/events/[id]/leave # Leave event
\`\`\`

## 🔒 Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env

# Required

MONGODB_URI=mongodb://localhost:27017/socialconnect
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# File Upload (Cloudinary)

CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret

# Email Service (Optional)

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Real-time Features

SOCKET_URL=http://localhost:3001

# Analytics (Optional)

GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
\`\`\`

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy automatically on push to main branch**

\`\`\`bash
npm i -g vercel
vercel --prod
\`\`\`

### Docker

\`\`\`dockerfile

# Dockerfile included in project

docker build -t socialconnect .
docker run -p 3000:3000 socialconnect
\`\`\`

### Manual Deployment

\`\`\`bash
npm run build
npm run start
\`\`\`

## 🧪 Testing

\`\`\`bash
npm run test # Run all tests
npm run test:watch # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run test:e2e # Run end-to-end tests
\`\`\`

## 📱 Mobile Support

SocialConnect is fully responsive and works great on:

- 📱 Mobile devices (iOS/Android)
- 📱 Tablets
- 💻 Desktop computers
- 🖥️ Large screens

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   \`\`\`bash
   git checkout -b feature/amazing-feature
   \`\`\`
3. **Make your changes**
4. **Run tests and linting**
   \`\`\`bash
   npm run lint
   npm run type-check
   npm run test
   \`\`\`
5. **Commit your changes**
   \`\`\`bash
   git commit -m 'Add amazing feature'
   \`\`\`
6. **Push to your branch**
   \`\`\`bash
   git push origin feature/amazing-feature
   \`\`\`
7. **Open a Pull Request**

### Code Guidelines

- Use TypeScript for type safety
- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Vercel](https://vercel.com/) for hosting and deployment
- All the amazing open-source contributors

## 📞 Support

- 📧 Email: support@socialconnect.com
- 💬 Discord: [Join our community](https://discord.gg/socialconnect)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/socialconnect/issues)
- 📖 Documentation: [docs.socialconnect.com](https://docs.socialconnect.com)

## 🗺️ Roadmap

### Version 2.0

- [ ] Mobile app (React Native)
- [ ] Video calling integration
- [ ] Advanced analytics dashboard
- [ ] AI-powered content recommendations
- [ ] Multi-language support

### Version 2.1

- [ ] Stories feature
- [ ] Live streaming
- [ ] Advanced group permissions
- [ ] Marketplace enhancements
- [ ] Integration with external services

---

**Made with ❤️ by the Asikur Rahman**

⭐ **Star this repo if you find it helpful!**
