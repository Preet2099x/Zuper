#!/bin/bash
# Production Build Script for Zuper (Linux/Mac)
# Run: chmod +x build-prod.sh && ./build-prod.sh

echo "🚀 Building Zuper for Production..."
echo ""

# Check if we're on prod branch
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" != "prod" ]; then
    echo "⚠️  Warning: Not on prod branch (current: $current_branch)"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Build cancelled"
        exit 1
    fi
fi

# Backend Build
echo "📦 Installing Backend Dependencies..."
cd backend
npm install --production

if [ $? -ne 0 ]; then
    echo "❌ Backend dependency installation failed"
    exit 1
fi

echo "✅ Backend dependencies installed"
echo ""

# Frontend Build
echo "📦 Installing Frontend Dependencies..."
cd ../frontend
npm install

if [ $? -ne 0 ]; then
    echo "❌ Frontend dependency installation failed"
    exit 1
fi

echo "🔨 Building Frontend for Production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

echo "✅ Frontend built successfully"
echo ""

# Return to root
cd ..

echo "✨ Production Build Complete!"
echo ""
echo "📋 Next Steps:"
echo "  1. Update backend/.env with production values"
echo "  2. Deploy backend/ to your server (Railway, Render, Heroku, etc.)"
echo "  3. Deploy frontend/dist to Vercel/Netlify or serve with nginx"
echo ""
echo "📄 See PRODUCTION_DEPLOYMENT.md for detailed instructions"
