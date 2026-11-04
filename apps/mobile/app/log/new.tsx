import { useLocalSearchParams } from "expo-router";
import { LogFormScreen } from "../../src/features/log/LogFormScreen";
import type { LogKind } from "../../src/features/log/logStore";

const KINDS: LogKind[] = ["scuba", "free", "snorkel"];

export default function NewLogRoute() {
  const { kind } = useLocalSearchParams<{ kind?: string }>();
  const initial = KINDS.includes(kind as LogKind) ? (kind as LogKind) : "scuba";
  return <LogFormScreen initialKind={initial} />;
}
