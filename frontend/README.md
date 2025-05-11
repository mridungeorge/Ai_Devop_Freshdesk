# DevOps Platform Frontend

A modern React frontend for the DevOps Platform.

## Features

- React + TypeScript + Vite for fast development
- Tailwind CSS for styling
- shadcn/ui component library
- Responsive design
- Dark/light mode support
- Authentication via Supabase
- Real-time data with React Query

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file in the root directory based on `.env.example` with the following variables:

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_BASE_URL=http://localhost:8080/api
VITE_ENABLE_AI_FEATURES=true
VITE_APP_VERSION=1.0.0
```

## Docker

The project includes Docker support for containerization:

```bash
# Build and run with Docker
docker build -t devops-platform-frontend .
docker run -p 5173:80 devops-platform-frontend
```

## Project Structure

```
src/
├── components/    # Reusable UI components
├── contexts/      # React context providers
├── hooks/         # Custom React hooks
├── lib/           # Utility functions and libraries
├── pages/         # Application pages/views
├── App.tsx        # Main application component
└── main.tsx       # Application entry point
```
