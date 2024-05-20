import QrScanner from 'qr-scanner';
import { useEffect, useRef, useState } from 'react';
import userService from '../../../services/user-service';

interface UserDataType {
  id: number;
  course_name: string;
  course_type_id: number;
  email: string;
  password: string;
  name: string;
}
interface IClass {
  id: number;
  name: string;
  subject_id: number;
  teacher_id: number;
}
interface ISchedule {
  id: number;
  name: string;
  time_in: string;
  time_out: string;
}
interface Props {
  activeSchedule: ISchedule;
  user: any;
  openScanner: boolean;
}

const QRScanner = ({ activeSchedule, user, openScanner }: Props) => {
  const videoElementRef = useRef(null);
  const [scanned, setScannedText] = useState('');

  const timeInUser = (
    class_data: IClass,
    schedule: ISchedule,
    user: UserDataType,
    currentDate: string,
  ) => {
    return userService
      .time_in(class_data, schedule, user, currentDate)
      .then((res) => {
        return res.data;
      });
  };

  const handleTimeIn = async (
    class_data: IClass,
    user: UserDataType,
    currentDate: string,
    qrScanner: any,
  ) => {
    const response = await timeInUser(
      class_data,
      activeSchedule,
      user,
      currentDate,
    );
    if (response.data.status == 200) {
      setScannedText(response.data.message);
      qrScanner.destroy();
    }
  };

  useEffect(() => {
    const video: HTMLVideoElement = videoElementRef.current;
    const qrScanner = new QrScanner(
      video,
      (result) => {
        console.log('decoded qr code:', result);
        if (result.data) {
          const class_data = JSON.parse(result.data);
          const currentDate = new Date().toLocaleString();
          const day = new Date().toLocaleString('en-us', { weekday: 'long' });

          if (class_data) {
            handleTimeIn(class_data, user, currentDate, qrScanner);
          }
        }
      },
      {
        returnDetailedScanResult: true,
        highlightScanRegion: true,
        highlightCodeOutline: true,
      },
    );
    qrScanner.start();
    if (openScanner == false) {
      qrScanner.destroy();
    }

    return () => {
      qrScanner.stop();
      qrScanner.destroy();
    };
  }, []);

  return (
    <div>
      <div className="videoWrapper">
        <video className="qrVideo" ref={videoElementRef} />
      </div>
      <p className="scannedText">SCANNED: {scanned}</p>
    </div>
  );
};

export default QRScanner;
