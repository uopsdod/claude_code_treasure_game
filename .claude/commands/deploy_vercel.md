# Deploy to Vercel

This command deploys the treasure hunting game to Vercel for public access.

## Usage
```bash
npx vercel --prod
```

## Prerequisites
- Vercel CLI installed globally: `npm install -g vercel`
- Vercel account setup
- Project built for production: `npm run build`

## Steps
1. Build the project for production
2. Deploy to Vercel with production flag
3. Configure environment variables if needed

## Notes
- First deployment will require Vercel login and project setup
- Subsequent deployments will update the existing project
- The command will output the live URL upon successful deployment