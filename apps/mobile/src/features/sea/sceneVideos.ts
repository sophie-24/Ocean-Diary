import type { SceneVideoMap } from "./VideoScene";

/**
 * Looping Higgsfield backgrounds per tank, keyed by time-of-day phase.
 * Drop files into `apps/mobile/assets/scenes/<tank>/<phase>.mp4` and add them here.
 * While a file is missing the tank falls back to its SVG scene.
 *
 * Specs for every file:
 *  - 9:16 (phone portrait), H.264 mp4, ~1080x1920
 *  - 5–8 seconds long, seamless loop (first and last frames match)
 *  - no camera cut, slow motion only, no on-screen fish or text
 *  - keep ~70% of the frame empty in the middle; the diver's own fish swim there
 */

// Comment out an entry to force the SVG fallback for that tank/phase.

export const reefVideos: SceneVideoMap = {
  // dawn: require("../../../assets/scenes/reef/dawn.mp4"),
  // day: require("../../../assets/scenes/reef/day.mp4"),
  // dusk: require("../../../assets/scenes/reef/dusk.mp4"),
  // night: require("../../../assets/scenes/reef/night.mp4"),
};

export const oceanVideos: SceneVideoMap = {
  // dawn: require("../../../assets/scenes/ocean/dawn.mp4"),
  // day: require("../../../assets/scenes/ocean/day.mp4"),
  // dusk: require("../../../assets/scenes/ocean/dusk.mp4"),
  // night: require("../../../assets/scenes/ocean/night.mp4"),
};

export const macroVideos: SceneVideoMap = {
  // day: require("../../../assets/scenes/macro/day.mp4"),
};
