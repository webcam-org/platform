#!/bin/bash
# webcam.org SMART installer - auto-detects camera brands

set -e

echo "🎥 webcam.org installer"
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    echo "✓ Docker installed. Run: newgrp docker"
    echo "Then run installer again."
    exit 0
fi

if ! docker ps &> /dev/null 2>&1; then
    sudo usermod -aG docker $USER
fi

# Install deps
echo "Installing tools..."
sudo apt-get install -y nmap curl > /dev/null 2>&1 || true

# Create dir
INSTALL_DIR="$HOME/webcam-org"
mkdir -p "$INSTALL_DIR" && cd "$INSTALL_DIR"

# Download
echo "Downloading..."
curl -sSL -o docker-compose.yml webcam.org/install/docker-compose.yml

# Scan network
echo ""
echo "🔍 Scanning network for cameras..."
LOCAL_IP=$(ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | grep -v '127.0.0.1' | head -1)
NETWORK=$(echo $LOCAL_IP | cut -d. -f1-3)
echo "Network: ${NETWORK}.0/24"

CAMERA_IPS=$(nmap -p 554 --open ${NETWORK}.0/24 2>/dev/null | grep "Nmap scan report" | grep -oE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+')

if [ -z "$CAMERA_IPS" ]; then
    echo "⚠️  No cameras found"
    exit 1
fi

echo "✓ Found cameras:"
for IP in $CAMERA_IPS; do
    echo "  - $IP"
done

# Detect camera brands via ONVIF
echo ""
echo "🔎 Detecting camera brands..."

detect_brand() {
    local IP=$1
    # Try to get device info via ONVIF HTTP
    RESPONSE=$(curl -s --max-time 2 "http://${IP}/onvif/device_service" 2>/dev/null || echo "")

    if echo "$RESPONSE" | grep -qi "amcrest\|dahua"; then
        echo "amcrest"
    elif echo "$RESPONSE" | grep -qi "hikvision"; then
        echo "hikvision"
    elif echo "$RESPONSE" | grep -qi "axis"; then
        echo "axis"
    elif echo "$RESPONSE" | grep -qi "foscam"; then
        echo "foscam"
    elif echo "$RESPONSE" | grep -qi "reolink"; then
        echo "reolink"
    else
        echo "generic"
    fi
}

get_rtsp_path() {
    local BRAND=$1
    local IP=$2
    local PASS=$3

    case "$BRAND" in
        amcrest)
            echo "rtsp://admin:${PASS}@${IP}:554/cam/realmonitor?channel=1&subtype=0"
            ;;
        hikvision)
            echo "rtsp://admin:${PASS}@${IP}:554/Streaming/Channels/101"
            ;;
        axis)
            echo "rtsp://admin:${PASS}@${IP}:554/axis-media/media.amp"
            ;;
        foscam)
            echo "rtsp://admin:${PASS}@${IP}:554/videoMain"
            ;;
        reolink)
            echo "rtsp://admin:${PASS}@${IP}:554/h264Preview_01_main"
            ;;
        *)
            # Unknown brand - let user choose
            echo "unknown"
            ;;
    esac
}

# Generate config
mkdir -p config
cat > config/config.yml << 'EOFSTART'
mqtt:
  enabled: false

cameras:
EOFSTART

COUNTER=1
for IP in $CAMERA_IPS; do
    BRAND=$(detect_brand $IP)
    echo "  $IP: $BRAND"

    # If unknown, ask user
    if [ "$BRAND" = "generic" ] || [ "$BRAND" = "unknown" ]; then
        echo ""
        echo "Select camera brand:"
        echo "  1) Amcrest/Dahua"
        echo "  2) Hikvision"
        echo "  3) Axis"
        echo "  4) Foscam"
        echo "  5) Reolink"
        echo "  6) Other"
        read -p "Choice (1-6): " CHOICE < /dev/tty
        case $CHOICE in
            1) BRAND="amcrest" ;;
            2) BRAND="hikvision" ;;
            3) BRAND="axis" ;;
            4) BRAND="foscam" ;;
            5) BRAND="reolink" ;;
            *) BRAND="generic" ;;
        esac
    fi

    echo ""
    read -p "Password for $BRAND camera at $IP: " CAM_PASS < /dev/tty

    RTSP_PATH=$(get_rtsp_path "$BRAND" "$IP" "$CAM_PASS")

    cat >> config/config.yml << CAMEOF
  ${BRAND}${COUNTER}:
    enabled: true
    ffmpeg:
      inputs:
        - path: ${RTSP_PATH}
          roles:
            - detect
    detect:
      enabled: true
      width: 1920
      height: 1080
    onvif:
      host: ${IP}
      port: 80
      user: admin
      password: ${CAM_PASS}

CAMEOF
    COUNTER=$((COUNTER + 1))
done

mkdir -p media integration

# Download integration service
curl -sSL -o integration/integration.py webcam.org/install/integration.py

# Add MQTT to Frigate config
cat >> config/config.yml << 'MQTTEOF'

mqtt:
  enabled: true
  host: mqtt
  port: 1883

MQTTEOF

# Start
echo ""
echo "🚀 Starting Frigate..."
if docker ps &> /dev/null; then
    docker-compose down 2>/dev/null || true
    docker-compose up -d
else
    sg docker -c "docker-compose down 2>/dev/null || true; docker-compose up -d"
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "📺 Frigate: http://localhost:5001"
echo "⏱️  Wait 60 seconds for startup"
echo ""
echo "Installed services:"
echo "  - Frigate (AI camera NVR)"
echo "  - MQTT (event messaging)"
echo "  - webcam.org integration (ready for backend)"
echo ""
echo "Configured cameras:"
COUNTER=1
for IP in $CAMERA_IPS; do
    BRAND=$(detect_brand $IP)
    echo "  - ${BRAND}${COUNTER} at $IP"
    COUNTER=$((COUNTER + 1))
done
echo ""
echo "Next: Download mobile app for push notifications!"
echo ""
