import { useLocalSearchParams } from "expo-router";
import { DiaryDecorateScreen } from "../../../src/features/diary/DiaryDecorateScreen";

export default function DiaryDecorateRoute() {
  const { logId } = useLocalSearchParams<{ logId: string }>();
  return <DiaryDecorateScreen logId={String(logId ?? "")} />;
}
