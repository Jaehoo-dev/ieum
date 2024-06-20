export function Warning() {
  return (
    <div className="flex w-full items-start gap-1">
      <p className="text-md text-gray-800">※</p>
      <p className="text-md text-gray-800">
        스크린 캡처 및 무단 유출을 절대 금지합니다. 무단 유출 시 로그와
        워터마크로 추적이 가능하며 법적 책임을 질 수 있습니다.
      </p>
    </div>
  );
}
