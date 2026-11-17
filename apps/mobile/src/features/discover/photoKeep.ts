import { Platform } from "react-native";
import { Directory, File, Paths } from "expo-file-system";

/**
 * The picker hands back files in the app cache, which iOS may clear. Until a photo is uploaded we
 * keep our own copy in the documents folder so an interrupted 발견 session can resume.
 */
const folder = () => new Directory(Paths.document, "discover-pending");
const safeName = (id: string) => id.replace(/[^A-Za-z0-9_-]/g, "_").slice(-80);

export function keepPhoto(uri: string, id: string): string {
  if (Platform.OS === "web") return uri;
  try {
    const dir = folder();
    if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
    const ext = uri.toLowerCase().endsWith(".png") ? "png" : "jpg";
    const dest = new File(dir, `${safeName(id)}.${ext}`);
    if (!dest.exists) new File(uri).copySync(dest);
    return dest.uri;
  } catch {
    return uri;
  }
}

export function forgetKeptPhotos() {
  if (Platform.OS === "web") return;
  try {
    const dir = folder();
    if (dir.exists) dir.delete();
  } catch {
    // Nothing to clean up, or the OS already did.
  }
}
