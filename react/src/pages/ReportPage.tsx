import React, { useEffect, useState } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../layout/DefaultLayout';
import AlertComponent from './AlertComponent';
import { Autocomplete, TextField } from '@mui/material';
import userService, { User } from '../services/user-service';
import { Subject } from '../services/subjects-service';
import DataTable, { TableColumn } from 'react-data-table-component';
import schedules from '../services/schedules';

interface IUser {
  id: number;
  name: string;
}
interface IParameter {
  teacherId: number;
  subjectId: number;
  studentId: number;
  userTypeName: string;
}
interface IAttendance {
  absent: number;
  present: number;
  teacher_name: string;
  subject_name: string;
  student_name: string;
}

const ReportPage = () => {
  const session = JSON.parse(sessionStorage.getItem('user'));
  const user = JSON.parse(sessionStorage.getItem('user'));
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState('');
  const [alertTemplate, setAlertTemplate] = useState('green');
  const [teachers, setTeachers] = useState<IUser[]>([]);
  const [students, setStudents] = useState<IUser[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attendances, setAttendances] = useState<IAttendance[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<IUser>(null);
  const [selectedStudent, setSelectedStudent] = useState<IUser>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject>(null);

  const columns: TableColumn<IAttendance>[] = [
    {
      name: 'Subject',
      selector: (row) => row.subject_name,
      sortable: true,
      width: '25%',
    },
    {
      name: session.user_type_name == 'student' ? 'Instructor' : 'Student',
      selector: (row) =>
        session.user_type_name == 'student'
          ? row.teacher_name
          : row.student_name,
      width: '25%',
    },
    {
      name: 'Absents',
      selector: (row) => row.absent,
      width: '25%',
    },
    {
      name: 'Presnts',
      selector: (row) => row.present,
      width: '25%',
    },
  ];

  useEffect(() => {
    initialize(user);
  }, []);
  const getTeachersOfStudent = (student_id: number) => {
    return userService.getTeachersOfStudent(student_id).then((res) => {
      return res.data;
    });
  };

  const getStudentsOfTeacher = (teacher_id: number) => {
    return userService.getStudentsOfTeacher(teacher_id).then((res) => {
      return res.data;
    });
  };

  const getSubjectsOfStudent = (student_id: number) => {
    return userService
      .getSubjectsOfStudent(student_id, session.user_type_name)
      .then((res) => {
        return res.data;
      });
  };

  const fetchAttendanceReport = (params: IParameter) => {
    console.log(params);
    return userService.getAttendanceReport(params).then((res) => {
      return res.data;
    });
  };

  const initialize = async (user: UserDataType) => {
    const t = await getTeachersOfStudent(user.id);
    const s = await getSubjectsOfStudent(user.id);
    const st = await getStudentsOfTeacher(user.id);
    if (t.result) {
      setTeachers([...t.result]);
    }
    if (s) {
      setSubjects([...s.result]);
    }
    if (st && st.result.length > 0) {
      setStudents([...st.result]);
    }
  };

  const handleFilter = (searchText: string) => {
    console.log(searchText);
  };

  const generateAttendanceReport = async (
    event: React.ChangeEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const params: IParameter = {
      userId: user.id,
      userTypeName: session.user_type_name,
    };
    if (selectedTeacher) {
      params.teacherId = selectedTeacher.id;
    }
    if (selectedSubject) {
      params.subjectId = selectedSubject.id;
    }
    if (selectedStudent) {
      params.studentId = selectedStudent.id;
    }

    const a = await fetchAttendanceReport(params);

    if (a) {
      setAttendances(a.result);
    }
  };

  const convertArrayOfObjectsToCSV = (array) => {
    let result;
    console.log(array);
    const columnDelimiter = ',';
    const lineDelimiter = '\n';
    const keys = Object.keys(attendances[0]);

    result = '';
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    array.forEach((item) => {
      let ctr = 0;
      keys.forEach((key) => {
        if (ctr > 0) result += columnDelimiter;

        result += item[key];

        ctr++;
      });
      result += lineDelimiter;
    });

    return result;
  };

  const downloadCSV = (array) => {
    const link = document.createElement('a');
    let csv = convertArrayOfObjectsToCSV(array);
    if (csv == null) return;

    const filename = 'export.csv';

    if (!csv.match(/^data:text\/csv/i)) {
      csv = `data:text/csv;charset=utf-8,${csv}`;
    }

    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', filename);
    link.click();
  };

  const Export = ({ onExport }) => (
    <button
      type="submit"
      className="rounded bg-success p-3 text-sm text-gray hover:bg-opacity-90 m-1"
      onClick={(e) => onExport(e.target.value)}
    >
      Export
    </button>
  );

  const actionsMemo = React.useMemo(
    () => <Export onExport={() => downloadCSV(attendances)} />,
    [],
  );

  return (
    <>
      <DefaultLayout>
        <Breadcrumb pageName="Report Page" />
        {showAlert ? (
          <AlertComponent message={message} alertTemplate={alertTemplate} />
        ) : (
          ''
        )}

        <form onSubmit={generateAttendanceReport}>
          <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
            <div className="flex flex-col gap-9 col-span-2">
              {/* <!-- Contact Form --> */}

              <div className="">
                <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
                  <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark flex flex-col gap-9 col-span-1 ">
                    {session.user_type_name == 'student' ? (
                      <div className="p-6.5">
                        <div className="mb-4.5">
                          <label className="mb-2.5 block text-black dark:text-white text-sm">
                            Select Teacher{' '}
                            <span className="text-meta-1">*</span>
                          </label>
                          <Autocomplete
                            disablePortal
                            id="combo-box-demo"
                            clearOnBlur
                            value={selectedTeacher}
                            options={teachers}
                            onChange={(event: any, newValue: User | null) => {
                              setSelectedTeacher(newValue);
                            }}
                            sm={{ width: 500 }}
                            sx={{
                              '& .MuiInputBase-root': {
                                height: '43px',
                                padding: 0,
                                paddingLeft: '20px', //
                              },
                            }}
                            getOptionLabel={(option) => option.name || ''}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                onChange={(
                                  event: React.ChangeEventHandler<HTMLInputElement>,
                                ) => {
                                  handleFilter(event.target.value);
                                }}
                              />
                            )}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="p-6.5">
                        <div className="mb-4.5">
                          <label className="mb-2.5 block text-black dark:text-white text-sm">
                            Select Student{' '}
                            <span className="text-meta-1">*</span>
                          </label>
                          <Autocomplete
                            disablePortal
                            id="combo-box-demo"
                            clearOnBlur
                            value={selectedStudent}
                            options={students}
                            onChange={(event: any, newValue: User | null) => {
                              setSelectedStudent(newValue);
                            }}
                            sm={{ width: 500 }}
                            sx={{
                              '& .MuiInputBase-root': {
                                height: '43px',
                                padding: 0,
                                paddingLeft: '20px', //
                              },
                            }}
                            getOptionLabel={(option) => option.name || ''}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                onChange={(
                                  event: React.ChangeEventHandler<HTMLInputElement>,
                                ) => {
                                  handleFilter(event.target.value);
                                }}
                              />
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark flex flex-col gap-9 col-span-1 ">
                    <div className="p-6.5">
                      <div className="mb-4.5">
                        <label className="mb-2.5 block text-black dark:text-white text-sm">
                          Select Subject <span className="text-meta-1">*</span>
                        </label>
                        <Autocomplete
                          disablePortal
                          id="combo-box-demo"
                          clearOnBlur
                          value={selectedSubject}
                          options={subjects}
                          onChange={(event: any, newValue: User | null) => {
                            setSelectedSubject(newValue);
                          }}
                          sm={{ width: 500 }}
                          sx={{
                            '& .MuiInputBase-root': {
                              height: '43px',
                              padding: 0,
                              paddingLeft: '20px', //
                            },
                          }}
                          getOptionLabel={(option) => option.name || ''}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              onChange={(
                                event: React.ChangeEventHandler<HTMLInputElement>,
                              ) => {
                                handleFilter(event.target.value);
                              }}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 mt-10">
            <div className="flex flex-col gap-9 col-span-2">
              {/* <!-- Contact Form --> */}

              <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                  <h3 className="font-medium text-black dark:text-white">
                    Subject Attendance Report
                  </h3>
                </div>
                <div className="max-w-full overflow-x-auto">
                  <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                    <div className="max-w-full overflow-x-auto m-6">
                      <DataTable
                        columns={columns}
                        data={attendances}
                        highlightOnHover
                        pointerOnHover
                        dense
                        actions={actionsMemo}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mt-10">
            <div className="flex flex-row flex-row-reverse ">
              <button
                type="submit"
                className="rounded bg-success p-3 font-medium text-gray hover:bg-opacity-90 m-1"
              >
                Generate Attendance Report
              </button>

              <button
                onClick={() => navigator(`/classes`)}
                className="rounded bg-danger p-3 font-medium text-gray hover:bg-opacity-90 m-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </DefaultLayout>
    </>
  );
};

export default ReportPage;
