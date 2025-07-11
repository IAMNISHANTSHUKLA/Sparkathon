# OpsPilot Backend - Walmart Sparkathon

**Team:** crazsymb  
**Members:** Nishant Shukla, Ambar Kumar, Ankush Nagwekar  
**Hackathon:** Walmart Sparkathon  

## Project Overview

OpsPilot is an AI-powered supply chain management platform that uses autonomous agents to monitor vendors, validate invoices, track shipments, and optimize procurement operations. Built specifically for the Walmart Sparkathon, this backend provides comprehensive APIs and intelligent agents for supply chain optimization.

## Key Features

### AI Agents
- **Vendor Monitor Agent**: Tracks supplier performance and SLA compliance
- **Invoice Validator Agent**: Detects discrepancies and fraud in invoices
- **Shipment Tracker Agent**: Real-time shipment monitoring and delay prediction
- **Customs Compliance Agent**: Automates documentation and regulatory compliance
- **ESG Risk Agent**: Assesses environmental, social, and governance risks
- **Procurement Agent**: Optimizes purchasing decisions and cost savings

### Core Functionality
- Real-time dashboard with KPIs and analytics
- CSV data upload and processing
- Document management and storage
- Comprehensive API endpoints
- Caching and performance optimization
- Real-time notifications

## Technology Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Caching**: Upstash Redis
- **AI**: Google Generative AI (Gemini)
- **File Processing**: Multer, CSV Parser
- **Authentication**: Supabase Auth
- **Logging**: Winston
- **Testing**: Jest

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Upstash Redis account
- Google AI API key

## Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd opspilot-backend
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Database Setup
```bash
# Run the SQL script in your Supabase dashboard
# File: scripts/create-tables.sql
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Generate Sample Data
```bash
curl -X POST http://localhost:3001/api/data/generate-sample
```

## API Endpoints

### Core APIs
- `GET /api/info` - Project and team information
- `GET /health` - Health check
- `GET /api/dashboard/kpis` - Dashboard KPIs
- `GET /api/dashboard/activities` - Recent activities

### Data Management
- `GET /api/vendors` - List all vendors
- `POST /api/vendors` - Create vendor
- `GET /api/shipments` - List shipments
- `GET /api/invoices` - List invoices
- `GET /api/esg` - ESG data and risks

### AI Agents
- `POST /api/agents/run/:agentName` - Run specific agent
- `POST /api/agents/run-all` - Run all agents
- `GET /api/agents/status` - Agent status

### File Upload
- `POST /api/upload/csv` - Upload and process CSV files
- `GET /api/upload/template/:dataType` - Download CSV templates

## AI Agent Usage

### Run Individual Agent
```bash
curl -X POST http://localhost:3001/api/agents/run/vendor-monitor \
  -H "Content-Type: application/json" \
  -d '{"data": {}}'
```

### Run All Agents
```bash
curl -X POST http://localhost:3001/api/agents/run-all
```

### Available Agents
- `vendor-monitor` - Vendor performance analysis
- `invoice-validator` - Invoice validation and fraud detection
- `shipment-tracker` - Shipment monitoring and tracking
- `customs-compliance` - Customs and regulatory compliance
- `esg-risk` - ESG risk assessment
- `procurement` - Procurement optimization

## CSV Data Upload

### Supported Data Types
- `vendors` - Vendor information
- `shipments` - Shipment data
- `invoices` - Invoice records
- `esg_scores` - ESG scoring data

### Upload CSV
```bash
curl -X POST http://localhost:3001/api/upload/csv \
  -F "file=@vendors.csv" \
  -F "dataType=vendors"
```

### Download Templates
```bash
curl -O http://localhost:3001/api/upload/template/vendors
```

## Project Structure

```
src/
├── agents/           # AI agent implementations
├── config/           # Database and service configurations
├── data/             # Sample data generation
├── middleware/       # Express middleware
├── routes/           # API route handlers
├── services/         # Business logic services
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── server.ts         # Main server file
```

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Performance Features

- **Redis Caching**: Frequently accessed data cached for 5-10 minutes
- **Database Optimization**: Efficient queries with proper indexing
- **Rate Limiting**: API rate limiting for stability
- **Error Handling**: Comprehensive error handling and logging

## Configuration

### Environment Variables
```env
# Server
PORT=3001
NODE_ENV=development

# Database
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Cache
REDIS_URL=your_redis_url

# AI
GOOGLE_API_KEY=your_google_api_key

# Team Info
TEAM_NAME=crazsymb
HACKATHON=Walmart Sparkathon
TEAM_MEMBERS=Nishant Shukla, Ambar Kumar, Ankush Nagwekar
```

## Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Setup for Production
1. Set all environment variables in Vercel dashboard
2. Configure Supabase for production
3. Set up Upstash Redis for production
4. Update CORS origins for frontend domain

## Monitoring and Logging

- **Winston Logging**: Structured logging with multiple levels
- **Error Tracking**: Comprehensive error handling and reporting
- **Performance Monitoring**: Request timing and database query optimization

## Hackathon Features

### Demo-Ready Functionality
- Pre-populated sample data for immediate testing
- All AI agents fully functional with realistic business logic
- CSV upload with validation and error handling
- Real-time dashboard updates
- Comprehensive API documentation

### Winning Features
- **Complete AI Agent System**: 6 fully functional AI agents
- **Google AI Integration**: Advanced AI analysis and insights
- **Real-time Processing**: Live updates and notifications
- **Scalable Architecture**: Production-ready code structure
- **Data Import/Export**: CSV processing for easy data migration

## Team crazsymb

- **Nishant Shukla** - Backend Architecture & AI Integration
- **Ambar Kumar** - Database Design & API Development  
- **Ankush Nagwekar** - Agent Development & Data Processing

## Support

For hackathon support or questions:
- Check the `/api/info` endpoint for project details
- Review API documentation in this README
- All endpoints return team information for verification

---

**Built with dedication for Walmart Sparkathon by Team crazsymb**
