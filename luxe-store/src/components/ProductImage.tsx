import React from "react";

interface ProductImageProps {
  src?: string;
  alt: string;
  category?: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
}

// Data URI placeholder image (SVG)
const placeholderImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect fill='%23f0f0f0' width='300' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='%23999'%3EImage Not Available%3C/text%3E%3C/svg%3E";

const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  category,
  className,
  style,
  width = 300,
  height = 300,
}) => {
  const [imageSrc, setImageSrc] = React.useState<string>(
    src || placeholderImage
  );

  const handleImageError = () => {
    setImageSrc(placeholderImage);
  };

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      style={style}
      width={width}
      height={height}
      onError={handleImageError}
    />
  );
};

export default ProductImage;
