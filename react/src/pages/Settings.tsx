import { useEffect, useState } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../layout/DefaultLayout';
import userService from '../services/user-service';
import React from 'react';
import ReactDOM from 'react-dom';
import QRCode from 'react-qr-code';
import { useNavigate } from 'react-router-dom';
import AlertComponent from './AlertComponent';
import ChangePasswordModal from './ChangePasswordModal';
interface UserDataType {
  name: string;
  id: number;
  is_approved: number;
  user_type_name: string;
  user_type_id: number;
  email: string;
  course_name: string;
  contact_number: number;
}

interface ChangePassType {
  old_password: string;
  new_password: string;
  confirm_new_password: string;
}

const Settings = () => {
  let navigate = useNavigate();
  const session = JSON.parse(sessionStorage.getItem('user'));
  const [showAlert, setShowAlert] = useState(false);
  const [userSession, setUserSession] = useState<UserDataType>();
  const [name, setName] = useState('');
  const [contact_no, setContactNo] = useState(0);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [alertTemplate, setAlertTemplate] = useState('');
  const [passwordCredentials, setPasswordCredentials] =
    useState<ChangePassType>({
      old_password: '',
      new_password: '',
      confirm_new_password: '',
    });
  const handleCloseModal = () => setShowModal(false);
  const handleOpenModal = () => setShowModal(true);
  const [showModal, setShowModal] = useState(false);

  const [data, setData] = useState({
    id: 0,
    name: '',
    contact_no: '',
    email: '',
    current_address: '',
    course_name: '',
    course_id: 0,
    age: '',
    user_type_id: 0,
    user_type_name: '',
    is_approved: 0,
  });

  useEffect(() => {
    const session = JSON.parse(sessionStorage.getItem('user'));
    setUserSession(session);
    if (session) {
      userService.getData(session.id).then((res) => {
        const user = res.data.data;
        setData({
          ...user,
        });
      });
    }
  }, []);

  useEffect(() => {
    const timeId = setTimeout(() => {
      // After 3 seconds set the show value to false
      setShowAlert(false);
    }, 3000);

    return () => {
      clearTimeout(timeId);
    };
  }, [showAlert]);

  const inputChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [event.target.id]: event.target.value });
  };

  const save = (event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();

    userService.saveData(data.id, data).then((res) => {
      setData({ ...res.data.data });
      setMessage(res.data.message);
      setShowAlert(res.data.message == 'Success' ? true : false);
    });
  };

  const onCancel = () => {
    navigate(`/dashboard`);
  };

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordCredentials({
      ...passwordCredentials,
      [event.target.id]: event.target.value,
    });
  };

  const changePassword = () => {
    if (
      passwordCredentials.new_password ==
      passwordCredentials.confirm_new_password
    ) {
      userService.changePassword(data.id, passwordCredentials).then((res) => {
        setShowModal(false);
        setMessage(res.data.message);
        setAlertTemplate(res.data.status == 200 ? 'green' : 'red');
        setShowAlert(true);
      });
    } else {
      setMessage('Please check new password and confirm password');
      setAlertTemplate('red');
      setShowAlert(true);
    }
  };
  return (
    <>
      {showModal ? (
        <ChangePasswordModal
          passwordCredentials={passwordCredentials}
          handleOpenModal={handleOpenModal}
          handleCloseModal={handleCloseModal}
          handleOnChange={handleOnChange}
          changePassword={changePassword}
        />
      ) : null}

      <DefaultLayout>
        <div className="mx-auto max-w-270">
          <Breadcrumb pageName="Settings" />
          {showAlert ? (
            <AlertComponent message={message} alertTemplate={alertTemplate} />
          ) : (
            ''
          )}
          <div className="grid grid-cols-5 gap-8">
            <div className="col-span-5 xl:col-span-3">
              <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
                  <h3 className="font-medium text-black dark:text-white">
                    Personal Information
                  </h3>
                </div>
                <div className="p-7">
                  <form onSubmit={save}>
                    <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                      <div className="w-full sm:w-1/2">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="name"
                        >
                          Full Name
                        </label>
                        <div className="relative">
                          <span className="absolute left-4.5 top-4">
                            <svg
                              className="fill-current"
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <g opacity="0.8">
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M3.72039 12.887C4.50179 12.1056 5.5616 11.6666 6.66667 11.6666H13.3333C14.4384 11.6666 15.4982 12.1056 16.2796 12.887C17.061 13.6684 17.5 14.7282 17.5 15.8333V17.5C17.5 17.9602 17.1269 18.3333 16.6667 18.3333C16.2064 18.3333 15.8333 17.9602 15.8333 17.5V15.8333C15.8333 15.1703 15.5699 14.5344 15.1011 14.0655C14.6323 13.5967 13.9964 13.3333 13.3333 13.3333H6.66667C6.00363 13.3333 5.36774 13.5967 4.8989 14.0655C4.43006 14.5344 4.16667 15.1703 4.16667 15.8333V17.5C4.16667 17.9602 3.79357 18.3333 3.33333 18.3333C2.8731 18.3333 2.5 17.9602 2.5 17.5V15.8333C2.5 14.7282 2.93899 13.6684 3.72039 12.887Z"
                                  fill=""
                                />
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M9.99967 3.33329C8.61896 3.33329 7.49967 4.45258 7.49967 5.83329C7.49967 7.214 8.61896 8.33329 9.99967 8.33329C11.3804 8.33329 12.4997 7.214 12.4997 5.83329C12.4997 4.45258 11.3804 3.33329 9.99967 3.33329ZM5.83301 5.83329C5.83301 3.53211 7.69849 1.66663 9.99967 1.66663C12.3009 1.66663 14.1663 3.53211 14.1663 5.83329C14.1663 8.13448 12.3009 9.99996 9.99967 9.99996C7.69849 9.99996 5.83301 8.13448 5.83301 5.83329Z"
                                  fill=""
                                />
                              </g>
                            </svg>
                          </span>
                          <input
                            className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                            type="text"
                            name="name"
                            id="name"
                            onChange={inputChangeHandler}
                            value={data.name ?? ''}
                          />
                        </div>
                      </div>

                      <div className="w-full sm:w-1/2">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="phoneNumber"
                        >
                          Phone Number
                        </label>
                        <input
                          className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          name="contact_no"
                          id="contact_no"
                          onChange={inputChangeHandler}
                          value={data.contact_no ?? 0}
                        />
                      </div>
                    </div>

                    <div className="mb-5.5">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="emailAddress"
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <span className="absolute left-4.5 top-4">
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.8">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M3.33301 4.16667C2.87658 4.16667 2.49967 4.54357 2.49967 5V15C2.49967 15.4564 2.87658 15.8333 3.33301 15.8333H16.6663C17.1228 15.8333 17.4997 15.4564 17.4997 15V5C17.4997 4.54357 17.1228 4.16667 16.6663 4.16667H3.33301ZM0.833008 5C0.833008 3.6231 1.9561 2.5 3.33301 2.5H16.6663C18.0432 2.5 19.1663 3.6231 19.1663 5V15C19.1663 16.3769 18.0432 17.5 16.6663 17.5H3.33301C1.9561 17.5 0.833008 16.3769 0.833008 15V5Z"
                                fill=""
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M0.983719 4.52215C1.24765 4.1451 1.76726 4.05341 2.1443 4.31734L9.99975 9.81615L17.8552 4.31734C18.2322 4.05341 18.7518 4.1451 19.0158 4.52215C19.2797 4.89919 19.188 5.4188 18.811 5.68272L10.4776 11.5161C10.1907 11.7169 9.80879 11.7169 9.52186 11.5161L1.18853 5.68272C0.811486 5.4188 0.719791 4.89919 0.983719 4.52215Z"
                                fill=""
                              />
                            </g>
                          </svg>
                        </span>
                        <input
                          className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="email"
                          name="email"
                          id="email"
                          value={data.email ?? ''}
                          onChange={inputChangeHandler}
                        />
                      </div>
                    </div>

                    <div className="mb-5.5">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="Username"
                      >
                        Course
                      </label>
                      <input
                        className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="course"
                        id="course"
                        defaultValue={data.course_name ?? ''}
                        disabled
                      />
                    </div>

                    <div className="flex justify-end gap-4.5">
                      <button
                        type="button"
                        className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                        onClick={onCancel}
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                        onClick={() => {
                          setShowModal(true);
                        }}
                      >
                        Change Password
                      </button>
                      <button
                        className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90"
                        type="submit"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div className="col-span-5 xl:col-span-2">
              <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
                  <h3 className="font-medium text-black dark:text-white">
                    QR Code
                  </h3>
                </div>
                <div className="p-7">
                  <form action="#">
                    <div className="mb-4 flex items-center gap-3">
                      <div>
                        <span className="mb-1 text-black dark:text-white">
                          Your Instructor must scan this QR Code for your
                          attendance
                        </span>
                      </div>
                    </div>

                    <div
                      id="FileUpload"
                      className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded border border-dashed border-primary bg-gray py-4 px-4 dark:bg-meta-4 sm:py-7.5"
                    >
                      <QRCode
                        size={256}
                        style={{
                          height: 'auto',
                          maxWidth: '100%',
                          width: '100%',
                        }}
                        value={JSON.stringify(data)}
                        viewBox={`0 0 256 256`}
                      />
                    </div>

                    <div className="flex justify-end gap-4.5">
                      {/* <button
                      className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                      type="submit"
                    >
                      Cancel
                    </button>
                    <button
                      className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90"
                      type="submit"
                    >
                      Save
                    </button> */}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DefaultLayout>
    </>
  );
};

export default Settings;
