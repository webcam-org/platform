#!/bin/bash
# Amcrest PTZ control script for Frigate
# Usage: amcrest-ptz.sh CAMERA_IP PASSWORD ACTION

IP=$1
PASS=$2
ACTION=$3

case $ACTION in
    move_up)
        curl --digest -u admin:$PASS "http://${IP}/cgi-bin/ptz.cgi?action=start&channel=0&code=Up&arg1=0&arg2=1&arg3=0"
        sleep 0.5
        curl --digest -u admin:$PASS "http://${IP}/cgi-bin/ptz.cgi?action=stop&channel=0&code=Up"
        ;;
    move_down)
        curl --digest -u admin:$PASS "http://${IP}/cgi-bin/ptz.cgi?action=start&channel=0&code=Down&arg1=0&arg2=1&arg3=0"
        sleep 0.5
        curl --digest -u admin:$PASS "http://${IP}/cgi-bin/ptz.cgi?action=stop&channel=0&code=Down"
        ;;
    move_left)
        curl --digest -u admin:$PASS "http://${IP}/cgi-bin/ptz.cgi?action=start&channel=0&code=Left&arg1=0&arg2=1&arg3=0"
        sleep 0.5
        curl --digest -u admin:$PASS "http://${IP}/cgi-bin/ptz.cgi?action=stop&channel=0&code=Left"
        ;;
    move_right)
        curl --digest -u admin:$PASS "http://${IP}/cgi-bin/ptz.cgi?action=start&channel=0&code=Right&arg1=0&arg2=1&arg3=0"
        sleep 0.5
        curl --digest -u admin:$PASS "http://${IP}/cgi-bin/ptz.cgi?action=stop&channel=0&code=Right"
        ;;
    zoom_in)
        curl --digest -u admin:$PASS "http://${IP}/cgi-bin/ptz.cgi?action=start&channel=0&code=ZoomTele&arg1=0&arg2=1&arg3=0"
        sleep 0.5
        curl --digest -u admin:$PASS "http://${IP}/cgi-bin/ptz.cgi?action=stop&channel=0&code=ZoomTele"
        ;;
    zoom_out)
        curl --digest -u admin:$PASS "http://${IP}/cgi-bin/ptz.cgi?action=start&channel=0&code=ZoomWide&arg1=0&arg2=1&arg3=0"
        sleep 0.5
        curl --digest -u admin:$PASS "http://${IP}/cgi-bin/ptz.cgi?action=stop&channel=0&code=ZoomWide"
        ;;
esac
