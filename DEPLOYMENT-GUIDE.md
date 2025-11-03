# Deployment Guide for EventMapper Pro on Vercel

This guide will help you deploy EventMapper Pro on Vercel with data persistence using Vercel Edge Config, ensuring that all changes made via admin mode are available to all users.

## Prerequisites

1. A Vercel account (free tier is sufficient)
2. A GitHub account (to connect your repository to Vercel)

## Deployment Steps

### 1. Connect Your Repository to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in to your account
2. Click "New Project"
3. Import your EventMapper Pro repository from GitHub
4. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: Leave as is (root directory)
   - Build and Output Settings: Vercel will auto-detect these

### 2. Set Up Vercel Edge Config for Data Persistence

1. In your Vercel project dashboard, go to the "Storage" tab
2. Click "Create" and select "Edge Config"
3. Give your Edge Config store a name (e.g., "eventmapper-data")
4. Click "Create" to create the Edge Config store
5. Once created, you'll see an "EDGE_CONFIG" environment variable with a URL

### 3. Configure Environment Variables

1. In your Vercel project dashboard, go to the "Settings" tab
2. Click "Environment Variables" in the left sidebar
3. Add the following environment variable:
   - Name: `EDGE_CONFIG`
   - Value: The URL provided by Vercel Edge Config (it should look like `https://edge-config.vercel.com/ecfg_xxxxxxxxxxxxxxxxxxxxxxxx?token=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
   - Environment: Select "Production", "Preview", and "Development" or just "Production" if you prefer

### 4. Deploy the Project

1. Go back to the "Deployments" tab in your Vercel project
2. Click "Redeploy" if you already have a deployment, or Vercel will automatically start deploying
3. Wait for the deployment to complete

## How Data Persistence Works

EventMapper Pro uses Vercel Edge Config to store floor and tag data:

- When admin users make changes through the admin panel, the data is saved to Edge Config
- All users accessing the application will see the same data because it's stored centrally
- Edge Config provides low-latency, globally distributed key-value storage
- The free tier of Edge Config (included with Vercel free tier) is sufficient for most use cases

## Local Development with Edge Config

If you want to use Edge Config for local development:

1. Install the Vercel CLI: `npm install -g vercel`
2. Link your project: `vercel link`
3. Pull environment variables: `vercel env pull`
4. Run the development server: `npm run dev`

## Troubleshooting

### If Data Isn't Persisting

1. Ensure the `EDGE_CONFIG` environment variable is correctly set in Vercel
2. Check the deployment logs for any errors related to Edge Config
3. Verify that the Edge Config store was created correctly

### If You See "Data persistence is not available" Message

This message appears when Edge Config is not properly configured. Make sure:
1. The `EDGE_CONFIG` environment variable is set
2. The value is the complete URL provided by Vercel Edge Config
3. The environment variable is available in the correct environments (Production, Preview, Development)

## Scaling Considerations

- Vercel Edge Config free tier includes 100,000 reads and 5,000 writes per month
- For larger applications, consider upgrading to a paid Vercel plan
- The application is designed to handle the data structure efficiently with Edge Config

## Support

For any issues with deployment or configuration, refer to:
- [Vercel Edge Config Documentation](https://vercel.com/docs/storage/edge-config)
- [Next.js Deployment Documentation](https://nextjs.org/docs/app/building-your-application/deploying)