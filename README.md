# YORDI EKUB - Modern Ethiopian Traditional EKUB Management System

A comprehensive web-based platform for managing Ethiopian traditional rotating savings groups (EKUB) with role-based access, payment tracking, and audit trails.

## Features

### Core Functionality
- **EKUB Management**: Create and manage 5 types of EKUBs (Daily, Weekly, Monthly, 105 Days, Share)
- **Customer Management**: Register and track EKUB members with contribution history
- **Payment Tracking**: Monitor contributions across all EKUB groups with status tracking
- **Payout Management**: Manage winner selection and payout distributions
- **Audit Logs**: Complete audit trail of all system activities with before/after change tracking

### User Roles & Permissions
1. **Admin**: Full system access, user management, settings, audit logs
2. **Manager**: EKUB management, customer & payment oversight
3. **Secretary**: Customer and payment entry/updates
4. **Employee**: View-only access to assigned EKUB
5. **Customer**: Mobile-friendly portal (future phase)

### Technical Features
- Role-based access control (RBAC)
- Real-time data validation
- Responsive mobile-first design
- Data export to Excel (XLSX)
- Comprehensive audit logging
- Bilingual support ready (English & Amharic)
- Ethiopian calendar integration ready

## Getting Started

### Prerequisites
- Node.js 18+ or higher
- pnpm, npm, or yarn

### Installation

1. **Clone or download the project**
   ```bash
   cd yordi-ekub
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Run development server**
   ```bash
   pnpm dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

5. **Seed demo data**
   ```bash
   curl -X POST http://localhost:3000/api/seed
   ```

## Demo Credentials

All demo users share the password: `Yordi@321#`

| Role | Phone | Use Case |
|------|-------|----------|
| Admin | +251901234567 | Full system management |
| Manager | +251902345678 | EKUB and member oversight |
| Secretary | +251903456789 | Daily operations & data entry |
| Employee | +251904567890 | View-only participant |

## User Interface

### Dashboard
- **KPI Cards**: Total contributions, payouts, active members, and EKUB groups
- **Charts**: Contribution vs. payout analysis by EKUB type
- **Payment Status**: Visual overview of completed vs. pending payments

### EKUB Management (`/dashboard/ekubs`)
- Create new EKUB groups with configurable parameters
- Edit existing groups (type, contribution amount, rounds)
- Delete closed/archived groups
- View current round progress

**Accessible to**: Admin, Manager

### Customers (`/dashboard/customers`)
- Register new EKUB members
- Track total contributions and payouts per customer
- Monitor participation across rounds
- Search and filter by name or phone

**Accessible to**: Admin, Manager, Secretary

### Payments (`/dashboard/payments`)
- Record member contributions
- Track payment status (completed, pending, failed)
- Filter by status and date
- Mark payments as complete

**Accessible to**: Admin, Manager, Secretary

### Payouts (`/dashboard/payouts`)
- Generate winner payouts based on EKUB rules
- Track payout status (pending, completed, unclaimed)
- Manage claim processing
- Export payout reports

**Accessible to**: Admin, Manager, Secretary

### Audit Logs (`/dashboard/audit`)
- Complete record of system changes
- View detailed change history with before/after values
- Filter by action type or entity type
- Export audit trail for compliance

**Accessible to**: Admin only

### User Management (`/dashboard/users`)
- Create system users with role assignment
- Assign users to specific EKUB groups
- Manage user status (active/inactive)
- Delete users when needed

**Accessible to**: Admin only

### Settings (`/dashboard/settings`)
- Configure organization details
- Set default currency and calendar format
- Configure notification preferences
- View system information and version

**Accessible to**: Admin only

## System Architecture

### Database Schema
The system uses PostgreSQL-compatible schema with tables for:
- **Users**: System user accounts with roles
- **Customers**: EKUB members and participants
- **EkubConfig**: EKUB group configurations
- **Payments**: Contribution records
- **Payouts**: Winner payouts and distributions
- **AuditLogs**: Complete activity audit trail

### Authentication
- Next.js authentication with bcrypt password hashing
- Phone-based login
- Role-based session management
- Secure HTTP-only cookies

### API Routes

#### Authentication
- `POST /api/auth/[...nextauth]`: NextAuth authentication

#### Data Seeding
- `POST /api/seed`: Populate database with demo data

#### Exports
- `POST /api/export`: Export data to Excel (XLSX format)
  - Types: `payments`, `payouts`, `customers`

## EKUB Types

| Type | Duration | Use Case |
|------|----------|----------|
| **Daily** | 1 day | High-frequency small contributions |
| **Weekly** | 7 days | Moderate savings group |
| **Monthly** | 30 days | Standard EKUB rotation |
| **105 Days** | 105 days | Extended savings cycle |
| **Share** | Variable | Share-based investment pools |

## Key Concepts

### Round System
- Each EKUB has configurable total rounds
- Members contribute in every round
- One winner per round receives accumulated funds
- Winner selection can be rotation-based or lottery-based

### Contribution Cycle
1. Member joins EKUB group
2. Contributes in each round according to EKUB type
3. Accumulates total contributions
4. Receives payout when their round arrives
5. History tracked in audit logs

### Payment Status Flow
```
Pending → Completed → (Reconciled in Audit)
  ↓
Failed → (Investigation & Resolution)
```

### Payout Status Flow
```
Pending → Completed → Claimed → (Reconciled)
  ↓
Unclaimed → (Follow-up required)
```

## Customization

### Branding
Update the YORDI EKUB color scheme in `/app/globals.css`:
```css
--primary: #016cc4; /* YORDI Blue */
--secondary: #ef5350; /* Red */
--accent: #4caf50; /* Green */
```

### Localization
Add Amharic translations in `/lib/i18n.json`:
```json
{
  "en": { "dashboard": "Dashboard" },
  "am": { "dashboard": "ዋናው ገጽ" }
}
```

### EKUB Rules
Customize EKUB configurations in `/lib/ekub-rules.ts`:
- Contribution calculation formulas
- Winner selection algorithms
- Payout calculation logic
- Penalty rules

## Deployment

### Deploy to Vercel
```bash
# Connect your GitHub repository
# Push changes to trigger automatic deployment
```

### Deploy to Other Platforms
```bash
# Build for production
pnpm build

# Run production server
pnpm start
```

## Security Features

- **Password Hashing**: bcrypt for secure password storage
- **Session Management**: Secure HTTP-only cookies
- **Role-Based Access**: Enforce permissions at route level
- **Audit Trail**: Complete logging of all modifications
- **Input Validation**: Server-side validation with Zod
- **CSRF Protection**: Built-in Next.js protection

## Future Enhancements

### Phase 2 Features
- [ ] Mobile app (React Native)
- [ ] SMS notifications for payments
- [ ] Email reports and alerts
- [ ] Advanced analytics dashboard
- [ ] Machine learning for winner prediction
- [ ] Multi-language support (Amharic)
- [ ] Ethiopian calendar integration
- [ ] QR code payment confirmation
- [ ] Blockchain transaction verification

### Scalability
- Migrate mock database to PostgreSQL
- Implement Redis caching
- Add background job queue (Bull/Agenda)
- Multi-instance load balancing
- Database replication for high availability

## Support & Documentation

### API Documentation
See `API.md` for detailed endpoint documentation

### Database Schema
See `DATABASE.md` for complete schema specifications

### Contributing
See `CONTRIBUTING.md` for development guidelines

## License

MIT License - Feel free to use for commercial or personal projects

## Contact

For questions or support regarding the YORDI EKUB system, please contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Status**: Production Ready
