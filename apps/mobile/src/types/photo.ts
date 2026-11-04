import type * as ImagePicker from "expo-image-picker";

export type PhotoSelection = Pick<
  ImagePicker.ImagePickerAsset,
  "uri" | "width" | "height" | "fileName" | "fileSize" | "mimeType"
>;
