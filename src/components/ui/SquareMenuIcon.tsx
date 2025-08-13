import React from "react";

interface SquareMenuIconProps {
  className?: string;
}

export function SquareMenuIcon({ className = "" }: SquareMenuIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="butt"
      strokeLinejoin="miter"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 6h16" strokeLinecap="butt" strokeLinejoin="miter" />
      <path d="M4 12h16" strokeLinecap="butt" strokeLinejoin="miter" />
      <path d="M4 18h16" strokeLinecap="butt" strokeLinejoin="miter" />
    </svg>
  );
}
