import React from 'react';

const Button = ({ children, variant = 'primary', disabled = false, onClick, type = 'button' }) => {
  const baseStyle = "w-full py-3 rounded-full text-lg font-bold transition-all duration-200 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-red-600 text-white hover:bg-red-700",
    secondary: "bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

export default Button;