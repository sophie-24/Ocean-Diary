import { useLocalSearchParams } from "expo-router";
import { LogDetailScreen } from "../../src/features/log/LogDetailScreen";

export default function LogDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <LogDetailScreen id={String(id ?? "")} />;
}
