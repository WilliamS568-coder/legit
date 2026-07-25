# LEGIT TUTORS - Educational Portal

A comprehensive educational platform designed to help students excel in JAMB, WAEC, NECO, GCE, and Post-UTME examinations. This platform provides tutorial services, CBT training, and admission guidance for Nigerian students.

## Features

### Student Features
- **User Registration & Authentication**: Secure sign-up and login system
- **Student Dashboard**: Personalized dashboard for registered students
- **Password Recovery**: Forgot password functionality with email reset
- **Responsive Design**: Mobile-friendly interface accessible on all devices

### Admin Features
- **Admin Dashboard**: Administrative control panel for managing the platform
- **User Management**: View and manage student accounts
- **Content Management**: Update gallery, testimonials, and scholars information

### Public Features
- **Home Page**: Hero section, about us, services, success stories, testimonials, and photo gallery
- **Services Page**: Detailed information about JAMB, WAEC, NECO, and CBT training
- **Scholars Page**: Information about available scholarships
- **Gallery Page**: Photo gallery showcasing the learning environment
- **Contact Page**: Contact form with WhatsApp integration for instant communication

### SEO & Performance
- Complete SEO optimization with meta tags
- Sitemap.xml for search engine indexing
- Robots.txt for crawler guidance
- Open Graph and Twitter Card support for social sharing

## Tech Stack

- **Frontend**: React 18 with Vite
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Authentication & Database)
- **Icons**: SVG icons (Heroicons style)
- **Build Tool**: Vite

## Project Structure

```
lesson-portal/
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── About.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── Contact.jsx
│   │   ├── ContactFooter.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── Gallery.jsx
│   │   ├── Hero.jsx
│   │   ├── Login.jsx
│   │   ├── Navbar.jsx
│   │   ├── register.jsx
│   │   ├── Services.jsx
│   │   ├── StudentDashboard.jsx
│   │   ├── SuccessStories.jsx
│   │   ├── Testimonials.jsx
│   │   └── UpdatePassword.jsx
│   ├── context/
│   ├── lib/
│   ├── pages/
│   │   ├── GalleryPage.jsx
│   │   └── ScholarsPage.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   ├── main.jsx
│   └── supabaseClient.js
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/WilliamS568-coder/lesson-portal.git
cd lesson-portal
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Database Schema

### Profiles Table
The application uses a `profiles` table in Supabase with the following structure:
- `id` (UUID) - References auth.users
- `full_name` (text) - User's full name
- `role` (text) - Either 'admin' or 'student'
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Authentication Flow

1. **Registration**: Users sign up with email and password
2. **Email Verification**: Supabase sends verification email
3. **Login**: Users authenticate with credentials
4. **Role-Based Routing**: 
   - Admin users → `/admin-dashboard`
   - Student users → `/student-dashboard`
5. **Password Recovery**: Users can reset password via email

## Pages & Routes

### Public Routes
- `/` - Home page with all main sections
- `/scholars` - Scholarship information
- `/gallery` - Photo gallery
- `/contact` - Contact form

### Authentication Routes
- `/login` - User login
- `/register` - User registration
- `/forgot-password` - Password reset request
- `/update-password` - Set new password (via email link)

### Protected Routes
- `/admin-dashboard` - Admin panel (admin only)
- `/student-dashboard` - Student dashboard (students only)

## Features in Detail

### Contact Integration
- WhatsApp messaging integration for instant communication
- Contact form that routes messages to WhatsApp
- Office hours and support information

### SEO Optimization
- Meta tags for search engines
- Open Graph tags for social media
- Twitter Card support
- XML sitemap for search engines
- Robots.txt for crawler guidance

### User Experience
- Password visibility toggle
- Loading states for all actions
- Error and success notifications
- Smooth scrolling navigation
- Responsive mobile menu
- Back to home navigation on all pages

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

**LEGIT TUTORS**
- Email: legittutors8@gmail.com
- Phone: +234 812 020 4790
- WhatsApp: [Chat with us](https://wa.me/2348120204790)
- Address: 29, Adedayo Adedeji street, Wazobia B/Stop Abaranje-Ikotun, Lagos State.

## Acknowledgments

- Built with React and Vite
- Styled with Tailwind CSS
- Backend powered by Supabase
- Icons from Heroicons

---

© {new Date().getFullYear()} LEGIT TUTORS. All Rights Reserved. Designed for Academic Excellence.