// Selector.jsx
"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function Selector({
  items = [],
  value,
  onChange,
  placeholder = "Selecciona...",
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-md mt-1">
        <SelectGroup>
          {items.map((item, index) => (
            <SelectItem
              key={index}
              value={item}
              className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
            >
              {item}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default Selector;