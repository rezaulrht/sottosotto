#!/usr/bin/env bash
# Hero video (D37, D51, ARCHITECTURE §6.2).
#
# Placeholder until the client's video arrives (D9): a slow, seamless loop of dish photos
# with gentle push-ins and crossfades. To use a real clip instead, pass it as HERO_SRC and
# the same encodes and poster are made from it.
#
#   npm run video                          # placeholder from the dish photos
#   HERO_SRC=path/to/clip.mov npm run video
#   FFMPEG=/path/to/ffmpeg npm run video   # if ffmpeg is not on PATH
#
# Other clips (D71): CLIP_NAME names the outputs and the manifest key; CLIP_SRC is the
# source; CLIP_FPS keeps its frame rate; POSTER_AT picks the poster frame (seconds);
# MAX_MP4_MB caps the 1080p MP4; X264_CRF / VP9_CRF trade quality for size.
#   CLIP_NAME=findus CLIP_SRC="../sotto sotto assets/video/intro-drone.mov" CLIP_FPS=24 \
#     POSTER_AT=6 MAX_MP4_MB=6 X264_CRF=35 VP9_CRF=48 npm run video
#
# Quality tuned in M2: x264 CRF 31 (film), VP9 CRF 38; 1080p MP4 must stay under 4 MB.
# Outputs (committed): public/video/hero-{1080,720}.{mp4,webm}, plus the poster through
# scripts/video-poster.ts (AVIF/WebP + src/content/video-manifest.json).
set -euo pipefail

cd "$(dirname "$0")/.."
FFMPEG="${FFMPEG:-ffmpeg}"
ASSET_SRC="${ASSET_SRC:-../sotto sotto assets}"
OUT=public/video
WORK=.cache/video
NAME="${CLIP_NAME:-hero}"
HERO_SRC="${CLIP_SRC:-${HERO_SRC:-}}"
MAX_MP4_BYTES=$((${MAX_MP4_MB:-4} * 1024 * 1024))

command -v "$FFMPEG" >/dev/null || {
  echo "✗ ffmpeg not found. Install it (apt install ffmpeg) or set FFMPEG=/path/to/ffmpeg." >&2
  exit 1
}
mkdir -p "$OUT" "$WORK"

FPS=${CLIP_FPS:-30}
CLIP=6     # seconds each photo is on screen
FADE=1.5   # crossfade length
STEP=$(awk "BEGIN{print $CLIP-$FADE}")

# Shot list: photo and camera move. The first shot is repeated at the end so the loop
# is seamless (see the trim below). Moves: in = push in, out = pull back, left/right = pan.
SHOTS=(
  "Moody Charcuterie Board with Grilled Bites.png|in"
  "Steaming Fettuccine with Thyme and Seared Garnishes.png|right"
  "Steaming Shrimp Linguine in Rustic Parchment.png|out"
  "Pistachio-Crusted Steak with Root Vegetables.png|left"
  "Cocoa-Dusted Tiramisu on a Glowing Plate.png|in"
)

zoom_expr() {
  local frames=$((CLIP * FPS))
  case "$1" in
    in) echo "z='1.04+0.10*on/$frames':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2'" ;;
    out) echo "z='1.14-0.10*on/$frames':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2'" ;;
    right) echo "z='1.12':x='(iw-iw/zoom)*(0.25+0.5*on/$frames)':y='ih/2-ih/zoom/2'" ;;
    left) echo "z='1.12':x='(iw-iw/zoom)*(0.75-0.5*on/$frames)':y='ih/2-ih/zoom/2'" ;;
  esac
}

if [[ -n "${HERO_SRC:-}" ]]; then
  echo "→ Source clip: $HERO_SRC"
  "$FFMPEG" -y -loglevel error -i "$HERO_SRC" -an \
    -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=$FPS" \
    -c:v libx264 -crf 12 -preset veryfast -pix_fmt yuv420p "$WORK/master.mp4"
else
  echo "→ Placeholder loop from ${#SHOTS[@]} dish photos"
  inputs=()
  filters=""
  sequence=("${SHOTS[@]}" "${SHOTS[0]}")
  for i in "${!sequence[@]}"; do
    file="${sequence[$i]%%|*}"
    move="${sequence[$i]##*|}"
    [[ -f "$ASSET_SRC/$file" ]] || { echo "✗ Missing photo: $ASSET_SRC/$file" >&2; exit 1; }
    inputs+=(-loop 1 -framerate "$FPS" -t "$CLIP" -i "$ASSET_SRC/$file")
    # Upscale first so the slow zoom does not jitter; crop to 16:9; slight grade.
    filters+="[$i:v]scale=3840:-2:flags=lanczos,crop=3840:2160,"
    filters+="zoompan=$(zoom_expr "$move"):d=1:s=1920x1080:fps=$FPS,"
    filters+="eq=saturation=0.9:brightness=-0.02,setsar=1,format=yuv420p[v$i];"
  done
  # Chain crossfades: v0 ⨯ v1 ⨯ … ⨯ v5 (v5 is the first shot again).
  prev="v0"
  last=$((${#sequence[@]} - 1))
  for i in $(seq 1 "$last"); do
    offset=$(awk "BEGIN{print $STEP*$i}")
    filters+="[$prev][v$i]xfade=transition=fade:duration=$FADE:offset=$offset[x$i];"
    prev="x$i"
  done
  # Seamless loop: start FADE seconds in (shot 1, pure) and stop where the repeated shot 1
  # reaches the same frame, i.e. the end of its crossfade.
  start=$FADE
  end=$(awk "BEGIN{print $STEP*$last + $FADE}")
  filters+="[$prev]trim=start=$start:end=$end,setpts=PTS-STARTPTS,fps=$FPS[out]"
  "$FFMPEG" -y -loglevel error "${inputs[@]}" -filter_complex "$filters" -map "[out]" -an -r "$FPS" \
    -c:v libx264 -crf 12 -preset veryfast -pix_fmt yuv420p "$WORK/master.mp4"
fi

echo "→ Encoding"
x264() { # $1 height, $2 out
  "$FFMPEG" -y -loglevel error -i "$WORK/master.mp4" -an -vf "scale=-2:$1:flags=lanczos" \
    -c:v libx264 -crf "${X264_CRF:-31}" -preset slow -tune film -profile:v high -pix_fmt yuv420p -g $((FPS * 2)) \
    -movflags +faststart "$2"
}
vp9() { # $1 height, $2 out
  "$FFMPEG" -y -loglevel error -i "$WORK/master.mp4" -an -vf "scale=-2:$1:flags=lanczos" \
    -c:v libvpx-vp9 -crf "${VP9_CRF:-38}" -b:v 0 -row-mt 1 -deadline good -cpu-used 2 -pix_fmt yuv420p \
    -g $((FPS * 2)) "$2"
}
x264 1080 "$OUT/$NAME-1080.mp4"
x264 720 "$OUT/$NAME-720.mp4"
vp9 1080 "$OUT/$NAME-1080.webm"
vp9 720 "$OUT/$NAME-720.webm"

echo "→ Poster (frame at ${POSTER_AT:-0} s)"
"$FFMPEG" -y -loglevel error -ss "${POSTER_AT:-0}" -i "$WORK/master.mp4" -frames:v 1 "$WORK/$NAME-poster.png"
npx tsx scripts/video-poster.ts "$WORK/$NAME-poster.png" "$NAME"

bytes() { stat -c %s "$1" 2>/dev/null || stat -f %z "$1"; }
for f in "$OUT"/"$NAME"-*.mp4 "$OUT"/"$NAME"-*.webm; do
  printf '  %-28s %6d KB\n' "$f" $(($(bytes "$f") / 1024))
done
size=$(bytes "$OUT/$NAME-1080.mp4")
if ((size > MAX_MP4_BYTES)); then
  echo "✗ $NAME-1080.mp4 is over ${MAX_MP4_MB:-4} MB ($((size / 1024)) KB). Raise the CRF or shorten the loop." >&2
  exit 1
fi
echo "✓ $NAME video done"
