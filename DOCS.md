# Home Lab Controller

A simple CLI tool for scheduling and managing recurring tasks. Built with Node.js for performance and extensibility.

## Features

- Interval-based task scheduling
- Daemon mode for background operation
- YAML configuration support
- Comprehensive logging system
- Process monitoring and management
- Environment-based configuration
- System resource tracking

## Prerequisites

- Node.js 18+
- npm 9+
- Git (for remote installation)
- Bash shell

## Installation

### Local Installation (Fresh Setup)

```bash
# Download and run initialization script
git clone https://github.com/myferr/home-lab-controller.git

cd "home-lab-controller"

chmod +x scripts/init.sh
./scripts/init.sh
```

### Remote Installation (Git Clone)

```bash
# One-line install (default directory)
bash <(curl -Ss https://raw.githubusercontent.com/yourusername/home-lab-controller/main/scripts/remote_init.sh)

# Custom directory
bash <(curl -Ss <GitHub_Raw>) /path/to/custom-directory
```

## Configuration

### Configuration File (`configs/hlc.config.yml`)

```yaml
jobs:
  - name: "Test"
    command: "echo 'hello world'"
    interval: 1 # 1 second

  - name: "System Health Check"
    command: "./scripts/health-check.sh"
    interval: 300 # 5 minutes
```

### Environment Variables (`.env`)

```ini
# Logging Configuration
HLC_LOG_LEVEL=debug
HLC_LOG_DIR=.hlc/logs
HLC_LOG_RETENTION=30d

# Process Management
HLC_PID_DIR=.hlc/pids
HLC_MAX_CONCURRENT_JOBS=5
```

## Usage

### Basic Commands

```bash
# Start service with single command
./bin/hlc.js start --command "node my-script.js" --interval <INTERVAL>

# Use configuration file
./bin/hlc.js start --config configs/hlc.config.yml

# Daemon mode
./bin/hlc.js start --daemon --config configs/production.config.yml

# Stop service
./bin/hlc.js stop
```

## License 📄

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.
