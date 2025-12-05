import React from "react";

/**
 * Renders star rating as JSX elements
 * @param rating - The rating value (0-5)
 * @returns Array of JSX star elements
 */
export const renderStars = (rating: number): React.ReactElement[] => {
  return [...Array(5)].map((_, i) => (
    <span
      key={i}
      className={`text-${
        i < Math.floor(rating) ? "warning" : "muted"
      } text-base me-1`}
    >
      {i < Math.floor(rating) ? "★" : "☆"}
    </span>
  ));
};
