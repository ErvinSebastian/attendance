import { useEffect, useState } from 'react';

interface Props {
  time: string;
  handleTime: (time: string, day: string, type: string, index: number) => void;
  day: string;
  type: string;
  index: number;
}
const Timepicker = ({ time, handleTime, day, type, index }: Props) => {
  const [value, setValue] = useState('');
   console.log(time);
  useEffect(() => {
    return () => {
      setValue(time);
    };
  }, []);

  const handleChange = (event) => {
    setValue(event.target.value);
    handleTime(event.target.value, day, type, index);
  };

  return (
    <div>
      <input
        type="time"
        value={value}
        onChange={(e) => handleChange(e)}
        name="time"
      />
    </div>
  );
};

export default Timepicker;
