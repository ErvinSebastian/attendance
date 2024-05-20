import { useEffect, useState } from 'react';
import { ReactSearchAutocomplete } from 'react-search-autocomplete';
interface StateProperties {
  id: number;
  name: string;
}
interface Props {
  items: StateProperties[];
  autocompleteHandle: () => void;
  header: string;
  name: string;
}

const Autocomplete = ({ items, autocompleteHandle, header, name }: Props) => {
  const [newItems, setNewItems] = useState<StateProperties[]>();

  useEffect(() => {}, [items]);

  const handleOnSearch = (string: string, results: []) => {
    if (typeof items === 'object') {
      const formattedItems: any[] = items.map((item) => ({
        ...item,
      }));
      setNewItems(formattedItems);
    }
  };

  const handleOnHover = (result) => {
    // the item hovered
  };

  const handleOnFocus = () => {};

  const formatResult = (item) => {
    return (
      <>
        <div style={{ margin: '1rem 1rem 1rem 0', padding: '0.5rem' }}>
          <span
            style={{
              textAlign: 'left',
              display: 'block',
            }}
          >
            {item.name}
          </span>
        </div>
      </>
    );
  };
  return (
    <div>
      <header>
        <label className="mb-2.5 block text-black dark:text-white">
          {header}
        </label>

        <div>
          <ReactSearchAutocomplete
            items={newItems}
            onSearch={handleOnSearch}
            onHover={handleOnHover}
            onSelect={autocompleteHandle}
            onFocus={handleOnFocus}
            formatResult={formatResult}
            styling={{ borderRadius: '3px' }}
            inputSearchString={name}
            showIcon={false}
          />
        </div>
      </header>
    </div>
  );
};

export default Autocomplete;
