# Rupantar AI - Admin Panel

Admin panel for managing the Rupantar AI platform.

## Features

- **Dashboard**: Overview statistics, charts, and analytics
- **User Management**: View, ban, verify, and manage users
- **Template Management**: Approve, reject, and manage templates
- **Creator Management**: Review applications, manage creators
- **Transaction Management**: View and refund transactions
- **Analytics**: Revenue, user growth, and performance metrics
- **Settings**: System configuration
- **Support**: Ticket management

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Shadcn UI
- Zustand (State Management)
- Recharts (Charts)

## Getting Started

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.local.example` to `.env.local` and configure:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
PORT=6000
```

### Development

```bash
npm run dev
```

The admin panel will be available at `http://localhost:6000`

### Default Login Credentials

- Email: `admin@rupantar.ai`
- Password: `admin123`

## Project Structure

```
admin/admin/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── (auth)/      # Authentication pages
│   │   └── (dashboard)/ # Protected admin pages
│   ├── components/       # React components
│   ├── services/        # API services
│   ├── store/           # Zustand stores
│   └── types/           # TypeScript types
└── public/              # Static assets
```

## Deployment

The admin panel is a separate Next.js application and can be deployed independently from the main frontend and backend.

### Build

```bash
npm run build
npm start
```

## API Endpoints

All admin API endpoints are prefixed with `/api/admin`:

- `/api/admin/auth/login` - Admin login
- `/api/admin/users/*` - User management
- `/api/admin/templates/*` - Template management
- `/api/admin/creators/*` - Creator management
- `/api/admin/transactions/*` - Transaction management
- `/api/admin/analytics/*` - Analytics data
- `/api/admin/settings/*` - System settings
- `/api/admin/support/*` - Support tickets

## Notes

- The admin panel uses the same logo and theme as the main frontend
- All routes are protected and require authentication
- Mock data is used for development; connect to real backend API in production

