import React from 'react';

const FilterSection = ({ label, sectionKey, isOpen, toggleFilter, children }) => {
    return (
        <div className="border-t border-gray-200 py-3 cursor-pointer select-none">
            <div
                onClick={() => toggleFilter(sectionKey)}
                className="flex items-center justify-between text-sm font-semibold text-gray-800"
            >
                {label}
                <span className="text-xl leading-none text-gray-500">
                    {/* Icon mũi tên */}
                    <i className={`fa-solid ${isOpen ? "fa-chevron-up" : "fa-chevron-down"}`}></i>
                </span>
            </div>
            {/* Nội dung filter được hiển thị khi isOpen là true */}
            {isOpen && (
                <div className="mt-3 text-xs text-gray-600 animate-in fade-in duration-200">
                    {children} 
                </div>
            )}
        </div>
    );
};

export default FilterSection;