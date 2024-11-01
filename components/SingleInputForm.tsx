"use client";

import { useState } from "react";

export type FormProps = {
  placeholder?: string;
  onSubmit: (value: string) => void;
  submitLabel?: string;
};

const SingleInputForm = ({ placeholder, onSubmit, submitLabel = "Submit" }: FormProps) => {
  const [value, setValue] = useState<string>("");

  return (
    <form className="relative w-full mx-10" onSubmit={(event) => {
      event.preventDefault();
      onSubmit(value)
    }}>
      <div
        className="relative p-1 rounded-xl bg-gradient-to-r from-[#2e2b5f] via-[#4a306d] to-[#803977]"
      >
        <input
          value={value}
          onInput={(e) => setValue(e.currentTarget.value)}
          type="text"
          required
          placeholder={placeholder}
          className="w-full px-4 py-4 pr-[105px] bg-white text-gray-900 rounded-lg outline-none focus:ring-2 focus:ring-[#4a306d]"
        />
        <button
          className="absolute right-2 top-1/2 w-[100px] transform -translate-y-1/2 px-4 py-3 bg-gradient-to-r to-[#2e2b5f] via-[#4a306d] from-[#803977] text-white rounded-md focus:outline-none"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

export default SingleInputForm;
