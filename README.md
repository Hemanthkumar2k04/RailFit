# 🚆 RailFIT - Web Application Frontend

**Smart India Hackathon 2025 Project**  
*Modern React Web Dashboard for Railway Asset Management*

---

## 📋 Project Overview

This is the **frontend web application** for RailFIT - a comprehensive railway asset management system developed for Smart India Hackathon 2025. The web app provides a modern, responsive dashboard interface for managing railway infrastructure assets with AI-powered insights.

### 🎯 Key Features
- *### **Frontend Learning Resources**

### **React + TypeScript**
- [React 19 Documentation](https://react.dev/) - Latest React features and patterns
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Type system mastery
- [React Router v7](https://reactrouter.com/) - Modern routing patterns

### **Build Tools & Development**
- [Vite Documentation](https://vitejs.dev/) - Fast build tool configuration
- [ESLint Configuration](https://eslint.org/) - Code quality rules
- [Prettier Setup](https://prettier.io/) - Code formatting standards

### **Styling & UI Design**
- [Tailwind CSS v4](https://tailwindcss.com/docs) - Utility-first CSS framework
- [shadcn/ui Components](https://ui.shadcn.com/) - Component library usage
- [Lucide Icons](https://lucide.dev/) - Icon library reference
- [Figma Design System](https://www.figma.com/) - UI/UX design principlessset Tracking** - Unique identification for all railway assets
- **AI-Powered RUL Prediction** - Remaining Useful Life calculations using SAT algorithm
- **Real-time Health Monitoring** - Live status tracking and alerts
- **Role-based Access Control** - Admin, Manager, and Field Inspector roles
- **Mobile-first Design** - Optimized for field operations
- **Predictive Maintenance** - Proactive maintenance scheduling
- **Comprehensive Analytics** - Performance insights and trends

---

## 🏗️ Frontend Web Application Structure

```
RailFit_Frontend/             # React Web Application
├── public/                   # Static assets & favicon
│   ├── favicon.ico          # Railway-themed favicon
│   ├── placeholder.svg      # Placeholder images
│   └── robots.txt          # SEO configuration
│
├── src/                     # Source code
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui component library
│   │   ├── Navbar.tsx      # Navigation bar
│   │   └── user-menu.tsx   # User profile dropdown
│   │
│   ├── pages/              # Page-level components
│   │   ├── Dashboard.tsx   # Main dashboard page
│   │   ├── Login.tsx       # Authentication page
│   │   ├── Register.tsx    # User registration
│   │   ├── Assets/         # Asset management pages
│   │   ├── Analytics/      # AI analytics dashboard
│   │   ├── Inspections/    # Inspection management
│   │   ├── Alerts/         # Alert notifications
│   │   └── Settings/       # User & system settings
│   │
│   ├── context/            # React Context providers
│   │   └── AuthContext.tsx # Authentication state management
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── use-mobile.tsx  # Mobile detection hook
│   │   └── use-toast.ts    # Toast notification hook
│   │
│   ├── lib/                # Utility libraries
│   │   ├── utils.ts        # Helper functions
│   │   └── supabase.ts     # Database client config
│   │
│   ├── services/           # API service layer
│   │   └── api.ts          # HTTP client & API calls
│   │
│   ├── App.tsx             # Main app component & routing
│   ├── main.tsx            # React app entry point
│   └── index.css           # Global styles & Tailwind
│
├── package.json            # Dependencies & scripts
├── tailwind.config.js      # Tailwind CSS configuration
├── vite.config.ts          # Vite build tool config
└── tsconfig.json           # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

### 🔧 Web Application Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/KeerthanaShreeVenugopal/SIH.git
   cd SIH/RailFit_Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   
   The app will be available at: `http://localhost:5173`

4. **Build for production:**
   ```bash
   npm run build
   # or
   yarn build
   ```

5. **Preview production build:**
   ```bash
   npm run preview
   # or
   yarn preview
   ```

---

## 🎨 Web Application Technology Stack

### **Frontend Framework & Tools**
- **React 19** - Modern UI framework with latest features
- **TypeScript** - Type-safe JavaScript for better development
- **Vite** - Lightning-fast build tool and dev server
- **React Router v7** - Client-side routing and navigation

### **Styling & UI Components**
- **Tailwind CSS v4** - Utility-first CSS framework (latest version)
- **shadcn/ui** - Premium component library with accessibility
- **Lucide React** - Beautiful, consistent icon library
- **CSS Custom Properties** - Dynamic theming support

### **State Management & Utils**
- **React Context API** - Global state management (Auth)
- **React Hooks** - Modern state and lifecycle management
- **LocalStorage** - Client-side data persistence
- **Custom Hooks** - Reusable logic patterns

### **🎨 Indian Railways Design System**

The entire application follows Indian Railways branding guidelines:

- **Primary Color**: `#003f7f` (Indian Railways Blue)
- **Success**: `#16a34a` (Operational Green)  
- **Warning**: `#ca8a04` (Maintenance Yellow)
- **Danger**: `#dc2626` (Critical Red)
- **Gray**: `#64748b` (Railway Gray)

---

## 📱 Application Architecture

### **Authentication System**
- **Role-based Access**: Admin, Manager, Field Inspector
- **Persistent Sessions**: LocalStorage-based session management
- **Protected Routes**: Route guards for authenticated users
- **Demo Accounts**: Pre-configured test accounts

**Demo Login Credentials:**
```
Admin: admin@railway.gov.in / password123
Manager: manager@railway.gov.in / password123
Inspector: inspector@railway.gov.in / password123
```

### **Page Structure & Functionality**

#### 🏠 **Dashboard** (`/dashboard`)
- **Real-time Metrics**: Asset counts, operational status, alerts
- **Health Distribution**: Visual breakdown of asset conditions
- **AI Predictions**: SAT algorithm insights and RUL forecasts
- **Live Monitoring**: Railway zone status and system uptime
- **Quick Actions**: Fast access to common tasks

#### 🏭 **Asset Management** (`/assets`)
- **Asset List**: Filterable grid of all railway assets
- **Asset Details**: Detailed view with QR codes and maintenance history
- **Health Scoring**: AI-calculated asset condition ratings
- **Maintenance Scheduling**: Planned and predictive maintenance

#### 🔍 **Inspection Management** (`/inspections`)
- **Inspection List**: All scheduled and completed inspections
- **Photo Galleries**: Visual documentation of asset conditions
- **GPS Integration**: Location-based inspection tracking
- **Checklist System**: Standardized inspection procedures

#### 📊 **AI Analytics** (`/analytics`)
- **SAT Algorithm Dashboard**: Predictive analytics showcase
- **Performance Trends**: Historical data analysis
- **RUL Predictions**: Remaining Useful Life forecasting
- **Efficiency Metrics**: System optimization insights

#### 🚨 **Alert Management** (`/alerts`)
- **Real-time Alerts**: Critical system notifications
- **Priority Levels**: Categorized alert severity
- **Notification System**: Multi-channel alert delivery
- **Alert History**: Complete alert audit trail

#### ⚙️ **Settings & User Management** (`/settings`)
- **User Administration**: Role and permission management
- **System Configuration**: Application settings
- **Integration Panels**: Third-party system connections
- **Audit Logs**: System activity tracking

---

## 🧩 Component Architecture

### **Core Components**

#### **Navbar** (`/components/Navbar.tsx`)
```typescript
// Features:
- Railway branding with logo
- Role-based navigation menu
- User profile dropdown
- Responsive mobile design
- Logout functionality
```

#### **AuthContext** (`/context/AuthContext.tsx`)
```typescript
// Features:
- JWT token management
- Role-based permissions
- Persistent authentication
- Loading state management
- Demo user accounts
```

#### **UI Components** (`/components/ui/`)
```typescript
// shadcn/ui Components:
- Button, Card, Badge, Alert
- Form, Input, Select, Textarea
- Dialog, Sheet, Popover, Tooltip
- Table, Pagination, Tabs
- All styled with Indian Railways theme
```

### **Utility Libraries**

#### **Tailwind Configuration** (`tailwind.config.js`)
```javascript
// Custom Railway Theme:
- Indian Railways color palette
- Custom fonts and spacing
- Component-specific styles
- Responsive breakpoints
```

#### **Utils** (`/lib/utils.ts`)
```typescript
// Helper Functions:
- Class name merging (cn)
- Date formatting
- Number formatting
- Validation helpers
```

---

## 🔄 Development Workflow

### **Feature Development Process**
1. **Create Feature Branch**: `git checkout -b feature/asset-management`
2. **Develop Components**: Build reusable TypeScript components
3. **Add Routing**: Update React Router configuration
4. **Style Components**: Apply Indian Railways design system
5. **Test Integration**: Verify component interactions
6. **Create Pull Request**: Submit for team review

### **Code Standards**
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Automatic code formatting
- **Component Structure**: Functional components with hooks
- **CSS**: Tailwind utility classes only

### **Testing Strategy**
- **Unit Tests**: Component-level testing
- **Integration Tests**: Page-level user flows
- **E2E Tests**: Full application scenarios
- **Performance Tests**: Load testing for railway scale

---

## 🚄 Key Features Implementation

### **QR Code System**
```typescript
// Asset QR Generation:
- Unique asset identifiers
- Embedded metadata
- Mobile scanning capability
- Offline mode support
```

### **AI/ML Integration**
```python
# SAT Algorithm (Remaining Useful Life):
- Sensor data analysis
- Predictive modeling
- Maintenance optimization
- Performance forecasting
```

### **Real-time Monitoring**
```typescript
// Live Updates:
- WebSocket connections
- Real-time alerts
- Status notifications
- Performance dashboards
```

---

## 📊 Data Models

### **Asset Schema**
```typescript
interface Asset {
  id: string
  name: string
  type: 'locomotive' | 'track' | 'signal' | 'electrical'
  location: string
  health_score: number
  last_inspection: Date
  next_maintenance: Date
  qr_code: string
  status: 'operational' | 'maintenance' | 'critical'
}
```

### **User Schema**
```typescript
interface User {
  id: string
  email: string
  role: 'admin' | 'manager' | 'field_inspector'
  name: string
  department: string
  permissions: string[]
}
```

### **Inspection Schema**
```typescript
interface Inspection {
  id: string
  asset_id: string
  inspector_id: string
  date: Date
  status: 'completed' | 'pending' | 'in_progress'
  photos: string[]
  checklist: ChecklistItem[]
  notes: string
}
```

---

## 🌐 API Integration & Services

### **Frontend API Service Layer**
```typescript
// /src/services/api.ts
- Centralized HTTP client configuration
- Request/response interceptors
- Error handling and retry logic
- Authentication token management
- Type-safe API calls
```

### **Expected Backend Integration**
```typescript
// The frontend is designed to integrate with:
interface ExpectedAPI {
  // Authentication endpoints
  login: POST('/api/auth/login')
  register: POST('/api/auth/register')
  logout: POST('/api/auth/logout')
  
  // Asset management endpoints
  getAssets: GET('/api/assets')
  getAsset: GET('/api/assets/:id')
  updateAsset: PUT('/api/assets/:id')
  
  // Analytics & monitoring
  getDashboardData: GET('/api/dashboard')
  getAnalytics: GET('/api/analytics')
  getPredictions: GET('/api/predictions')
}
```

### **Mock Data & Development**
- **Demo Authentication**: Pre-configured test accounts
- **Sample Data**: Realistic railway asset data for development
- **Offline Mode**: Works without backend for frontend development

---

## 🚀 Build & Deployment

### **Development Environment**
```bash
# Environment variables (create .env.local)
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=RailFIT
VITE_VERSION=1.0.0

# Development server with hot reload
npm run dev
# Runs on http://localhost:5173
```

### **Production Build**
```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview

# Build outputs to /dist folder
# - Minified JavaScript bundles
# - Optimized CSS
# - Static assets with cache headers
```

### **Deployment Options**
```bash
# Static hosting (Recommended)
- Vercel: Connect GitHub repo for auto-deploy
- Netlify: Drag & drop /dist folder
- GitHub Pages: Enable in repository settings

# Server deployment
- Upload /dist folder to web server
- Configure server for SPA routing
- Set up HTTPS and CDN
```

---

## 🤝 Team Collaboration

### **Git Workflow**
```bash
# Clone repository
git clone https://github.com/KeerthanaShreeVenugopal/SIH.git

# Create feature branch
git checkout -b feature/new-feature

# Commit changes
git add .
git commit -m "feat: add asset management system"

# Push to GitHub
git push origin feature/new-feature
```

### **Code Review Process**
1. **Feature Development**: Work in feature branches
2. **Pull Requests**: Submit PRs for review
3. **Code Review**: Team reviews code quality
4. **Testing**: Verify functionality works
5. **Merge**: Merge to main branch after approval

### **Communication**
- **Daily Standups**: Progress updates and blockers
- **GitHub Issues**: Bug tracking and feature requests
- **Documentation**: Keep README and comments updated
- **Code Comments**: Document complex logic

---

## 📚 Learning Resources

### **React + TypeScript**
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Router](https://reactrouter.com/)

### **Styling & UI**
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)

### **Backend Development**
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Guide](https://www.postgresql.org/docs/)

---

## 🐛 Troubleshooting

### **Common Issues**

#### **Authentication Not Persisting**
```typescript
// Issue: User gets logged out on page reload
// Solution: Check AuthContext loading state implementation
// File: /src/context/AuthContext.tsx
```

#### **Tailwind Styles Not Working**
```bash
# Issue: CSS not applying
# Solution: Check Tailwind configuration
npm run dev  # Restart dev server
```

#### **Import Errors**
```typescript
// Issue: Cannot find module errors
// Solution: Check file paths and extensions
// Ensure .tsx extensions for React components
```

#### **Build Failures**
```bash
# Issue: Build fails
# Solution: Check TypeScript errors
npm run lint  # Check for linting errors
npm run build  # See specific build errors
```

---

## 🔮 Frontend Roadmap & Enhancements

### **Phase 2 Web Features**
- [ ] **Progressive Web App (PWA)**: Offline capabilities and app-like experience
- [ ] **Advanced Charts**: Interactive data visualizations with Chart.js/D3
- [ ] **Real-time Updates**: WebSocket integration for live data
- [ ] **Mobile Optimization**: Enhanced responsive design for tablets/phones
- [ ] **Accessibility**: WCAG 2.1 AA compliance for inclusive design

### **Performance Optimizations**
- [ ] **Code Splitting**: Lazy loading for route-based chunks
- [ ] **Image Optimization**: WebP format and lazy loading
- [ ] **Bundle Analysis**: Optimize JavaScript bundle sizes
- [ ] **Caching Strategy**: Service worker for offline functionality
- [ ] **Performance Monitoring**: Core Web Vitals tracking

---

## 📞 Support & Contact

### **Frontend Team**
- **Lead Developer**: [Your Name] - Frontend architecture and development
- **UI/UX Designer**: [Design Team] - User interface and experience design
- **Quality Assurance**: [QA Team] - Testing and browser compatibility

### **Repository**
- **GitHub**: https://github.com/KeerthanaShreeVenugopal/SIH
- **Issues**: Submit bugs and feature requests
- **Discussions**: Team communication and questions

---

## 📄 License

This project is developed for Smart India Hackathon 2025 and is intended for educational and competition purposes.

---

**Built with ❤️ for Indian Railways** 🚆
*Smart India Hackathon 2025 - Railway Infrastructure Innovation*