import React, { useEffect, useState } from 'react';
import { Course } from '../../../services/courses-sevice';

interface Props {
  items: [];
  onSelectionChange: (id: number) => void;
  selectedItem: number;
  header: string;
}

const SelectGroupOne: React.FC<Props> = ({
  items,
  onSelectionChange,
  selectedItem,
  header,
}: Props) => {
  const [selectedOption, setSelectedOption] = useState<number>(0);
  const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);

  const changeTextColor = () => {
    setIsOptionSelected(true);
  };

  return (
    <div className="mb-4.5">
      <label className="mb-2.5 block text-black dark:text-white">
        {header}
      </label>

      <div className="relative z-20 bg-transparent dark:bg-form-input">
        <select
          value={selectedItem ?? 0}
          onChange={(e) => {
            setSelectedOption(parseInt(e.target.value));
            onSelectionChange(parseInt(e.target.value), header);
            changeTextColor();
          }}
          className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary ${
            isOptionSelected ? 'text-black dark:text-white' : ''
          }`}
        >
          <option value={0} disabled className="text-body dark:text-bodydark">
            Select {header}
          </option>
          {items.map((item) => (
            <option
              key={item.id}
              value={item.id}
              className="text-body dark:text-bodydark"
            >
              {item.name}
            </option>
          ))}
        </select>

        <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2"></span>
      </div>
    </div>
  );
};

export default SelectGroupOne;
