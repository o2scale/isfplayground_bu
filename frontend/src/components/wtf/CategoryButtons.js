import React, { useState } from "react";

const categories = [
  { name: "Medical", color: "bg-green-500 hover:bg-green-600" },
  { name: "Life Skills", color: "bg-green-500 hover:bg-green-600" },
  { name: "Spoken Eng", color: "bg-green-500 hover:bg-green-600" },
  {
    name: "Comp Apps",
    color: "bg-orange-500 hover:bg-orange-600",
    selectedColor: "bg-orange-500 hover:bg-orange-600",
  },
  { name: "Art Therapy", color: "bg-green-500 hover:bg-green-600" },
];

const CategoryButtons = () => {
  const [selectedCategory, setSelectedCategory] = useState("Comp Apps");

  return (
    <div className="flex gap-2 overflow-x-auto px-4">
      {categories.map((category) => {
        const isSelected = selectedCategory === category.name;
        const buttonColor =
          isSelected && category.selectedColor
            ? category.selectedColor
            : category.color;

        return (
          <button
            key={category.name}
            onClick={() => setSelectedCategory(category.name)}
            className={`${buttonColor} text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 whitespace-nowrap min-w-fit border-0 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-500`}
            style={{ height: "56px", minWidth: "140px" }}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryButtons;
