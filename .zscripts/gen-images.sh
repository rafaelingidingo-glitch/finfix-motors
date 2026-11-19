#!/bin/bash
# Generate all brand images for Elly Magari website
set -u
cd /home/z/my-project

gen() {
  local prompt="$1"
  local output="$2"
  local size="$3"
  for attempt in 1 2 3; do
    if z-ai image -p "$prompt" -o "$output" -s "$size" >/dev/null 2>&1; then
      if [ -f "$output" ]; then
        echo "OK: $output (attempt $attempt)"
        return 0
      fi
    fi
    sleep 2
  done
  echo "FAILED: $output"
  return 1
}

gen "Ultra premium automotive showroom photography, dark charcoal modern luxury car dealership showroom interior, dramatic warm spot lighting, subtle golden accent lights, glossy dark reflective floor, wide cinematic angle, moody premium atmosphere, no people, no text, photorealistic, high quality" "public/images/hero.jpg" "1440x720"

gen "Modern premium car dealership showroom interior with several new cars, large glass windows with warm natural daylight, clean polished floor, elegant minimal architecture, no people, no text, photorealistic automotive photography, high quality" "public/images/about-showroom.jpg" "1344x768"

gen "Photorealistic white full size luxury SUV similar to Toyota Land Cruiser Prado, three quarter front view, parked in bright modern showroom, professional automotive photography, clean light grey background, no people, no text, no watermark, high quality" "public/images/cars/prado.jpg" "1152x864"

gen "Photorealistic silver grey double cab pickup truck similar to Toyota Hilux, three quarter front view, on clean tarmac with modern building background, professional automotive photography, no people, no text, no watermark, high quality" "public/images/cars/hilux.jpg" "1152x864"

gen "Photorealistic silver compact sedan car similar to Toyota Corolla, three quarter front view, modern city street with soft daylight, professional automotive photography, no people, no text, no watermark, high quality" "public/images/cars/corolla.jpg" "1152x864"

gen "Photorealistic dark grey mid size crossover SUV similar to Nissan X-Trail, three quarter front view, clean modern showroom background, professional automotive photography, no people, no text, no watermark, high quality" "public/images/cars/xtrail.jpg" "1152x864"

gen "Photorealistic deep red compact crossover SUV similar to Mazda CX-5, three quarter front view, clean light studio background, professional automotive photography, no people, no text, no watermark, high quality" "public/images/cars/cx5.jpg" "1152x864"

gen "Photorealistic black executive luxury sedan similar to Mercedes Benz E-Class, three quarter front view, elegant dark showroom with warm lighting, professional automotive photography, no people, no text, no watermark, high quality" "public/images/cars/e200.jpg" "1152x864"

gen "Photorealistic pearl white mid size luxury crossover SUV similar to Toyota Harrier, three quarter front view, modern architecture background with soft daylight, professional automotive photography, no people, no text, no watermark, high quality" "public/images/cars/harrier.jpg" "1152x864"

gen "Photorealistic light silver compact hatchback car similar to Honda Fit, three quarter front view, bright clean studio background, professional automotive photography, no people, no text, no watermark, high quality" "public/images/cars/fit.jpg" "1152x864"

echo "ALL DONE"
