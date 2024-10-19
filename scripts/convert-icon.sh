#!/bin/bash

# Ensure the output directory exists
mkdir -p public/icons

# Path to your SVG file
SVG_FILE="icon.svg"

# Convert SVG to PNG and resize
for size in 16 32 48 128; do
  sips -s format png -z $size $size "$SVG_FILE" --out "public/icons/icon-${size}.png"
done

echo "Icon conversion complete!"