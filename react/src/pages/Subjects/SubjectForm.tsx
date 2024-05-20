import { useParams } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../../layout/DefaultLayout';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertComponent from '../AlertComponent';
import SelectGroupOne from '../../components/Forms/SelectGroup/SelectGroupOne';
import useCourses from '../../hooks/useCourses';
import { Course } from '../../services/courses-sevice';
import { UserType } from '../../services/user-type-service';
import subjectsService from '../../services/subjects-service';

const SubjectForm = () => {
  let { id } = useParams();
  let navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user'));

  const [data, setData] = useState({
    id: id,
    name: '',
    description: '',
    course_name: '',
    course_id: 0,
  });
  const { courses, setCourses } = useCourses();

  const [message, setMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
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
    }
  };

  useEffect(() => {
    setData({
      ...data,
      course_name: selectedCourse.name,
      course_id: selectedCourse.id,
    });
  }, [selectedCourse]);

  useEffect(() => {
    setData(data);
  }, [data]);

  useEffect(() => {
    if (parseInt(id) > 0) {
      subjectsService.getData(parseInt(id)).then((res) => {
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
    let subject_id: number = id ? parseInt(id) : 0;
    subjectsService.saveData(subject_id, data).then((res) => {
      setData({ ...res.data.data });
      setMessage(res.data.message);
      setShowAlert(res.data.message == 'Success' ? true : false);
    });
  };

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Subject Form" />
      {showAlert ? <AlertComponent message={message} /> : ''}

      <form onSubmit={save}>
        <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
          <div className="flex flex-col gap-9 col-span-2">
            {/* <!-- Contact Form --> */}

            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  General Information
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
                <div className="flex flex-col gap-9 col-span-1">
                  <div className="p-6.5">
                    <div className="mb-4.5">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Subject Code <span className="text-meta-1">*</span>
                      </label>
                      <input
                        id="name"
                        value={data.name ?? ''}
                        onChange={handleOnChange}
                        type="text"
                        disabled={user.user_type_name != 'admin' ? true : false}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </div>

                    <div className="mb-4.5">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Description <span className="text-meta-1">*</span>
                      </label>
                      <input
                        id="description"
                        value={data.description ?? ''}
                        onChange={handleOnChange}
                        type="text"
                        disabled={user.user_type_name != 'admin' ? true : false}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </div>

                    {/* <SelectGroupOne /> */}

                    {/* <button className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90">
                  Send Message
                </button> */}
                  </div>
                </div>

                <div className="flex flex-col gap-9 col-span-1">
                  <div className="p-6.5">
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
              onClick={() => navigate(`/maintenance/subjects`)}
              className="rounded bg-danger p-3 font-medium text-gray hover:bg-opacity-90 m-1"
            >
              Cancel
            </button>
            {user.user_type_name == 'admin' ? (
              <button
                type="submit"
                className="rounded bg-success p-3 font-medium text-gray hover:bg-opacity-90 m-1"
              >
                Save
              </button>
            ) : (
              ''
            )}
          </div>
        </div>
      </form>
    </DefaultLayout>
  );
};

export default SubjectForm;
