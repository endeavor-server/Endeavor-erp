# Endeavor SUPER CRM - User Manual

**Version:** 1.0.0  
**Last Updated:** 2026-02-09

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [User Roles](#user-roles)
4. [Dashboard](#dashboard)
5. [Modules Guide](#modules-guide)
6. [Finance & Invoicing](#finance--invoicing)
7. [GST Compliance](#gst-compliance)
8. [TDS Management](#tds-management)
9. [Troubleshooting](#troubleshooting)

---

## Introduction

Endeavor SUPER CRM is a comprehensive business management platform designed for Endeavor Academy Pvt Ltd. It manages clients, workforce (600+ freelancers), invoicing with Indian GST compliance, TDS calculations, and sales pipelines.

### Key Features
- **Multi-role access** (Admin, Operations, Clients, Freelancers, Contractors, Vendors)
- **GST-compliant invoicing** (CGST/SGST/IGST auto-calculation)
- **TDS management** (Section 192, 194C, 194J, 194H)
- **Freelancer marketplace** with skill tracking
- **Sales pipeline** with AI assistance
- **Real-time compliance** calendar

---

## Getting Started

### 1. Access the Application

**URL:** `https://crm.endeavor.in`

### 2. Login

Enter your credentials:
- **Email:** Your registered email address
- **Password:** Your secure password

### 3. First Login Setup

1. Change your default password
2. Set up your profile
3. Review your role permissions

---

## User Roles

### Administrator
**Full system access**
- Manage all users and permissions
- Configure system settings
- Access audit logs
- Approve high-value invoices

**Login:** `admin@endeavor.in`

### Operations Team
**Day-to-day operations**
- Manage clients and deals
- Create and send invoices
- Process payments
- Generate reports
- Handle TDS deposits

**Login:** `ops@endeavor.in`

### External Clients
**Limited to own data**
- View project status
- Access own invoices
- Download payment receipts
- View project reports

### Freelancers
**Self-service portal**
- Submit timesheets
- View assignments
- Track payments
- Update profile and skills

### Contractors
**Contract management**
- View milestones
- Submit invoices
- Track payments
- Access contract details

### Vendors
**Purchase order access**
- View purchase orders
- Submit delivery notes
- Track payment status
- Update vendor profile

---

## Dashboard

The dashboard provides a business pulse view with:

### Metrics Cards
- **Total Revenue** - Current month earnings
- **Active Projects** - Ongoing client work
- **Pending Invoices** - Amount awaiting payment
- **Team Utilization** - Freelancer availability

### Quick Actions
- Create new invoice
- Add client
- Log time
- View pending approvals

### Upcoming Tasks
- Compliance deadlines
- Follow-up reminders
- Meeting schedules

---

## Modules Guide

### 1. Command Center
**Access:** Admin, Operations only

View business-critical alerts:
- Overdue invoices
- Compliance deadlines
- At-risk projects
- Team capacity warnings

### 2. Clients
**Access:** Admin, Operations, Clients (own)

Manage client relationships:
- **Client Profiles:** Contact info, GSTIN, billing addresses
- **Contracts:** Active agreements and terms
- **Projects:** Ongoing work and status
- **Invoices:** Client billing history

#### Adding a New Client
1. Navigate to Clients module
2. Click "+ New Client"
3. Fill in details:
   - Company name
   - Contact person
   - Email and phone
   - GSTIN (if applicable)
   - Billing address
4. Save

### 3. People
**Access:** Admin, Operations, Vendors (own)

Manage workforce:

#### Employees
- Full-time staff profiles
- Payroll information
- Leave management
- Document storage

#### Freelancers
- 600+ talent pool
- Skills and expertise
- Hourly rates
- Project assignments
- Rating system

#### Contractors
- Fixed-term contracts
- Milestone tracking
- Deliverable management

#### Vendors
- Supplier management
- PO tracking
- Payment terms

### 4. Work & Delivery
**Access:** All roles (filtered by permissions)

Manage project execution:
- Timesheet submission
- Task assignments
- Milestone tracking
- Deliverable reviews

#### Submitting Timesheet (Freelancer)
1. Go to Work & Delivery
2. Click "Log Time"
3. Select project
4. Enter hours worked
5. Add description
6. Submit for approval

### 5. Finance
**Access:** Admin, Operations, External (own data)

Financial operations hub:

#### Invoices
Four types supported:
- **Client Invoices** - GST-compliant billing
- **Freelancer Invoices** - With TDS deduction
- **Contractor Invoices** - Milestone-based
- **Vendor Invoices** - PO-matched

#### Viewing Invoices
1. Navigate to Finance → Invoices
2. Select invoice type tab
3. Filter by status (Paid, Pending, Overdue)
4. Click invoice to view details

### 6. Sales
**Access:** Admin, Operations

Sales pipeline management:
- **Contacts:** Prospects and leads
- **Deals:** Opportunity tracking
- **Pipeline:** Kanban view of stages
- **AI Assistant:** Content generation

#### Moving a Deal
1. Open Sales → Pipeline
2. Drag deal card to next stage
3. Or click deal and update status

### 7. AI & Automation
**Access:** Admin, Operations

AI-powered features:
- Email content generation
- WhatsApp message templates
- Sales pitch creation
- Proposal writing
- Usage tracking and governance

### 8. Reports
**Access:** Admin, Operations, Clients (own)

Generate insights:
- Revenue reports
- GST summaries
- TDS statements
- Freelancer performance
- Sales analytics

### 9. Admin
**Access:** Admin only

System administration:
- User management
- Role configuration
- Audit logs
- System settings
- Integration setup

---

## Finance & Invoicing

### Creating a Client Invoice

1. **Navigate** to Finance → Invoices → Client
2. **Click** "+ New Invoice"
3. **Select** client from dropdown
4. **Add line items:**
   - Description of service
   - HSN/SAC code (auto-suggested)
   - Quantity
   - Unit price
   - GST rate (18% default)
5. **Review** auto-calculated taxes:
   - Taxable value
   - CGST (9% for intra-state)
   - SGST (9% for intra-state)
   - OR IGST (18% for inter-state)
6. **Add** any additional charges or discounts
7. **Set** due date
8. **Add** terms and notes
9. **Click** "Generate Invoice"

The system will:
- Auto-assign invoice number (e.g., INV/2024-25/00001)
- Calculate GST based on client state
- Validate totals
- Save to database

### Invoice Statuses

| Status | Meaning | Action |
|--------|---------|--------|
| Draft | Not yet sent | Edit or send |
| Sent | Emailed to client | Await payment |
| Viewed | Client opened | Follow up if needed |
| Partial | Partial payment received | Track balance |
| Paid | Full payment received | Close invoice |
| Overdue | Past due date | Send reminder |
| Cancelled | Voided | Create new if needed |

### Recording Payments

1. Open invoice
2. Click "Record Payment"
3. Enter:
   - Payment date
   - Amount received
   - Payment method
   - Reference number
4. Save

---

## GST Compliance

### Automatic GST Calculation

The CRM automatically determines GST type based on client location:

**Intra-state (same state):**
- CGST: 9%
- SGST: 9%
- Total: 18%

**Inter-state (different state):**
- IGST: 18%
- CGST: 0%
- SGST: 0%

### GSTR Filing

#### Monthly Returns

| Return | Due Date | Purpose |
|--------|----------|---------|
| GSTR-1 | 11th | Outward supplies |
| GSTR-3B | 20th | Monthly summary |

#### Exporting GSTR-1 Data

1. Go to Finance → GST → GSTR-1
2. Select tax period
3. Review summary
4. Click "Export JSON"
5. Upload to GST portal

#### Input Tax Credit Reconciliation

The system provides reconciliation between:
- GSTR-2A (auto-populated from vendors)
- GSTR-2B (static statement)
- Purchase register

**To reconcile:**
1. Navigate to Finance → GST → Reconciliation
2. Review mismatched entries
3. Investigate differences
4. Make corrections if needed

### Common HSN Codes

| Service | HSN Code |
|---------|----------|
| E-Learning | 9992 |
| Software Development | 998314 |
| Consulting | 998311 |
| Training | 999293 |
| Content Development | 998313 |
| Graphic Design | 998391 |
| Video Production | 998362 |

---

## TDS Management

### Automatic TDS Deduction

The system applies TDS based on payment type:

| Section | Description | Rate (Individual) | Rate (Company) |
|---------|-------------|-------------------|----------------|
| 192 | Salary | Slab-based | Slab-based |
| 194C | Contractor | 1% | 2% |
| 194J | Professional | 10% | 10% |
| 194H | Commission | 5% | 5% |

Threshold: ₹30,000 per transaction or ₹1,00,000 annually

### TDS Reports

To view TDS summary:
1. Go to Finance → TDS
2. Select financial year
3. View by section
4. Check deposited vs pending

### TDS Deposit Reminders

The system alerts when:
- TDS deducted but not deposited
- Due date approaching (7th of next month)
- Quarterly returns pending

---

## Troubleshooting

### Login Issues

**Forgot Password:**
1. Click "Forgot Password" on login page
2. Enter email address
3. Check inbox for reset link
4. Create new password

**Account Locked:**
- Contact admin@endeavor.in
- Provide your registered email
- Wait for unlock (24 hours)

### Invoice Errors

**"Invalid GST Calculation" Error:**
- Check GST rate is 0, 5, 12, 18, or 28
- Verify state code in client profile
- Ensure taxable value is positive

**"Duplicate Invoice Number" Error:**
- Invoice numbers are auto-generated
- Do not manually edit invoice numbers
- Use "Cancel" and create new invoice

### Performance Issues

**Page Loading Slowly:**
1. Clear browser cache
2. Check internet connection
3. Try incognito mode
4. Contact support if persists

### Data Not Saving

**Check:**
- Internet connection active
- Session not expired (re-login)
- Required fields filled
- No validation errors

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus search |
| `Ctrl + K` | Open command palette |
| `Esc` | Close modal / Go back |
| `n` | Create new (contextual) |
| `?` | Show shortcuts help |

---

## Mobile Access

The CRM is responsive and works on:
- iOS Safari (14+)
- Android Chrome (latest)
- iPad/tablet browsers

**Note:** For best experience, use desktop for invoice creation and complex tasks.

---

## Support

### Help Resources
- **Documentation:** [Internal Wiki]
- **Video Tutorials:** [Training Portal]
- **FAQ:** [Knowledge Base]

### Contact Support
- **Email:** support@endeavor.in
- **Slack:** #crm-support
- **Hours:** Mon-Fri, 9 AM - 6 PM IST

### Feature Requests
Submit via:
- Create ticket in Admin → Feedback
- Or email: product@endeavor.in

---

## Security Best Practices

### For All Users
- ✅ Use strong password (12+ characters)
- ✅ Enable 2FA when available
- ✅ Log out on shared devices
- ✅ Report suspicious activity
- ❌ Never share login credentials
- ❌ Don't use public WiFi for sensitive operations

### For Admins
- ✅ Review audit logs weekly
- ✅ Deactivate departed employees promptly
- ✅ Limit admin access to required personnel
- ✅ Backup before major changes

---

*Endeavor SUPER CRM - Empowering Business Excellence*
