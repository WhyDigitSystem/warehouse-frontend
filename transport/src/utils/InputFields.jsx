import { useState } from "react";

/* -----------------------------------------------
   FLOATING INPUT COMPONENT
------------------------------------------------ */
export const FloatingInput = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  className = "",
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const isFloating = isFocused || value !== "";

  return (
    <div className={`relative ${className}`}>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required={required}
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
      />
      <label
        className={`absolute left-2 transition-all duration-200 bg-white dark:bg-gray-800 px-1 pointer-events-none ${
          isFloating
            ? "-top-2 text-xs text-blue-600"
            : "top-2 text-sm text-gray-500 dark:text-gray-400"
        }`}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    </div>
  );
};

/* -----------------------------------------------
   FLOATING SELECT COMPONENT
------------------------------------------------ */
/* -----------------------------------------------
   FLOATING SELECT COMPONENT - FIXED
------------------------------------------------ */
export const FloatingSelect = ({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  className = "",
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const isFloating = isFocused || value !== "";

  // Handle change event properly
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <select
        name={name}
        value={value || ""} // Ensure value is always defined
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required={required}
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors appearance-none"
      >
        <option value="" className="text-gray-900 dark:text-white bg-white dark:bg-gray-800">
          {/* Empty option for placeholder */}
        </option>
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            className="text-gray-900 dark:text-white bg-white dark:bg-gray-800"
          >
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <svg
          className="h-4 w-4 text-gray-500 dark:text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
      <label
        className={`absolute left-2 transition-all duration-200 bg-white dark:bg-gray-800 px-1 pointer-events-none ${
          isFloating
            ? "-top-2 text-xs text-blue-600 dark:text-blue-400"
            : "top-2 text-sm text-gray-500 dark:text-gray-400"
        }`}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    </div>
  );
};