import { useLocalSearchParams } from "expo-router";
import { PlaceTankScreen } from "../../../src/features/sea/PlaceTankScreen";

export default function PlaceTankRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PlaceTankScreen id={String(id ?? "malapascua")} />;
}
