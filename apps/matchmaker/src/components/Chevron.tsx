export function Chevron({
  size = 16,
  strokeClassName = "stroke-gray-900",
  direction = "right",
}: {
  size?: number;
  strokeClassName?: string;
  direction?: "up" | "down" | "left" | "right";
}) {
  const getRotation = () => {
    switch (direction) {
      case "up":
        return "rotate(90deg)";
      case "down":
        return "rotate(-90deg)";
      case "left":
        return "rotate(180deg)";
      case "right":
      default:
        return "rotate(0deg)";
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        transform: getRotation(),
        transition: "transform 0.3s",
      }}
    >
      <path
        className={strokeClassName}
        d="M8 4.5L15.5 12L8 19.5"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
