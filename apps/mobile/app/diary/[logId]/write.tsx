import { useLocalSearchParams } from "expo-router";
import { DiaryWriteScreen } from "../../../src/features/diary/DiaryWriteScreen";

export default function DiaryWriteRoute() {
  const { logId } = useLocalSearchParams<{ logId: string }>();
  return <DiaryWriteScreen logId={String(logId ?? "")} />;
}
