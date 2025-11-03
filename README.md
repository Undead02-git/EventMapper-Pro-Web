# EventMapper Pro - Web Version

EventMapper Pro is a web application designed to help event organizers efficiently manage and visualize event data. With features like interactive maps, real-time updates, and comprehensive analytics, EventMapper Pro simplifies the planning and execution of events, ensuring a seamless experience for both organizers and attendees.

## Features

- Interactive circular map visualization for event spaces
- Room management and status tracking
- Tag-based room categorization
- Admin panel for managing rooms and tags
- CSV import functionality for bulk data
- Export to PDF and XLSX formats
- Responsive design for all device sizes

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd eventmapper-pro-web
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### Development

To run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Building for Production

To create a production build:

```bash
npm run build
```

To start the production server:

```bash
npm run start
```

## Deployment

### Local Development
The application will automatically fall back to localStorage for data persistence when database environment variables are not set.

### Vercel Deployment with Edge Config (Recommended)
To deploy on Vercel with shared data persistence using Edge Config:

1. Connect your GitHub repository to Vercel
2. In your Vercel project dashboard, go to the "Storage" tab
3. Click "Create" and select "Edge Config"
4. Give your Edge Config store a name (e.g., "eventmapper-data")
5. Click "Create" to create the Edge Config store
6. Copy the `EDGE_CONFIG` environment variable URL provided
7. In your Vercel project dashboard, go to the "Settings" tab
8. Click "Environment Variables" in the left sidebar
9. Add the following environment variable:
   - Name: `EDGE_CONFIG`
   - Value: The URL provided by Vercel Edge Config
   - Environment: Select all environments (Production, Preview, Development)
10. Deploy the project - Vercel will automatically detect it as a Next.js application

### Alternative: Vercel Deployment with Postgres
If you prefer to use Vercel Postgres instead of Edge Config:

1. Connect your GitHub repository to Vercel
2. Add a Vercel Postgres database to your project
3. Set the following environment variables in your Vercel project settings:
   - `POSTGRES_URL`: Your Vercel Postgres connection string
   - `POSTGRES_URL_NON_POOLING`: Your Vercel Postgres connection string (non-pooling)
   - `POSTGRES_USER`: Your database username
   - `POSTGRES_HOST`: Your database host
   - `POSTGRES_PASSWORD`: Your database password
   - `POSTGRES_DATABASE`: Your database name

4. Deploy the project - Vercel will automatically detect it as a Next.js application

## Technologies Used

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- Radix UI
- Lucide Icons
- Recharts
- jsPDF
- XLSX
- Vercel Edge Config or Postgres (for production deployment)

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── admin/        # Admin-specific components
│   ├── ui/           # Reusable UI components
│   └── ...           # Other components
├── lib/              # Utility functions and data
├── hooks/            # Custom React hooks
└── ...
```

## License

This project is licensed under the MIT License.