# Sweet Shop Management System

A comprehensive full-stack Indian Sweet Shop Management System built following Test-Driven Development (TDD) principles. This application allows customers to browse and purchase traditional Indian sweets, while providing admin functionality for inventory management.

## Project Overview

This system features a React frontend with a Node.js/Express backend, JWT authentication, PostgreSQL database integration, and comprehensive testing suite. All prices are displayed in Indian Rupees (₹) for authentic shopping experience.

## Features

### Customer Features
- Browse extensive catalog of Indian sweets (Mithai, Laddu, Halwa, Barfi)
- Search and filter sweets by name, category, and price range
- User registration and authentication
- Shopping cart functionality
- Responsive design optimized for all devices

### Admin Features
- Inventory management (Add, Edit, Delete sweets)
- Stock management and restocking
- Low stock alerts
- Dashboard with sales statistics
- Admin-only product management interface

### Technical Features
- JWT-based authentication with role-based access control
- RESTful API design
- Real-time inventory updates
- Optimistic UI updates
- Comprehensive error handling
- Mobile-first responsive design

## Default Credentials

### Admin Access
- **Email:** admin@sweetshop.com
- **Password:** admin123
- **Role:** Admin (full inventory management access)

### Customer Access
- **Email:** customer@sweetshop.com  
- **Password:** customer123
- **Role:** Customer (shopping access)

*Note: You can also create new accounts using the registration form.*

## Setup Instructions

### Prerequisites
- Node.js 20+ 
- PostgreSQL database
- npm or yarn package manager

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sweet-shop-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/sweetshop
   JWT_SECRET=your-super-secure-jwt-secret-key
   NODE_ENV=development
   ```

4. **Database Setup**
   ```bash
   # Initialize database schema
   npm run db:push
   ```

5. **Start the application**
   ```bash
   # Development mode (runs both frontend and backend)
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Admin Panel: http://localhost:3000/admin

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Sweets Management
- `GET /api/sweets` - Get all sweets
- `GET /api/sweets/search` - Search sweets
- `POST /api/sweets` - Add new sweet (Admin only)
- `PUT /api/sweets/:id` - Update sweet (Admin only)
- `DELETE /api/sweets/:id` - Delete sweet (Admin only)

### Inventory Management
- `POST /api/sweets/:id/purchase` - Purchase sweet
- `POST /api/sweets/:id/restock` - Restock sweet (Admin only)

### Shopping Cart
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add item to cart
- `DELETE /api/cart/:id` - Remove item from cart
- `DELETE /api/cart` - Clear cart

## Testing

### Running Tests
```bash
# Run comprehensive TDD demo tests
tsx demo-test.ts

# Run Jest unit tests (basic setup)
npx jest

# Run individual test files
tsx tests/auth.test.ts
tsx tests/sweets.test.ts
tsx tests/cart.test.ts
```

### Test Coverage
The project includes comprehensive TDD testing that validates:
- **Authentication System:** User registration, login, token validation, role-based access
- **Sweet Management:** CRUD operations, search functionality, admin-only operations
- **Shopping Cart:** Add/remove items, cart persistence, user-specific access
- **Inventory Management:** Purchase transactions, stock tracking, restocking operations
- **Security:** Protected routes, unauthorized access prevention, input validation

### Latest Test Results
```
🍬 Sweet Shop Management System - TDD Testing Demo
✅ Passed: 14/14 tests (100% success rate)

🔐 Authentication System - 4/4 tests passed
🍭 Sweets Management - 4/4 tests passed  
🛒 Shopping Cart - 3/3 tests passed
📦 Inventory Management - 3/3 tests passed
```

The comprehensive test suite validates the entire API functionality with real server integration testing.

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Wouter** for routing
- **TanStack Query** for state management
- **shadcn/ui** component library
- **Tailwind CSS** for styling
- **Vite** for build tooling

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **JWT** for authentication
- **bcrypt** for password hashing
- **Zod** for data validation

### Database
- **PostgreSQL** for production
- **Drizzle ORM** for database operations
- **Drizzle Kit** for migrations

### Development Tools
- **ESLint** and **Prettier** for code quality
- **Husky** for git hooks
- **Jest** for testing
- **tsx** for TypeScript execution

## Project Structure

```
sweet-shop-management/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities and helpers
│   │   └── hooks/          # Custom React hooks
├── server/                 # Express backend
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API route definitions
│   └── storage.ts         # Data layer abstraction
├── shared/                 # Shared TypeScript definitions
│   └── schema.ts          # Database schema and validation
├── tests/                  # Test suites
└── docs/                   # Documentation
```

## My AI Usage

During the development of this Sweet Shop Management System, I leveraged AI tools to enhance productivity and code quality:

### AI Tools Used
- **Claude/GPT**: Used for brainstorming API endpoint structures, generating component boilerplate, and debugging complex TypeScript issues
- **GitHub Copilot**: Assisted with writing unit tests, generating repetitive CRUD operations, and suggesting TypeScript type definitions

### How AI Was Used
1. **Architecture Planning**: Used AI to brainstorm the optimal database schema for the sweet shop domain, including relationships between users, sweets, orders, and cart items
2. **Boilerplate Generation**: AI generated initial React component structures, Express route handlers, and TypeScript interface definitions
3. **Test Suite Creation**: AI assisted in writing comprehensive test cases for authentication flows, API endpoints, and component interactions
4. **Code Review**: Used AI to identify potential bugs, suggest performance optimizations, and ensure TypeScript best practices
5. **Documentation**: AI helped structure this README and generate clear setup instructions

### AI Impact on Workflow
The integration of AI tools significantly accelerated development by:
- Reducing time spent on repetitive coding tasks by ~40%
- Improving code quality through AI-suggested best practices
- Enabling faster debugging through AI-assisted error analysis
- Providing alternative implementation approaches for complex features

AI was used as a collaborative coding partner, with all AI-generated code being thoroughly reviewed, tested, and customized to meet specific project requirements. The final implementation represents a blend of AI assistance and human expertise.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Email: hemjshah052@gmail.com


---

*Made with ❤️ for sweet lovers everywhere*
