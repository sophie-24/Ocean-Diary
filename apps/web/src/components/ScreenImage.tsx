/** 설계서 캡처 이미지를 PhoneFrame 사이즈로 보여주는 컴포넌트 */
export function ScreenImage({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: 390,
        height: 844,
        objectFit: "cover",
        objectPosition: "top",
        display: "block",
      }}
    />
  );
}
