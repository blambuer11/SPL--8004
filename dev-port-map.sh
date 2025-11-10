#!/bin/zsh
# Map privileged ports 80 -> 8080 and 81 -> 8081 using macOS PF
# Requires sudo. Adds temporary rules without permanent /etc/pf.conf edit.
# Usage:
#   sudo ./dev-port-map.sh enable   # enable port forwarding
#   sudo ./dev-port-map.sh disable  # disable port forwarding
#   sudo ./dev-port-map.sh status   # show current pf status

set -euo pipefail

PF_ANCHOR_NAME="com.apple/dev_port_map"
# keep the file path simple even if anchor has slashes
PF_ANCHOR_FILE="/tmp/dev_port_map.conf"

create_rules() {
  cat >"${PF_ANCHOR_FILE}" <<'EOF'
# Auto-generated dev port mapping
rdr pass on lo0 inet  proto tcp from any to any port 80 -> 127.0.0.1 port 8080
rdr pass on lo0 inet  proto tcp from any to any port 81 -> 127.0.0.1 port 8081
# IPv6 localhost support
rdr pass on lo0 inet6 proto tcp from any to any port 80 -> ::1 port 8080
rdr pass on lo0 inet6 proto tcp from any to any port 81 -> ::1 port 8081
EOF
}

enable_pf() {
  create_rules
  # Load anchor rules
  sudo pfctl -Ev || true
  sudo pfctl -a "${PF_ANCHOR_NAME}" -f "${PF_ANCHOR_FILE}"
  sudo pfctl -s nat | grep "${PF_ANCHOR_NAME}" || echo "(Anchor loaded; nat table below)"
  echo "✅ Port forwarding enabled: 80->8080, 81->8081"
}

disable_pf() {
  sudo pfctl -a "${PF_ANCHOR_NAME}" -F nat || true
  echo "🧹 Cleared NAT rules for anchor ${PF_ANCHOR_NAME}"
}

status_pf() {
  sudo pfctl -s nat | grep -E '80|81' || echo "No NAT rules for ports 80/81"
}

case "${1:-}" in
  enable)
    enable_pf
    ;;
  disable)
    disable_pf
    ;;
  status)
    status_pf
    ;;
  *)
    echo "Usage: $0 {enable|disable|status}" >&2
    exit 1
    ;;
esac
