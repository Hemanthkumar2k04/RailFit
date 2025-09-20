# 🎨 RailFit Frontend

Modern React + TypeScript frontend for the RailFit Railway Asset Management System.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ with npm
- Modern web browser
- Backend API running

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

**Development Server:** `http://localhost:5173`  
**Backend API:** `http://localhost:8000`

## 📁 Project Structure

```
RailFit_Frontend/
├── src/                       # Source code
│   ├── components/           # Reusable components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── logo.tsx         # RailFit logo
│   │   ├── Navbar.tsx       # Navigation bar
│   │   └── info-menu.tsx    # Menus and dropdowns
│   ├── pages/               # Page components
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── Login.tsx        # Authentication
│   │   ├── Assets/          # Asset management
│   │   ├── Inspections/     # Inspection pages
│   │   ├── Alerts/          # Alert management
│   │   ├── Analytics/       # Analytics dashboard
│   │   └── Settings/        # Settings pages
│   ├── context/             # React contexts
│   │   └── AuthContext.tsx  # Authentication state
│   ├── assets/              # Static assets
│   ├── App.tsx              # Main app component
│   └── main.tsx             # React entry point
├── components.json          # shadcn/ui configuration
├── tailwind.config.js       # Tailwind CSS config
├── vite.config.ts           # Vite configuration
└── package.json             # Dependencies
```

## 🧩 Key Features

### Asset Management
- **Asset List View:** Grid/table with filtering and search
- **Add Asset Modal:** Form with QR code generation
- **Asset Details:** Comprehensive information display
- **Health Indicators:** Visual health score and status

### Inspection System
- **Mobile-friendly Forms:** Touch-optimized data entry
- **Photo Upload:** Image capture for inspections
- **Condition Rating:** 1-5 scale assessment
- **History Timeline:** Asset inspection history

### Alert Management
- **Priority Dashboard:** Color-coded alert system
- **Real-time Notifications:** Instant alert updates
- **Acknowledgment System:** Track alert resolution
- **Smart Filtering:** Filter by priority and type

### Analytics Dashboard
- **Health Trends:** Visual charts and metrics
- **RUL Predictions:** Remaining life forecasting
- **Performance Stats:** Maintenance analytics
- **Export Tools:** Data export capabilities

## 🛠️ Development

### Adding Components
```bash
# Create new component
touch src/components/NewComponent.tsx

# Add UI component from shadcn
npx shadcn-ui@latest add [component-name]
```

### Technology Stack
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling  
- **shadcn/ui** for components
- **React Router** for navigation
- **Axios** for API calls

### Build Commands
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build  
npm run lint         # Code linting
npm run type-check   # TypeScript checking
```

## 🚢 Deployment

### Environment Variables
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Deployment Platforms
- **Vercel:** `vercel --prod`
- **Netlify:** Build command: `npm run build`, Publish: `dist/`
- **GitHub Pages:** Use `gh-pages` package

---

**For complete project documentation, see:** `../README.md`  
**For backend API documentation, see:** `../backend/README.md`
