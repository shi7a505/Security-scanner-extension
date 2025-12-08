#!/bin/bash
# Create simple placeholder icons using ImageMagick (if available)
# Otherwise, we'll just create empty files as placeholders

# Check if ImageMagick is installed
if command -v convert &> /dev/null; then
  # Create colored square icons with text
  for size in 16 32 48 128; do
    convert -size ${size}x${size} xc:#667eea \
      -gravity center \
      -pointsize $((size/3)) \
      -fill white \
      -annotate +0+0 "🔒" \
      icon${size}.png 2>/dev/null || echo "Icon generation skipped"
  done
else
  # Create placeholder text files
  echo "Placeholder icon 16x16" > icon16.png
  echo "Placeholder icon 32x32" > icon32.png
  echo "Placeholder icon 48x48" > icon48.png
  echo "Placeholder icon 128x128" > icon128.png
fi
