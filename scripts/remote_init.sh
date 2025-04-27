#!/bin/bash
set -e

# Remote setup using Git
REPO_URL="https://github.com/myferr/home-lab-controller.git"
DEFAULT_DIR="home-lab-controller"

# Check for Git
if ! command -v git &> /dev/null; then
    echo "❌ Git is required but not installed. Please install Git first."
    exit 1
fi

# Get target directory
TARGET_DIR="${1:-$DEFAULT_DIR}"

echo "🚀 Cloning home-lab-controller to: $TARGET_DIR"
git clone --depth 1 $REPO_URL "$TARGET_DIR"

cd "$TARGET_DIR"

# Setup environment
echo "📦 Installing dependencies..."
npm install

echo "🔧 Creating runtime directories..."
mkdir -p .hlc/{logs,pids}

echo "⚙️  Setting up permissions..."
chmod +x bin/hlc.js

echo "📝 Initializing config (if missing)..."
cp -n configs/hlc.config.example.yml configs/hlc.config.yml || true

echo "✅ Setup complete!"
echo -e "\nTo get started:"
echo "cd $TARGET_DIR"
echo "./bin/hlc.js start --command 'echo \"Hello World\"' --interval 5"
