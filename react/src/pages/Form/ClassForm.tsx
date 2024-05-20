import { useParams } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../../layout/DefaultLayout';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertComponent from '../AlertComponent';
import { Subject } from '../../services/subjects-service';
import useSubjects from '../../hooks/useSubject';
import useTeachers from '../../hooks/useTeachers';
import classService from '../../services/class-service';
import DataService from '../../services/data-service';
import DataTable, { TableColumn } from 'react-data-table-component';
import useStudents from '../../hooks/useStudents';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
} from '@mui/material';
import React from 'react';
import studentService, { Student } from '../../services/student-service';
import Timepicker from '../UiElements/TImepicker';
import QRScanner from './QRScanner/QRScanner';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import QRCode from 'react-qr-code';
import schedules from '../../services/schedules';
import moment from 'moment';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

interface DataRow {
  id: number;
  name: string;
  course_name: string;
}

interface ScheduleDataRow {
  id: number;
  name: string;
  time_in: string;
  time_out: string;
  time_in_label: string;
  time_out_label: string;
}
interface Attendance {
  student_name: string;
  time_in_date: string;
  status: string;
}

interface ISubject {
  id: number;
  name: string;
  description: number;
}

interface ITeacher {
  id: number;
  name: string;
  user_type_id: number;
}

interface IStudent {
  id: number;
  name: string;
  course: string;
}
const ClassForm = () => {
  let { id } = useParams();
  let navigate = useNavigate();

  const [data, setData] = useState({
    id: id ? id : 0,
    teacher_name: '',
    teacher_id: 0,
    subject_name: '',
    subject_id: 0,
    name: '',
    schoolYearFrom: '',
    schoolYearTo: '',
    semester: '',
    students: [],
    teacher: {},
    subject: {},
    schedules: [],
  });

  const [qrData, setQrdata] = useState({
    id: id ? id : 0,
    teacher_name: '',
    teacher_id: 0,
    subject_name: '',
    subject_id: 0,
    name: '',
  });

  const attendanceColumns: TableColumn<Attendance>[] = [
    {
      name: 'Student',
      selector: (row) => row.student_name,
      sortable: true,
      width: '40%',
    },
    {
      name: 'Time In',
      selector: (row) => row.time_in_date,
      width: '30%',
    },
    {
      name: 'Status',
      selector: (row) => row.status,
      width: '30%',
    },
  ];

  const session = JSON.parse(sessionStorage.getItem('user'));
  const { teachers, setTeachers } = useTeachers();
  const { students, setStudents } = useStudents();
  const { subjects, setSubjects } = useSubjects();
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [message, setMessage] = useState('');
  const [schoolYearFrom, setSchoolYearFrom] = useState(null);
  const [schoolYearTo, setSchoolYearTo] = useState(null);
  const [semester, setSemester] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [open, setOpen] = useState(false);
  const [openScanner, setOpenScanner] = useState(false);
  const [openQr, setOpenQr] = useState(false);
  const [isSchedOpen, setIsSchedOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [alertTemplate, setAlertTemplate] = useState('green');
  const [selectedAttendances, setSelectedAttendances] = useState<Attendance[]>(
    [],
  );
  const [activeSchedule, setActiveSchedule] =
    useState<ScheduleDataRow | null>();
  const [selectedSchedules, setSelectedSchedules] = useState<ScheduleDataRow[]>(
    [],
  );
  const [selectedTeacher, setSelectedTeacher] = useState<ITeacher | null>();
  const [selectedSubject, setSelectedSubject] = useState<ISubject | null>();
  const [filterText, setFilterText] = useState('');

  const columns: TableColumn<DataRow>[] = [
    {
      name: 'Name',
      selector: (row) => row.name,
      sortable: true,
      width: '60%',
    },
    {
      name: 'Course',
      selector: (row) => row.course_name,
      width: '30%',
    },
    {
      name: 'Action',
      cell: (row) =>
        session.user_type_name == 'admin' ? (
          <button
            onClick={() => removeSelectedStudent(row.id)}
            className="rounded bg-danger font-small text-gray hover:bg-opacity-90 m-1"
          >
            <DeleteIcon></DeleteIcon>
          </button>
        ) : (
          ''
        ),
      width: '10%',
    },
  ];

  const scheduleColumns: TableColumn<ScheduleDataRow>[] = [
    {
      name: 'Day',
      selector: (row) => row.name,
      sortable: true,
      width: '40%',
      cell: (row, index) =>
        session.user_type_name == 'admin' ? (
          <div style={{ margin: 0, width: '100%' }}>
            <Autocomplete
              id="combo-box-demo"
              options={DataService.days}
              value={row.name}
              readOnly={session.user_type_name == 'admin' ? false : true}
              autoHighlight={true}
              fullWidth={true}
              onChange={(event: any, newValue: string) => {
                console.log(newValue, row);
                const newSched = selectedSchedules.map((s) =>
                  s.id == row.id ? { ...s, name: newValue } : { ...s },
                );
                setSelectedSchedules(newSched);
              }}
              sx={{
                '& .MuiInputBase-root': {
                  height: '30px',
                  padding: 0,
                  paddingLeft: '20px',
                  fontSize: '13px', //
                  width: '100%',
                },
              }}
              getOptionLabel={(option) => option}
              renderInput={(params) => <TextField {...params} />}
            />
          </div>
        ) : (
          <span>{row.name}</span>
        ),
    },
    {
      name: 'Time In',
      selector: (row) => row.time_in,
      width: '20%',
      cell: (row, index) =>
        session.user_type_name == 'admin' ? (
          <div>
            <Timepicker
              time={row.time_in}
              handleTime={handleTime}
              day={row.name}
              type="time_in"
              index={index}
            />
          </div>
        ) : (
          <span>{row.time_in_label}</span>
        ),
    },
    {
      name: 'Time Out',
      selector: (row) => row.time_out,
      width: '20%',
      cell: (row, index) =>
        session.user_type_name == 'admin' ? (
          <div>
            <Timepicker
              time={row.time_out}
              handleTime={handleTime}
              day={row.name}
              type="time_out"
              index={index}
            />
          </div>
        ) : (
          <span>{row.time_out_label}</span>
        ),
    },
    {
      name: 'Action',
      cell: (row) =>
        session.user_type_name == 'admin' ? (
          <button
            onClick={() => {
              console.log(selectedSchedules, row.id);
              setSelectedSchedules(
                selectedSchedules.filter((s) => s.id != row.id),
              );
            }}
            className="rounded bg-danger font-small text-gray hover:bg-opacity-90 m-1"
          >
            <DeleteIcon></DeleteIcon>
          </button>
        ) : (
          ''
        ),
      width: '10%',
    },
  ];

  const handleFilter = (searchText: string) => {
    const selected_ids = selectedStudents.map((student) => student.id);
    setFilterText(searchText);

    const params = {
      searchText: filterText,
      selected_ids: selected_ids,
    };
    studentService.getStudentsByQuery(params).then((res) => {
      if (res.data && res.data.length > 0) {
        setStudents(res.data);
      } else {
        setStudents([]);
      }
    });
  };

  const removeSelectedStudent = (id: number) => {
    setSelectedStudents(selectedStudents.filter((s) => s.id != id));
  };

  const checkSchedule = () => {
    let currentDate = new Date();
    let day = currentDate.toLocaleString('en-us', { weekday: 'long' });
    let time = currentDate.toLocaleTimeString('en-US', {
      hour12: false,
      hour: 'numeric',
      minute: 'numeric',
    });
    const active = selectedSchedules.find((sched) => {
      let time_in_date = new Date();
      let new_converted_time = new Date(
        time_in_date.toLocaleDateString() + ' ' + sched.time_in,
      );

      let time_allowance = moment(new_converted_time)
        .add(30, 'm')
        .toDate()
        .toLocaleTimeString('en-US', {
          hour12: false,
          hour: 'numeric',
          minute: 'numeric',
        });

      return sched.time_in <= time && time_allowance >= time;
    });
    if (active && active != undefined) {
      setIsSchedOpen(true);
      setActiveSchedule({ ...active });
    } else {
      setIsSchedOpen(false);
      setActiveSchedule({});
    }
    //here we validate student allow the showing and scanning of qr code
  };

  useEffect(() => {
    if (parseInt(id) > 0 && id) {
      const getClass = async (id: any) => {
        if (id) {
          const response = classService.getData(parseInt(id)).then((res) => {
            return res.data.data;
          });

          const classData = await response;
          if (classData) {
            setData({
              ...classData,
            });

            setQrdata({
              id: classData.id,
              teacher_name: classData.teacher_name,
              teacher_id: classData.teacher_id,
              subject_name: classData.subject_name,
              subject_id: classData.subject_id,
              name: classData.name,
            });

            setSelectedAttendances(
              classData.attendances.length > 0
                ? [...classData.attendances]
                : [],
            );

            setSelectedSchedules(
              classData.schedules.length > 0 ? [...classData.schedules] : [],
            );
            setSchoolYearFrom(classData.schoolYearFrom);
            setSchoolYearTo(classData.schoolYearTo);
            setSemester(classData.semester);
          }
        }
      };

      getClass(id);
    } else {
      setSelectedSchedules([]);
    }
  }, []);

  const addSchedule = () => {
    setSelectedSchedules([
      ...selectedSchedules,
      {
        id: selectedSchedules.length == 0 ? 1 : selectedSchedules.length + 1,
        name: 'Monday',
        time_in: '',
        time_out: '',
      },
    ]);
  };

  const handleTime = (
    time: string,
    day: string,
    type: string,
    index: number,
  ) => {
    let newSchedule = selectedSchedules.map((item, i) => {
      return i == index
        ? {
            ...item,
            time_in: time
              ? type == 'time_in'
                ? time
                : item.time_in
              : item.time_in,

            time_out: time
              ? type == 'time_out'
                ? time
                : item.time_out
              : item.time_out,
          }
        : { ...item };
    });

    setSelectedSchedules(newSchedule);
    setData({ ...data, schedules: newSchedule });
  };

  useEffect(() => {
    setData({
      ...data,
      schedules: selectedSchedules ? [...selectedSchedules] : [],
    });
    checkSchedule();
  }, [selectedSchedules]);

  const handleClickOpen = () => {
    setFilterText('');
    handleFilter(filterText);
    setOpen(true);
  };

  const handleScannerModal = () => {
    setOpenScanner(true);
  };
  const handleQrModal = () => {
    setOpenQr(true);
  };
  const closeQr = () => {
    setOpenQr(false);
  };

  const closeScanner = () => {
    setOpenScanner(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // useEffect(() => {}, [data]);

  useEffect(() => {
    setSelectedStudents(data.students);
  }, [students]);

  useEffect(() => {
    setSelectedTeacher(
      teachers ? teachers?.find((t) => t.id == data.teacher_id) : null,
    );
  }, [teachers]);

  useEffect(() => {
    setSelectedSubject(
      subjects ? subjects?.find((t) => t.id == data.subject_id) : null,
    );
  }, [subjects]);

  useEffect(() => {
    setData({
      ...data,
      students: selectedStudents ? [...selectedStudents] : [],
    });
  }, [selectedStudents]);

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

    let class_id: number = id ? parseInt(id) : 0;
    classService.saveData(class_id, data).then((res) => {
      setData({ ...res.data.data });
      setMessage(res.data.message);
      setShowAlert(res.data.message == 'Success' ? true : false);
    });
  };

  return (
    <>
      <DefaultLayout>
        <Breadcrumb pageName="Class Form" />

        {showAlert ? (
          <div
            style={{
              position: 'fixed',
              top: '100px',
              right: '100px',
              zIndex: 99999999,
            }}
          >
            <AlertComponent message={message} alertTemplate={alertTemplate} />
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
                    General Information
                  </h3>
                </div>
                <div className="sticky bottom-0 flex">
                  <div className="text-gray-700 text-center bg-gray-400 px-2 m-2">
                    {session.user_type_name != 'student' && isSchedOpen ? (
                      <button
                        className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded xs text-xs"
                        type="button"
                        onClick={handleQrModal}
                      >
                        Show QR Code
                      </button>
                    ) : (
                      ''
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
                  <div className="flex flex-col gap-9 col-span-1">
                    <div className="p-6.5">
                      <div className="mb-4.5">
                        <label className="mb-2.5 block text-black dark:text-white text-sm">
                          Class Name <span className="text-meta-1">*</span>
                        </label>
                        <input
                          id="name"
                          value={data.name ?? ''}
                          onChange={handleOnChange}
                          maxLength={60}
                          type="text"
                          readOnly={
                            session.user_type_name == 'admin' ? false : true
                          }
                          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                      </div>
                      <div className="mb-4.5">
                        <label className="mb-2.5 block text-black dark:text-white text-sm">
                          Instructor <span className="text-meta-1">*</span>
                        </label>
                        <Autocomplete
                          disablePortal
                          id="combo-box-demo"
                          options={teachers}
                          maxLength={60}
                          value={selectedTeacher ? selectedTeacher : null}
                          readOnly={
                            session.user_type_name == 'admin' ? false : true
                          }
                          onChange={(event: any, newValue: ITeacher | null) => {
                            if (newValue) {
                              setSelectedTeacher(newValue);
                              setData({
                                ...data,
                                ['teacher_id']: newValue.id,
                                ['teacher_name']: newValue.name,
                                ['teacher']: newValue,
                              });
                            }
                          }}
                          getOptionLabel={(option) => option.name}
                          sm={{ width: 500 }}
                          sx={{
                            '& .MuiInputBase-root': {
                              height: '43px',
                              padding: 0,
                              paddingLeft: '20px', //
                            },
                          }}
                          renderInput={(params) => <TextField {...params} />}
                        />
                      </div>

                      <div className="mb-4.5">
                        <label className="mb-2.5 block text-black dark:text-white text-sm">
                          Semester
                          <span className="text-meta-1">*</span>
                        </label>
                        <Autocomplete
                          disablePortal
                          id="combo-box-demo"
                          value={semester}
                          options={DataService.semesters}
                          readOnly={
                            session.user_type_name == 'admin' ? false : true
                          }
                          onChange={(event: any, newValue: string) => {
                            if (newValue) {
                              setSemester(newValue);
                              setData({
                                ...data,
                                ['semester']: newValue,
                              });
                            }
                          }}
                          sx={{
                            '& .MuiInputBase-root': {
                              height: '43px',
                              padding: 0,
                              paddingLeft: '20px', //
                            },
                          }}
                          renderInput={(params) => <TextField {...params} />}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-9 col-span-1">
                    <div className="p-6.5">
                      <div className="mb-4.5">
                        <label className="mb-2.5 block text-black dark:text-white text-sm">
                          Subject
                          <span className="text-meta-1">*</span>
                        </label>
                        <Autocomplete
                          disablePortal
                          id="combo-box-demo"
                          options={subjects}
                          value={selectedSubject ? selectedSubject : null}
                          readOnly={
                            session.user_type_name == 'admin' ? false : true
                          }
                          onChange={(event: any, newValue: ISubject | null) => {
                            if (newValue) {
                              setSelectedSubject(newValue);
                              setData({
                                ...data,
                                ['subject_id']: newValue.id,
                                ['subject_name']: newValue.name,
                                ['subject']: newValue,
                              });
                            }
                          }}
                          getOptionLabel={(option) => option.name}
                          sm={{ width: 500 }}
                          sx={{
                            '& .MuiInputBase-root': {
                              height: '43px',
                              padding: 0,
                              paddingLeft: '20px', //
                            },
                          }}
                          renderInput={(params) => <TextField {...params} />}
                        />
                      </div>

                      <div className="mb-4.5">
                        <label className="mb-2.5 block text-black dark:text-white text-sm">
                          School Year From
                          <span className="text-meta-1">*</span>
                        </label>
                        <Autocomplete
                          disablePortal
                          id="combo-box-demo"
                          options={DataService.getYearList()}
                          value={schoolYearFrom}
                          readOnly={
                            session.user_type_name == 'admin' ? false : true
                          }
                          onChange={(event: any, newValue: string) => {
                            if (newValue) {
                              setSchoolYearFrom(newValue);
                              setData({
                                ...data,
                                ['schoolYearFrom']: newValue,
                              });
                            }
                          }}
                          getOptionLabel={(option) => option}
                          sx={{
                            '& .MuiInputBase-root': {
                              height: '43px',
                              padding: 0,
                              paddingLeft: '20px', //
                            },
                          }}
                          renderInput={(params) => <TextField {...params} />}
                        />
                      </div>

                      <div className="mb-4.5">
                        <label className="mb-2.5 block text-black dark:text-white text-sm">
                          School Year To <span className="text-meta-1">*</span>
                        </label>
                        <Autocomplete
                          disablePortal
                          id="combo-box-demo"
                          options={DataService.getYearList()}
                          value={schoolYearTo}
                          readOnly={
                            session.user_type_name == 'admin' ? false : true
                          }
                          onChange={(event: any, newValue: string) => {
                            if (newValue) {
                              if (
                                parseInt(newValue) <= parseInt(schoolYearFrom)
                              ) {
                                setMessage(
                                  'School Year To must be greater than School Year To',
                                );
                                setShowAlert(true);
                              } else {
                                setSchoolYearTo(newValue);
                                setData({
                                  ...data,
                                  ['schoolYearTo']: newValue,
                                });
                              }
                            }
                          }}
                          sx={{
                            '& .MuiInputBase-root': {
                              height: '43px',
                              padding: 0,
                              paddingLeft: '20px', //
                            },
                          }}
                          renderInput={(params) => <TextField {...params} />}
                        />
                      </div>

                      {/* <SelectGroupOne /> */}
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
                    Schedule
                  </h3>
                </div>

                <div className="grid grid-cols-1">
                  <div className="sticky bottom-0 flex justify-end">
                    <div className="text-gray-700 text-center bg-gray-400 px-4 py-2 m-2">
                      {session.user_type_name == 'student' && isSchedOpen ? (
                        <button
                          className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded xs text-xs"
                          type="button"
                          onClick={handleScannerModal}
                        >
                          Scan QR Codes
                        </button>
                      ) : (
                        ''
                      )}
                    </div>
                  </div>
                  <div className="max-w-full overflow-x-auto">
                    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                      <div></div>
                      <div className="max-w-full overflow-x-auto">
                        <DataTable
                          columns={scheduleColumns}
                          data={selectedSchedules}
                        />
                      </div>

                      <div className="m-5">
                        {session.user_type_name == 'admin' ? (
                          <button
                            className="bg-blue-500 hover:bg-blue-700 text-white text-xs py-2 px-4 rounded sm"
                            type="button"
                            onClick={addSchedule}
                          >
                            Add Schedule
                          </button>
                        ) : (
                          ''
                        )}
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
                    Students
                  </h3>
                </div>

                <div className="grid grid-cols-1">
                  <div className="max-w-full overflow-x-auto">
                    <div className="sticky bottom-0 flex justify-end">
                      <div className="text-gray-700 text-center bg-gray-400 px-4 py-2 m-2">
                        {session.user_type_name == 'teacher' ||
                        session.user_type_name == 'admin' ? (
                          <button
                            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded sm text-xs"
                            type="button"
                            onClick={handleClickOpen}
                          >
                            Add Student
                          </button>
                        ) : (
                          ''
                        )}
                      </div>
                    </div>
                    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                      <div className="max-w-full overflow-x-auto">
                        <DataTable
                          columns={columns}
                          data={selectedStudents}
                          pagination
                          highlightOnHover
                          pointerOnHover
                          dense
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* attendances */}
          <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 mt-10">
            <div className="flex flex-col gap-9 col-span-2">
              {/* <!-- Contact Form --> */}

              <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                  <h3 className="font-medium text-black dark:text-white">
                    Attendances
                  </h3>
                </div>

                <div className="grid grid-cols-1">
                  <div className="max-w-full overflow-x-auto">
                    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                      <div className="max-w-full overflow-x-auto">
                        <DataTable
                          columns={attendanceColumns}
                          data={selectedAttendances}
                          pagination
                          highlightOnHover
                          pointerOnHover
                          dense
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 mt-10">
            <div className="flex flex-row flex-row-reverse ">
              <button
                onClick={() => navigate(`/classes`)}
                className="rounded bg-danger p-3 font-medium text-gray hover:bg-opacity-90 m-1"
              >
                Cancel
              </button>
              {session.user_type_name != 'student' ? (
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

      <BootstrapDialog
        fullWidth={true}
        maxWidth="md"
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Enroll Students in Class
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent>
          <div
            className="max-w-full overflow-x-auto"
            style={{ height: '250px' }}
          >
            <div className="flex flex-col gap-9 col-span-1">
              {/* <input
                type="text"
                id="filterText"
                onChange={(event) => handleFilter(event?.target.value)}
                className="w-full rounded border-[1px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                placeholder="Search"
              /> */}
            </div>
            <Autocomplete
              disablePortal
              id="combo-box-demo"
              options={students}
              onChange={(event: any, newValue: object | null) => {
                if (newValue) {
                  if (!selectedStudents.find((s) => s.id == newValue.id)) {
                    setSelectedStudents([...selectedStudents, newValue]);
                  }
                }
              }}
              getOptionLabel={(option) => option.name}
              sm={{ width: 500 }}
              sx={{
                '& .MuiInputBase-root': {
                  height: '43px',
                  padding: 0,
                  paddingLeft: '20px', //
                },
              }}
              renderInput={(params) => <TextField {...params} />}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      </BootstrapDialog>
      {openScanner ? (
        <BootstrapDialog
          fullWidth={true}
          maxWidth="md"
          onClose={handleScannerModal}
          aria-labelledby="customized-dialog-title"
          open={openScanner}
        >
          <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
            Scan QR
          </DialogTitle>
          <IconButton
            aria-label="close"
            onClick={closeScanner}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          <DialogContent>
            <div className="max-w-full overflow-x-auto">
              {openScanner ? (
                <QRScanner
                  user={session}
                  activeSchedule={activeSchedule}
                  subjectName={data.subject_name}
                  openScanner={openScanner}
                />
              ) : null}
            </div>
          </DialogContent>
          <DialogActions>
            <Button autoFocus onClick={closeScanner}>
              Close
            </Button>
          </DialogActions>
        </BootstrapDialog>
      ) : (
        ''
      )}

      {openQr ? (
        <BootstrapDialog
          fullWidth={true}
          maxWidth="sm"
          onClose={handleQrModal}
          aria-labelledby="customized-dialog-title"
          open={openQr}
        >
          <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
            {data.name + ' QR Code'}
          </DialogTitle>
          <IconButton
            aria-label="close"
            onClick={closeQr}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          <DialogContent>
            {' '}
            <QRCode
              size={256}
              style={{
                height: 'auto',
                maxWidth: '30%',
                width: '30%',
              }}
              value={JSON.stringify(qrData)}
              viewBox={`0 0 256 256`}
            />
          </DialogContent>
          <DialogActions>
            <Button autoFocus onClick={closeQr}>
              Close
            </Button>
          </DialogActions>
        </BootstrapDialog>
      ) : (
        ''
      )}
    </>
  );
};

export default ClassForm;
