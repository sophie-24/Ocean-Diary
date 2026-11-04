import { useLocalSearchParams } from "expo-router";
import { SpeciesDetailScreen } from "../../src/features/dogam/SpeciesDetailScreen";

export default function SpeciesDetailRoute() {
  const { no } = useLocalSearchParams<{ no: string }>();
  return <SpeciesDetailScreen no={String(no ?? "")} />;
}
