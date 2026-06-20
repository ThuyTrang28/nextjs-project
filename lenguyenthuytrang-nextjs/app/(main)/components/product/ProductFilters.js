"use client";
import React, { useState } from 'react';
import FilterSection from '../shared/FilterSection'; 
// Import các component tùy chọn cụ thể (giả định nằm trong thư mục con)
import RatingOptions from './filter-options/RatingOptions'; 

// Dữ liệu mock-up cho các mục bộ lọc (trong thực tế nên import từ file mock data)
const filterSections = [
    { key: 'pickupDelivery', label: 'Pick up & Delivery' },
    { key: 'priceRange', label: 'Price Range' },
    { key: 'rating', label: 'Customer Rating' },
    { key: 'size', label: 'Size' },
    { key: 'finish', label: 'Finish' },
];
const categories = [
    { name: 'Palettes', count: 125 },
    { name: 'Lipsticks', count: 350 },
];
const filterComponents = {
    rating: RatingOptions, // Map 'rating' key với component RatingOptions
    // Thêm các map khác ở đây...
};

const ProductFilters = () => {
    // Quản lý trạng thái mở/đóng của các bộ lọc
    const [openFilters, setOpenFilters] = useState({ 
        rating: true, // Mở mặc định
    });

    const toggleFilter = (key) => {
        setOpenFilters((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <aside className="w-64 sticky top-6 self-start hidden lg:block"> 
            <h2 className="text-3xl font-bold mb-6">DIOR</h2>

            {/* Navigation Category */}
            <ul className="flex flex-col gap-3 text-sm">
                {categories.map((c) => (
                    <li key={c.name} className="flex justify-between items-center pr-2">
                        <button className="text-gray-700 hover:text-black font-medium">{c.name}</button>
                        <span className="text-gray-500 text-xs">({c.count})</span>
                    </li>
                ))}
            </ul>

            {/* Filters Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-base mb-3">Filters</h3>
                
                {filterSections.map((section) => {
                    const FilterComponent = filterComponents[section.key];

                    return (
                        <FilterSection
                            key={section.key}
                            label={section.label}
                            sectionKey={section.key}
                            isOpen={openFilters[section.key]}
                            toggleFilter={toggleFilter}
                        >
                            {/* Render component tùy chọn nếu có, nếu không thì dùng placeholder */}
                            {FilterComponent ? (
                                <FilterComponent />
                            ) : (
                                <div className="text-gray-500 text-xs py-2">
                                    (Tùy chọn cho {section.label}...)
                                </div>
                            )}
                        </FilterSection>
                    );
                })}
            </div>
        </aside>
    );
};

export default ProductFilters;