export function Watermarks({
  nameWatermark,
  numberWatermark,
}: {
  nameWatermark: string;
  numberWatermark: string;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden">
      <div className="absolute -left-36 -top-[160px] flex w-[800px] -rotate-45 justify-between p-4">
        <p className="text-sm text-white opacity-25">{nameWatermark}</p>
        <p className="text-sm text-white opacity-25">{nameWatermark}</p>
        <p className="text-sm text-white opacity-25">{nameWatermark}</p>
        <p className="text-sm text-white opacity-25">{nameWatermark}</p>
        <p className="text-sm text-white opacity-25">{nameWatermark}</p>
      </div>
      <div className="absolute -left-36 top-[20px] flex w-[800px] -rotate-45 justify-between p-4">
        <p className="text-sm text-white opacity-25">{numberWatermark}</p>
        <p className="text-sm text-white opacity-25">{numberWatermark}</p>
        <p className="text-sm text-white opacity-25">{numberWatermark}</p>
        <p className="text-sm text-white opacity-25">{numberWatermark}</p>
      </div>
      <div className="absolute -left-36 top-[200px] flex w-[800px] -rotate-45 justify-between p-4">
        <p className="text-sm text-white opacity-25">{nameWatermark}</p>
        <p className="text-sm text-white opacity-25">{nameWatermark}</p>
        <p className="text-sm text-white opacity-25">{nameWatermark}</p>
        <p className="text-sm text-white opacity-25">{nameWatermark}</p>
        <p className="text-sm text-white opacity-25">{nameWatermark}</p>
      </div>
      <div className="absolute -left-36 top-[380px] flex w-[800px] -rotate-45 justify-between p-4">
        <p className="text-sm text-white opacity-25">{numberWatermark}</p>
        <p className="text-sm text-white opacity-25">{numberWatermark}</p>
        <p className="text-sm text-white opacity-25">{numberWatermark}</p>
        <p className="text-sm text-white opacity-25">{numberWatermark}</p>
      </div>
      <div className="absolute -left-36 top-[560px] flex w-[800px] -rotate-45 justify-between p-4">
        <p className="text-sm text-white opacity-25">{nameWatermark}</p>
        <p className="text-sm text-white opacity-25">{nameWatermark}</p>
        <p className="text-sm text-white opacity-25">{nameWatermark}</p>
        <p className="text-sm text-white opacity-25">{nameWatermark}</p>
        <p className="text-sm text-white opacity-25">{nameWatermark}</p>
      </div>
      <div className="absolute -left-36 top-[740px] flex w-[800px] -rotate-45 justify-between p-4">
        <p className="text-sm text-white opacity-25">{numberWatermark}</p>
        <p className="text-sm text-white opacity-25">{numberWatermark}</p>
        <p className="text-sm text-white opacity-25">{numberWatermark}</p>
        <p className="text-sm text-white opacity-25">{numberWatermark}</p>
      </div>
      <div className="absolute -left-36 top-[920px] flex w-[800px] -rotate-45 justify-between p-4">
        <p className="text-sm text-white opacity-25">{nameWatermark}</p>
        <p className="text-sm text-white opacity-25">{nameWatermark}</p>
        <p className="text-sm text-white opacity-25">{nameWatermark}</p>
        <p className="text-sm text-white opacity-25">{nameWatermark}</p>
        <p className="text-sm text-white opacity-25">{nameWatermark}</p>
      </div>
      <div className="absolute -left-36 top-[1100px] flex w-[800px] -rotate-45 justify-between p-4">
        <p className="text-sm text-white opacity-25">{numberWatermark}</p>
        <p className="text-sm text-white opacity-25">{numberWatermark}</p>
        <p className="text-sm text-white opacity-25">{numberWatermark}</p>
        <p className="text-sm text-white opacity-25">{numberWatermark}</p>
      </div>
      <div className="absolute -left-36 top-[1280px] flex w-[800px] -rotate-45 justify-between p-4">
        <p className="text-sm text-white opacity-25">{nameWatermark}</p>
        <p className="text-sm text-white opacity-25">{nameWatermark}</p>
        <p className="text-sm text-white opacity-25">{nameWatermark}</p>
        <p className="text-sm text-white opacity-25">{nameWatermark}</p>
        <p className="text-sm text-white opacity-25">{nameWatermark}</p>
      </div>
      <div className="absolute -left-36 top-[1460px] flex w-[800px] -rotate-45 justify-between p-4">
        <p className="text-sm text-white opacity-25">{numberWatermark}</p>
        <p className="text-sm text-white opacity-25">{numberWatermark}</p>
        <p className="text-sm text-white opacity-25">{numberWatermark}</p>
        <p className="text-sm text-white opacity-25">{numberWatermark}</p>
      </div>
    </div>
  );
}
