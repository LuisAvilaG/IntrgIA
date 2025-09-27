import type { SVGProps } from 'react';

const BeAutomateLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 160 40"
    width={160}
    height={40}
    {...props}
  >
    <text
      x="0"
      y="30"
      fontFamily="'Inter', sans-serif"
      fontSize="28"
      fontWeight="bold"
      fill="currentColor"
    >
      Be
      <tspan fill="hsl(var(--primary))">Automate</tspan>
    </text>
  </svg>
);

export default BeAutomateLogo;
