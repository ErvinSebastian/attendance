'use client';
import DefaultLayout from '../layout/DefaultLayout';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import DataTable, { TableColumn } from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AlertComponent from './AlertComponent';
import useClasses from '../hooks/useClasses';

interface DataRow {
  id: number;
  name: string;
  teacher_name: string;
  subject_name: string;
}
const ClassList = () => {
  const { classes, setClasses } = useClasses();
  const [showAlert, setShowAlert] = useState(false);
  let navigate = useNavigate();
  const session = JSON.parse(sessionStorage.getItem('user'));

  useEffect(() => {
    const timeId = setTimeout(() => {
      // After 3 seconds set the show value to false
      setShowAlert(false);
    }, 3000);

    return () => {
      clearTimeout(timeId);
    };
  }, [showAlert]);

  const handleRowClick = (e: object) => {
    navigate(`/classes/edit/${e.id}`);
  };

  const columns: TableColumn<DataRow>[] = [
    {
      name: 'Class Name',
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: 'Subject',
      selector: (row) => row.subject_name,
    },
    {
      name: 'Instructor',
      selector: (row) => row.teacher_name,
      sortable: true,
      width: '30%',
    },
  ];

  return (
    <>
      <DefaultLayout>
        <Breadcrumb pageName="Classes" />
        {showAlert ? <AlertComponent message={message} /> : ''}
        <div className="flex flex-col gap-10">
          <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <div className="max-w-full overflow-x-auto">
              <DataTable
                columns={columns}
                data={classes}
                pagination
                highlightOnHover
                pointerOnHover
                onRowClicked={handleRowClick}
                dense
              />
            </div>
          </div>

          <div className="sticky bottom-0 flex justify-end">
            {session.user_type_name == 'admin' ? (
              <div className="text-gray-700 text-center bg-gray-400 px-4 py-2 m-2">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
                  onClick={() => navigate(`/classes/add`)}
                >
                  Create Class
                </button>
              </div>
            ) : (
              ''
            )}
          </div>
        </div>{' '}
      </DefaultLayout>
    </>
  );
};

export default ClassList;
