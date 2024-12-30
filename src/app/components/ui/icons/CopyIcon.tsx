const CopyIcon = ({
  width = 18,
  height = 18,
  fill = "none",
  stroke = "white",
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 18 18"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_4268_58753)">
        <path
          d="M6 6V4.5C6 2.84315 7.34315 1.5 9 1.5L13.5 1.5C15.1569 1.5 16.5 2.84315 16.5 4.5V9C16.5 10.6569 15.1569 12 13.5 12H12M6 6H4.5C2.84315 6 1.5 7.34315 1.5 9V13.5C1.5 15.1569 2.84315 16.5 4.5 16.5H9C10.6569 16.5 12 15.1569 12 13.5V12M6 6H9C10.6569 6 12 7.34315 12 9V12"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_4268_58753">
          <rect width="18" height="18" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default CopyIcon;
