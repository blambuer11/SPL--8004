#!/bin/bash
# Safe git history rewrite to re-attribute bot commits to the organization
# This script DOES NOT modify file contents, only author metadata

set -e

echo "=== Git History Re-attribution Script ==="
echo "This will replace external bot author names with 'NoemaProtocol Team' in commit history"
echo "Files and code will NOT be changed - only author names"
echo ""

# Safety check
if [ ! -d ".git" ]; then
    echo "Error: Must run from repository root"
    exit 1
fi

# Backup current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: $CURRENT_BRANCH"
echo ""

# Check if git-filter-repo is installed
if ! command -v git-filter-repo &> /dev/null; then
    echo "Installing git-filter-repo..."
    pip3 install git-filter-repo
fi

# Create backup branch
BACKUP_BRANCH="backup-before-rewrite-$(date +%Y%m%d-%H%M%S)"
echo "Creating backup branch: $BACKUP_BRANCH"
git branch "$BACKUP_BRANCH"
echo "✓ Backup created"
echo ""

# Perform the re-attribution
echo "Re-attributing bot commits to 'NoemaProtocol Team'..."
git filter-repo --force \
  --name-callback 'return b"NoemaProtocol Team" if b"[" in name or b"bot" in name else name' \
  --email-callback 'return b"team@noemaprotocol.xyz" if email.endswith(b"@users.noreply.github.com") else email'

echo ""
echo "✓ Re-attribution complete!"
echo ""
echo "Next steps:"
echo "1. Verify changes: git log --all --format='%an <%ae>' | sort -u"
echo "2. Check file integrity: git diff $BACKUP_BRANCH HEAD (should show no file changes)"
echo "3. Force push to update remote: git push --force origin $CURRENT_BRANCH"
echo ""
echo "To restore if needed: git reset --hard $BACKUP_BRANCH"
