import React, { useState } from 'react';
import { Course } from '../services/courses-sevice';

interface Props {
  handleOpenModal: () => void;
  handleCloseModal: () => void;
  selectedCourse: Course;
  saveCourse: () => void;
  handleOnChange: () => void;
  userTypeName: string;
}

export default function CourseModal({
  handleOpenModal,
  handleCloseModal,
  selectedCourse,
  saveCourse,
  handleOnChange,
  userTypeName,
}: Props) {
  // const handleClose = () => setShow(false);
  // const handleShow = () => setShow(true);
  return (
    <>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-99999 outline-none focus:outline-none">
        <div className="relative w-auto my-6 mx-auto max-w-3xl">
          {/*content*/}
          <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            {/*header*/}
            <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
              <label className="mb-2.5 block text-black dark:text-white font-semibold">
                Add Course
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
              <div className="w-100 mb-8">
                <label className="mb-2 block text-black dark:text-white">
                  Name <span className="text-meta-1">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={selectedCourse.name ?? ''}
                  onChange={handleOnChange}
                  disabled={userTypeName != 'admin' ? true : false}
                  placeholder="Eq: BSIT"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <div className="mb-8">
                <label className="mb-2 block text-black dark:text-white">
                  Description <span className="text-meta-1">*</span>
                </label>
                <input
                  id="description"
                  value={selectedCourse.description ?? ''}
                  onChange={handleOnChange}
                  type="text"
                  disabled={userTypeName != 'admin' ? true : false}
                  placeholder="Eq: Bachelor of Science in Information Technology"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-5text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
              {userTypeName == 'admin' ? (
                <button
                  className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                  type="button"
                  onClick={saveCourse}
                >
                  <span className="block text-white">Save</span>
                </button>
              ) : (
                ''
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  );
}
