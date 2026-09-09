# Deploy to GitHub Pages

This command deploys the treasure hunt game to GitHub Pages with automatic repository setup and authentication handling.

## Automated Deployment Process

Claude will automatically handle:
1. Authentication verification and GitHub CLI login
2. Repository creation or validation
3. Remote URL configuration
4. Vite base path configuration
5. Build and deployment

## Command Logic

```bash
# Step 1: Check authentication status
gh auth status

# Step 2: If not authenticated, login
gh auth login

# Step 3: Check current git remote and permissions
git remote -v
gh repo list

# Step 4: Handle repository access issues
# If permission denied to current remote:
#   - Check if user owns a repository with same name
#   - If not, create new repository: gh repo create REPO_NAME --public
#   - Update remote URL: git remote set-url origin https://github.com/USERNAME/REPO_NAME.git

# Step 5: Verify/update Vite configuration
# Ensure vite.config.ts has correct base path: base: '/REPO_NAME/'

# Step 6: Build and deploy
npm run build
npm install --save-dev gh-pages
git push -u origin current-branch  # Push code first
npx gh-pages -d build -b gh-pages   # Deploy to gh-pages branch

# Step 7: Display completion message
echo "🚀 Deployment complete! Your game will be available at:"
echo "https://USERNAME.github.io/REPO_NAME"
echo ""
echo "Note: It may take a few minutes for the site to be live."
```

## What This Does

1. Verifies GitHub authentication and logs in if needed
2. Checks repository access and creates new repo if permission denied
3. Updates git remote URL to match authenticated user
4. Verifies Vite base path configuration for GitHub Pages
5. Builds the React app for production (outputs to `build/` directory)
6. Installs gh-pages utility for deployment
7. Pushes code to repository
8. Deploys build folder contents to the `gh-pages` branch
9. GitHub Pages automatically serves the content from this branch

## Common Scenarios Handled

### Authentication Issues
- **Not logged in**: Automatically prompts for `gh auth login`
- **Wrong account**: Creates new repository under authenticated user
- **Permission denied**: Creates new repository and updates remote URL

### Repository Issues
- **No remote**: Sets up remote to new repository
- **Wrong remote**: Updates remote URL to match authenticated user
- **Repository doesn't exist**: Creates new public repository

### Configuration Issues
- **Missing base path**: Ensures vite.config.ts has correct base path
- **Wrong base path**: Updates to match repository name

## Troubleshooting

- **404 errors**: GitHub Pages enabled automatically when using gh-pages deployment
- **Site not updating**: GitHub Pages can take 5-10 minutes to reflect changes
- **Assets not loading (blank page)**: Base path should be automatically configured
- **Browser shows old version**: Hard refresh (Cmd+Shift+R / Ctrl+F5) or try incognito mode
- **Permission errors**: Command will create new repository under your account
- **Build fails**: Check that all dependencies are installed with `npm install`

## Manual Override Options

If you need to use a specific repository or account:
```bash
# Use existing repository (must have push access)
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Create repository with specific name
gh repo create SPECIFIC_NAME --public
```

## Clean up (Optional)
```bash
gh auth logout
git branch --unset-upstream
```
