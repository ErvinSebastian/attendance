import { useParams } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../../layout/DefaultLayout';
import userService, { User } from '../../services/user-service';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertComponent from '../AlertComponent';
import SelectGroupOne from '../../components/Forms/SelectGroup/SelectGroupOne';
import useCourses from '../../hooks/useCourses';
import { Course } from '../../services/courses-sevice';
import useUserTypes from '../../hooks/useUserTypes';
import { UserType } from '../../services/user-type-service';
import SwitcherOne from '../../components/Switchers/SwitcherOne';

const UserForm = () => {
  let { id } = useParams();
  let navigate = useNavigate();

  const [data, setData] = useState({
    id: id,
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
    student_id: '',
  });
  const { courses, setCourses } = useCourses();
  const { userTypes, setUserTypes } = useUserTypes();

  const [message, setMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course>({
    id: 0,
    name: '',
    description: '',
  });
  const [selectedUserType, setSelectedUserType] = useState<UserType>({
    id: 0,
    name: '',
    description: '',
  });

  const onSelectionChange = (id: number, header: string) => {
    switch (header) {
      case 'Course':
        setSelectedCourse(
          courses.find((course: Course) => course.id == id) ?? {
            id: 0,
            name: '',
            description: '',
          },
        );
        break;
      case 'User Type':
        setSelectedUserType(
          userTypes.find((course: Course) => course.id == id) ?? {
            id: 0,
            name: '',
            description: '',
          },
        );

        break;
    }
  };
  useEffect(() => {
    setData({
      ...data,
      user_type_name: selectedUserType.name,
      user_type_id: selectedUserType.id,
    });
  }, [selectedUserType]);

  useEffect(() => {
    setData({
      ...data,
      course_name: selectedCourse.name,
      course_id: selectedCourse.id,
    });
  }, [selectedCourse]);

  useEffect(() => {
    setIsApproved(data.is_approved ? true : false);
  }, [data]);
  useEffect(() => {}, [isApproved]);

  useEffect(() => {
    if (parseInt(id) > 0) {
      userService.getData(parseInt(id)).then((res) => {
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

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [event.target.id]: event.target.value });
  };

  const save = (event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    let user_id: number = id ? id : 0;
    data.is_approved = isApproved == true ? 1 : 0;

    userService.saveData(user_id, data).then((res) => {
      setData({ ...res.data.data });
      setMessage(res.data.message);
      setShowAlert(res.data.message == 'Success' ? true : false);
    });
  };

  return (
    <DefaultLayout>
      <Breadcrumb pageName="User Form" />
      {showAlert ? (
        <div
          style={{
            position: 'fixed',
            top: '100px',
            right: '100px',
            zIndex: 99999999,
          }}
        >
          <AlertComponent message={message} alertTemplate="green" />
        </div>
      ) : (
        ''
      )}

      <form onSubmit={save}>
        <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
          <div className="flex flex-col gap-9 col-span-2">
            {/* <!-- Contact Form --> */}

            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Personal Info
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
                <div className="flex flex-col gap-9 col-span-1">
                  <div className="p-6.5">
                    {/* <div className="mb-4.5">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Student ID <span className="text-meta-1">*</span>
                      </label>
                      <input
                        id="student_id"
                        value={data.student_id ?? ''}
                        onChange={handleOnChange}
                        type="text"
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </div> */}
                    <div className="mb-4.5">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Name <span className="text-meta-1">*</span>
                      </label>
                      <input
                        id="name"
                        value={data.name ?? ''}
                        onChange={handleOnChange}
                        type="text"
                        maxLength={90}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </div>

                    <div className="mb-4.5">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Email <span className="text-meta-1">*</span>
                      </label>
                      <input
                        id="email"
                        value={data.email ?? ''}
                        onChange={handleOnChange}
                        type="email"
                        maxLength={60}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </div>

                    <div className="mb-4.5">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Current Address <span className="text-meta-1">*</span>
                      </label>
                      <input
                        id="current_address"
                        value={data.current_address ?? ''}
                        onChange={handleOnChange}
                        type="text"
                        maxLength={60}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </div>
                    {!isApproved ? (
                      <div className="mb-4.5">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Approved <span className="text-meta-1">*</span>
                        </label>
                        <SwitcherOne
                          isApproved={isApproved}
                          setIsApproved={setIsApproved}
                        />
                      </div>
                    ) : (
                      ''
                    )}

                    {/* <SelectGroupOne /> */}

                    {/* <button className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90">
                  Send Message
                </button> */}
                  </div>
                </div>

                <div className="flex flex-col gap-9 col-span-1">
                  <div className="p-6.5">
                    {/* <div className="mb-4.5">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Age <span className="text-meta-1">*</span>
                      </label>
                      <input
                        type="text"
                        id="age"
                        value={data.age ?? ''}
                        onChange={handleOnChange}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </div> */}

                    <div className="mb-4.5">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Contact No. <span className="text-meta-1">*</span>
                      </label>
                      <input
                        id="contact_no"
                        value={data.contact_no ?? ''}
                        onChange={handleOnChange}
                        type="text"
                        maxLength={60}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </div>

                    <div className="mb-4.5">
                      <SelectGroupOne
                        items={userTypes}
                        onSelectionChange={(id, header) =>
                          onSelectionChange(id, header)
                        }
                        selectedItem={data.user_type_id ?? 0}
                        header="User Type"
                      />
                    </div>

                    <div className="mb-4.5">
                      <SelectGroupOne
                        items={courses}
                        onSelectionChange={(id, header) =>
                          onSelectionChange(id, header)
                        }
                        selectedItem={data.course_id ?? 0}
                        header="Course"
                      />
                    </div>

                    {/* <SelectGroupOne /> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 mt-10">
          <div className="flex flex-row flex-row-reverse ">
            <button
              onClick={() => navigate(`/users`)}
              className="rounded bg-danger p-3 font-medium text-gray hover:bg-opacity-90 m-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-success p-3 font-medium text-gray hover:bg-opacity-90 m-1"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </DefaultLayout>
  );
};

export default UserForm;
