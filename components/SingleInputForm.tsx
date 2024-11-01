"use client";

import { useState } from "react";
import { FiX, FiArrowRight } from "react-icons/fi";

export type FormProps = {
  placeholder?: string;
  onSubmit: (value: string) => void;
};

const SingleInputForm = ({ placeholder, onSubmit }: FormProps) => {
  const [value, setValue] = useState<string>("");

  const handleClear = () => setValue("");

  return (
    <form
      className="relative w-full max-w-[600px] mx-5 flex items-center bg-gradient-to-r from-[#2e2b5f] via-[#4a306d] to-[#803977] rounded-full p-1"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(value);
      }}
    >
      <input
        value={value}
        onInput={(e) => setValue(e.currentTarget.value)}
        type="text"
        required
        placeholder={placeholder}
        className="flex-grow px-4 py-4 pr-20 bg-white text-gray-900 rounded-full outline-none focus:ring-2 focus:ring-[#4a306d]"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-14 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <FiX size={20} />
        </button>
      )}
      <button
        type="submit"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-gradient-to-r to-[#4a306d] from-[#803977] p-2 rounded-full focus:outline-none"
      >
        <FiArrowRight size={20} />
      </button>
    </form>
  );
};

export default SingleInputForm;
