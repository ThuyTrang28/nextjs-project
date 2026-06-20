// components/product/filter-options/RatingOptions.js (Giả định nằm trong thư mục con)
import React from 'react';
// Dữ liệu mock-up cho rating
const ratingMockData = [
    { stars: 4, count: 90 },
    { stars: 3, count: 110 },
    { stars: 2, count: 112 },
    { stars: 1, count: 114 },
];

const RatingOptions = () => {
    return (
        <div className="flex flex-col gap-3">
            {ratingMockData.map((r) => (
                <label key={r.stars} className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="rounded-full border-gray-300 text-black focus:ring-0 w-4 h-4" 
                    />
                    {/* Hiển thị sao */}
                    <span className="text-yellow-500 flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <i key={i} className={`fa-star ${i < r.stars ? "fa-solid" : "fa-regular"} text-xs`}></i>
                        ))}
                    </span>
                    <span className="text-gray-700 ml-1">
                        {r.stars} &amp; up ({r.count})
                    </span>
                </label>
            ))}
        </div>
    );
};

export default RatingOptions;