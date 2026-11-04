import { useState } from "react";
import { Image, StyleSheet, Text, View, type ImageStyle, type StyleProp, type ViewStyle } from "react-native";
import { SpeciesArtwork } from "./SpeciesArtwork";
import type { Species } from "../types/species";

type CatalogArtworkPlacement = "thumbnail" | "detail" | "candidate";

export function CatalogSpeciesArtwork({
  species,
  placement,
}: {
  species: Species;
  placement: CatalogArtworkPlacement;
}) {
  const artworkUrl = placement !== "detail"
    ? species.artwork?.thumbnail_url || species.artwork?.url
    : species.artwork?.url;
  const [failedArtworkUrl, setFailedArtworkUrl] = useState<string | null>(null);
  const onError = () => {
    if (artworkUrl) setFailedArtworkUrl(artworkUrl);
  };

  if (!artworkUrl || failedArtworkUrl === artworkUrl) {
    if (placement === "detail") return <SpeciesArtwork slug={species.slug} style={styles.detailArtwork} />;
    return <SpeciesArtwork slug={species.slug} style={placement === "candidate" ? styles.candidateArtwork : styles.artworkPlaceholder} />;
  }
  if (placement !== "detail") {
    return <Image source={{ uri: artworkUrl }} style={placement === "candidate" ? styles.candidateArtwork : styles.artworkPlaceholder} resizeMode="cover" accessible={false} onError={onError} />;
  }
  return <Image source={{ uri: artworkUrl }} style={styles.detailArtworkImage} resizeMode="cover" accessible={false} onError={onError} />;
}

export function ObservationPhotoImage({
  uri,
  style,
  accessibilityLabel,
  accessible = false,
}: {
  uri: string;
  style: StyleProp<ImageStyle>;
  accessibilityLabel: string;
  accessible?: boolean;
}) {
  const [failedUri, setFailedUri] = useState<string | null>(null);
  if (failedUri === uri) {
    return (
      <View
        accessible={accessible}
        accessibilityRole={accessible ? "image" : undefined}
        accessibilityLabel={`${accessibilityLabel}, 불러오지 못함`}
        style={[style as StyleProp<ViewStyle>, styles.photoThumbnailUnavailable]}
      >
        <Text accessible={false} style={styles.photoThumbnailUnavailableText}>사진을 불러오지 못했어요</Text>
      </View>
    );
  }
  return (
    <Image
      key={uri}
      source={{ uri }}
      style={style}
      resizeMode="cover"
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      onError={() => setFailedUri(uri)}
    />
  );
}

const styles = StyleSheet.create({
  artworkPlaceholder: { height: 98, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  detailArtwork: { height: 180, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  detailArtworkImage: { width: "100%", height: 180, borderRadius: 19, backgroundColor: "#EAF2EC" },
  photoThumbnailUnavailable: { alignItems: "center", justifyContent: "center", backgroundColor: "#EAF2EC", overflow: "hidden" },
  photoThumbnailUnavailableText: { paddingHorizontal: 5, color: "#71817A", fontSize: 8, textAlign: "center" },
  candidateArtwork: { width: 76, height: 64, borderRadius: 10, flexShrink: 0 },
});
