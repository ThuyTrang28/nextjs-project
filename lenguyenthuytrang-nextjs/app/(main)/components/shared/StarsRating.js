import React from 'react';

const StarsRating = ({ rating, reviewCount, size = 'medium' }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    const sizeClasses = {
        small: "text-xs",
        medium: "text-sm",
        large: "text-base"
    };

    return (
        <div className="flex items-center space-x-2">
            <div className={`text-yellow-500 ${sizeClasses[size]}`}>
                {[...Array(fullStars)].map((_, i) => <i key={`full-${i}`} className="fa-solid fa-star"></i>)}
                {hasHalfStar && <i className="fa-solid fa-star-half-stroke"></i>}
                {[...Array(emptyStars)].map((_, i) => <i key={`empty-${i}`} className="fa-regular fa-star text-gray-300"></i>)}
            </div>
            <span className={`text-gray-600 ${sizeClasses[size]}`}>
                ({reviewCount})
            </span>
        </div>
    );
};

export default StarsRating;