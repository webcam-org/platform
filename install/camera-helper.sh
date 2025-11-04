#!/bin/bash
# Helper script to generate camera config with brand detection

# Brand-specific RTSP paths
get_rtsp_path() {
    local IP=$1
    local USER=$2
    local PASS=$3
    local BRAND=${4:-amcrest}

    case "$BRAND" in
        amcrest|dahua)
            echo "rtsp://${USER}:${PASS}@${IP}:554/cam/realmonitor?channel=1&subtype=0"
            ;;
        hikvision)
            echo "rtsp://${USER}:${PASS}@${IP}:554/Streaming/Channels/101"
            ;;
        axis)
            echo "rtsp://${USER}:${PASS}@${IP}:554/axis-media/media.amp"
            ;;
        foscam)
            echo "rtsp://${USER}:${PASS}@${IP}:554/videoMain"
            ;;
        reolink)
            echo "rtsp://${USER}:${PASS}@${IP}:554/h264Preview_01_main"
            ;;
        *)
            # Generic ONVIF path
            echo "rtsp://${USER}:${PASS}@${IP}:554/stream1"
            ;;
    esac
}

# Detect camera brand via ONVIF
detect_camera_brand() {
    local IP=$1
    # Simple brand detection via manufacturer string
    # This would query ONVIF GetDeviceInformation
    # For now, default to amcrest
    echo "amcrest"
}
