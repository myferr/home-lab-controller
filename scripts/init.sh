#!/bin/bash
set -e

# Initialize home-lab-controller setup
echo "🚀 Starting home-lab-controller setup..."

# Verify Node.js installation
if ! command -v node &> /dev/null; then
    echo "⚠️  Node.js not found. Installing Node.js 18 via nvm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install 18
    nvm use 18
fi

# Create directory structure
echo "📂 Creating directory structure..."
mkdir -p \
    bin \
    src \
    configs \
    test \
    .hlc/{logs,pids}

# Create default config if not exists
CONFIG_FILE="configs/hlc.config.yml"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "📝 Creating default config file..."
    cat > "$CONFIG_FILE" <<EOL
jobs:
  - name: "Example Job"
    command: "echo 'Hello from HLC!'"
    interval: 5
EOL
fi

# Create environment file
echo "🔧 Creating environment setup..."
cat > .env <<EOL
# Home Lab Controller Configuration
HLC_LOG_LEVEL=info
HLC_PID_DIR=.hlc/pids
HLC_LOG_DIR=.hlc/logs
EOL

# Install dependencies
echo "📦 Installing npm dependencies..."
npm install commander execa fs-extra js-yaml uuid

# Make CLI executable
echo "🔑 Making hlc executable..."
chmod +x bin/hlc.js


echo "✅ Setup complete!"
echo " "
echo "Next steps:"
echo "1. Edit config file: nano $CONFIG_FILE"
echo "2. Start service: ./bin/hlc.js start --command \"your-command\" --interval 10"
echo "3. Test with: npm test"
echo " "
echo "To run in daemon mode:"
echo "./bin/hlc.js start --daemon --config $CONFIG_FILE"