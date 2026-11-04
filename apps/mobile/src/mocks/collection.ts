// Temporary collection data that matches the design canvas until GET /v1/collection is wired up (phase 4).

export type CollectionMark = { no: string; firstSeen: string; count: number; isNew?: boolean };

export const MOCK_COLLECTION: CollectionMark[] = [
  { no: "005", firstSeen: "2025-04-15", count: 2 },
  { no: "006", firstSeen: "2025-04-15", count: 3 },
  { no: "007", firstSeen: "2026-11-02", count: 1, isNew: true },
  { no: "009", firstSeen: "2025-09-12", count: 1 },
  { no: "010", firstSeen: "2025-09-12", count: 1 },
  { no: "012", firstSeen: "2025-09-14", count: 1 },
  { no: "014", firstSeen: "2025-09-11", count: 1 },
  { no: "015", firstSeen: "2025-09-12", count: 1 },
  { no: "017", firstSeen: "2025-04-16", count: 1 },
  { no: "026", firstSeen: "2026-11-01", count: 1, isNew: true },
  { no: "027", firstSeen: "2025-04-14", count: 2 },
  { no: "028", firstSeen: "2025-09-14", count: 1 },
  { no: "029", firstSeen: "2025-09-14", count: 1 },
  { no: "030", firstSeen: "2025-04-15", count: 4 },
  { no: "031", firstSeen: "2025-11-22", count: 1 },
  { no: "032", firstSeen: "2025-04-16", count: 1 },
  { no: "034", firstSeen: "2025-04-15", count: 2 },
  { no: "072", firstSeen: "2025-04-15", count: 3 },
  { no: "105", firstSeen: "2025-11-23", count: 1 },
  { no: "115", firstSeen: "2025-04-16", count: 1 },
  { no: "116", firstSeen: "2026-11-01", count: 1 },
  { no: "117", firstSeen: "2025-04-14", count: 1 },
  { no: "124", firstSeen: "2025-11-22", count: 1 },
  { no: "127", firstSeen: "2026-11-01", count: 1 },
  { no: "132", firstSeen: "2026-11-03", count: 1, isNew: true },
  { no: "135", firstSeen: "2025-11-23", count: 1 },
  { no: "137", firstSeen: "2025-11-22", count: 1 },
];
