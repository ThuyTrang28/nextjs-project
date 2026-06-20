"use client";
import React, { useState } from 'react';

const ProductDetailGallery = ({ images }) => {
    const [mainImage, setMainImage] = useState(images[0]);

    return (
        <div className="flex gap-4">
            {/* Thumbnails (Lề trái) */}
            <div className="flex flex-col space-y-3">
                {images.map((img, index) => (
                    <img
                        key={index}
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className={`w-20 h-20 object-cover cursor-pointer border-2 transition ${
                            img === mainImage ? 'border-black' : 'border-transparent hover:border-gray-300'
                        }`}
                        onClick={() => setMainImage(img)}
                    />
                ))}
                <div className="text-xs text-gray-500 text-center mt-2 cursor-pointer hover:underline">
                    See all {images.length}
                </div>
            </div>

            {/* Main Image (Ảnh chính) */}
            <div className="grow relative aspect-square">
                <img
                    src={mainImage}
                    alt="Product Main View"
                    className="w-full h-full object-contain"
                />
                {/* Arrow navigation (nếu cần) */}
                <button className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/70 p-2 rounded-full hidden lg:block">
                    <i className="fa-solid fa-chevron-left"></i>
                </button>
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/70 p-2 rounded-full hidden lg:block">
                    <i className="fa-solid fa-chevron-right"></i>
                </button>
            </div>
        </div>
    );
};

export default ProductDetailGallery;