import DefaultLayout from '../layout/DefaultLayout';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import DataTable, { TableColumn } from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';
import useCourses from '../hooks/useCourses';
import { useEffect, useState } from 'react';
import { Button, Modal } from 'flowbite-react';
import CourseModal from './CourseModal';
import CoursesSevice, { Course } from '../services/courses-sevice';
import coursesSevice from '../services/courses-sevice';
import AlertComponent from './AlertComponent';

interface DataRow {
  id: number;
  name: string;
  description: string;
}
const CourseList = () => {
  const session = JSON.parse(sessionStorage.getItem('user'));
  const { courses, setCourses } = useCourses();
  const [selectedCourse, setSelectedCourse] = useState<Course>({
    id: 0,
    name: '',
    description: '',
  });
  const [showModal, setShowModal] = useState(false);
  const handleCloseModal = () => setShowModal(false);
  const handleOpenModal = () => setShowModal(true);
  const [message, setMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  const changeTextColor = () => {
    setIsOptionSelected(true);
  };
  let navigate = useNavigate();

  useEffect(() => {
    const timeId = setTimeout(() => {
      // After 3 seconds set the show value to false
      setShowAlert(false);
    }, 3000);

    return () => {
      clearTimeout(timeId);
    };
  }, [showAlert]);

  const handleRowClick = (e: Course) => {
    setSelectedCourse({ ...e });
    setShowModal(true);
  };
  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedCourse({
      ...selectedCourse,
      [event.target.id]: event.target.value,
    });
  };
  const saveCourse = () => {
    let course_id: number = selectedCourse.id ? selectedCourse.id : 0;
    coursesSevice.saveData(course_id, selectedCourse).then((res) => {
      setShowModal(false);
      setCourses([...res.data.data]);
      setMessage(res.data.message);
      setShowAlert(res.data.message == 'Success' ? true : false);
    });
  };
  const columns: TableColumn<DataRow>[] = [
    {
      name: 'Id',
      selector: (row) => row.id,
      sortable: true,
      width: '10%',
    },
    {
      name: 'Name',
      selector: (row) => row.name,
      sortable: true,
      width: '30%',
    },
    {
      name: 'Description',
      selector: (row) => row.description,
    },
  ];

  return (
    <>
      {showModal ? (
        <CourseModal
          selectedCourse={selectedCourse}
          handleOpenModal={handleOpenModal}
          handleCloseModal={handleCloseModal}
          saveCourse={saveCourse}
          handleOnChange={handleOnChange}
          userTypeName={session.user_type_name}
        />
      ) : null}

      <DefaultLayout>
        <Breadcrumb pageName="Courses" />
        {showAlert ? <AlertComponent message={message} /> : ''}
        <div className="flex flex-col gap-10">
          <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <div className="max-w-full overflow-x-auto">
              <DataTable
                columns={columns}
                data={courses}
                pagination
                highlightOnHover
                pointerOnHover
                onRowClicked={handleRowClick}
                dense
              />
            </div>
          </div>

          {session.user_type_name == 'admin' ? (
            <div className="sticky bottom-0 flex justify-end">
              <div className="text-gray-700 text-center bg-gray-400 px-4 py-2 m-2">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
                  onClick={() => {
                    setShowModal(true);
                    setSelectedCourse({
                      id: 0,
                      name: '',
                      description: '',
                    });
                  }}
                >
                  Create Course
                </button>
              </div>
            </div>
          ) : (
            ''
          )}
        </div>{' '}
      </DefaultLayout>
    </>
  );
};

export default CourseList;
