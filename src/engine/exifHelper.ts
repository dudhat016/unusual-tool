/**
 * Applies EXIF orientation transformation to a 2D canvas context
 */
export function applyOrientationTransform(
  ctx: CanvasRenderingContext2D,
  orientation: number,
  width: number,
  height: number
): { destWidth: number; destHeight: number } {
  let destWidth = width;
  let destHeight = height;

  switch (orientation) {
    case 2:
      // Horizontal flip
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      break;
    case 3:
      // 180 rotate
      ctx.translate(width, height);
      ctx.rotate(Math.PI);
      break;
    case 4:
      // Vertical flip
      ctx.translate(0, height);
      ctx.scale(1, -1);
      break;
    case 5:
      // Vertical flip + 90 rotate
      ctx.rotate(0.5 * Math.PI);
      ctx.scale(1, -1);
      destWidth = height;
      destHeight = width;
      break;
    case 6:
      // 90 rotate clockwise
      ctx.rotate(0.5 * Math.PI);
      ctx.translate(0, -height);
      destWidth = height;
      destHeight = width;
      break;
    case 7:
      // Horizontal flip + 90 rotate
      ctx.rotate(0.5 * Math.PI);
      ctx.translate(width, -height);
      ctx.scale(-1, 1);
      destWidth = height;
      destHeight = width;
      break;
    case 8:
      // 90 rotate counter-clockwise
      ctx.rotate(-0.5 * Math.PI);
      ctx.translate(-width, 0);
      destWidth = height;
      destHeight = width;
      break;
    case 1:
    default:
      // Normal orientation
      break;
  }

  return { destWidth, destHeight };
}

/**
 * Checks if an image canvas data contains any transparent or semi-transparent pixels (alpha < 255)
 */
export function hasAlphaTransparency(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  try {
    const sampleW = Math.min(64, width);
    const sampleH = Math.min(64, height);
    const imgData = ctx.getImageData(0, 0, sampleW, sampleH).data;
    for (let i = 3; i < imgData.length; i += 4) {
      if (imgData[i] < 250) {
        return true;
      }
    }
  } catch {
    // If security error on tainted canvas, default to false
  }
  return false;
}
