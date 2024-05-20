import React, { useEffect, useState } from 'react';
import { Course } from '../services/courses-sevice';
import { Student } from '../services/student-service';
import DataTable, { TableColumn } from 'react-data-table-component';

interface Props {
  handleOpenModal: () => void;
  handleCloseModal: () => void;
  students: Student[];
  saveCourse: () => void;
  handleOnSelect: () => void;
}
interface DataRow {
  id: number;
  name: string;
  course_name: string;
}

export default function CourseModal({
  handleOpenModal,
  handleCloseModal,
  selectedCourse,
  saveCourse,
  handleOnSelect,
  students,
}: Props) {
  // const handleClose = () => setShow(false);
  // const handleShow = () => setShow(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(students);
  }, [students]);

  const columns: TableColumn<DataRow>[] = [
    {
      name: 'Name',
      selector: (row) => row.name,
      sortable: true,
      width: '30%',
    },
    {
      name: 'Course',
      selector: (row) => row.course_name,
    },
  ];
  return (
    <>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-99999 outline-none focus:outline-none">
        <div className="w-auto mx-auto">
          {/*content*/}
          <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none w-full">
            {/*header*/}
            <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
              <label className="mb-2.5 block text-black dark:text-white font-semibold">
                Add Student
              </label>
              <button
                className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                onClick={handleCloseModal}
              >
                <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                  ×
                </span>
              </button>
            </div>
            {/*body*/}
            <div className="relative p-6 flex-auto">
              <div className="w-full mb-8">
                <DataTable
                  selectableRows
                  columns={columns}
                  data={items}
                  pagination
                  highlightOnHover
                  pointerOnHover
                  dense
                  className="w-100"
                />
              </div>
            </div>
            {/*footer*/}
            <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
              <button
                className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="button"
                onClick={handleCloseModal}
              >
                Close
              </button>
              <button
                className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="button"
                onClick={saveCourse}
              >
                <span className="block text-white">Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  );
}
