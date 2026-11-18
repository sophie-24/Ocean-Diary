import type { ReactNode } from "react";

/**
 * iOS-스타일 폰 목업. Experience 섹션의 세 탭을 이 안에 꽂아서
 * "실제 Mola 앱이 이렇게 돌아가는 미리보기"로 보여준다.
 *
 * 폰 바디 색은 네이비(colors.navy)로 Mola 브랜드와 어울리게.
 * 내부 스크린은 실제 iPhone 15 Pro 비율(390x844)로 고정하되
 * CSS transform으로 랜딩 안에서 자연스럽게 축소 렌더.
 */
export function PhoneFrame({
  children,
  tilt = 0,
}: {
  children: ReactNode;
  /** 미세 회전 (deg). 비대칭 레이아웃용. */
  tilt?: number;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: 390,
        height: 844,
        borderRadius: 54,
        padding: 10,
        background:
          "linear-gradient(180deg, #16285A 0%, #0E2A5C 50%, #0A1F4B 100%)",
        boxShadow:
          "0 40px 80px rgba(14,42,92,0.35), inset 0 0 0 1px rgba(255,255,255,0.08)",
        transform: `rotate(${tilt}deg)`,
        margin: "0 auto",
        flexShrink: 0,
      }}
    >
      {/* Side buttons (visual only) */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: -2,
          top: 110,
          width: 3,
          height: 32,
          borderRadius: 2,
          background: "#0A1F4B",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: -2,
          top: 170,
          width: 3,
          height: 56,
          borderRadius: 2,
          background: "#0A1F4B",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: -2,
          top: 240,
          width: 3,
          height: 56,
          borderRadius: 2,
          background: "#0A1F4B",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          right: -2,
          top: 190,
          width: 3,
          height: 88,
          borderRadius: 2,
          background: "#0A1F4B",
        }}
      />

      {/* Screen */}
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 46,
          backgroundColor: "#F4F8FC",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Dynamic Island */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            width: 110,
            height: 32,
            borderRadius: 999,
            background: "#000",
            zIndex: 10,
          }}
        />
        {children}
      </div>
    </div>
  );
}
