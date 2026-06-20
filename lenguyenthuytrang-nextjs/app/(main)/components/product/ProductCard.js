import React from 'react';
import StarsRating from '../shared/StarsRating';

const ProductCard = ({ product }) => {
  return (
    <a href={`/product/${product.id}`} className="block group">
      <div className="relative overflow-hidden aspect-square">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.isNew && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">NEW</span>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-xs text-gray-500">{product.brand}</h3>
        <p className="text-sm font-semibold mt-1 group-hover:underline">{product.name}</p>
        <StarsRating rating={product.rating} reviewCount={product.reviewCount} size="small" />
        <p className="text-base font-bold mt-1">${product.price.toFixed(2)}</p>
      </div>
    </a>
  );
};

export default ProductCard;