import { Animated } from 'react-animated-css';
interface Props {
  message: string;
  alertTemplate: string;
}
const AlertComponent = ({ message, alertTemplate }: Props) => {
  const color = alertTemplate;
  return color == 'red' ? (
    <Animated
      animationIn="bounceInLeft"
      animationOut="fadeOut"
      isVisible={true}
    >
      <div className="right-0 top-12 z-999 flex flex-row flex-row-reverse">
        <div
          className={`bg-red-200 px-6 py-4 mx-2 my-4 rounded-md text-lg flex items-center max-w-lg`}
        >
          <span className={`text-red-800 text-xs`}>{message}.</span>
        </div>
      </div>
    </Animated>
  ) : (
    <Animated
      animationIn="bounceInLeft"
      animationOut="fadeOut"
      isVisible={true}
    >
      <div className="right-0 top-12 z-999 flex flex-row flex-row-reverse">
        <div
          className={`bg-green-200 px-6 py-4 mx-2 my-4 rounded-md text-lg flex items-center max-w-lg`}
        >
          <span className={`text-gren-800 text-sm`}>{message}</span>
        </div>
      </div>
    </Animated>
  );
};

export default AlertComponent;
