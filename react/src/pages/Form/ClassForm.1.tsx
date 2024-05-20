import { useParams } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../../layout/DefaultLayout';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertComponent from '../AlertComponent';
import SelectGroupOne from '../../components/Forms/SelectGroup/SelectGroupOne';
import { Subject } from '../../services/subjects-service';
import useSubjects from '../../hooks/useSubject';
import Autocomplete from '../../components/Autocomplete/Autocomplete';
import useTeachers from '../../hooks/useTeachers';
import classService from '../../services/class-service';
import DataTable, { TableColumn } from 'react-data-table-component';
import useStudents from '../../hooks/useStudents';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import { DataRow, BootstrapDialog } from './ClassForm';

export const ClassForm = () => {
  let { id } = useParams();
  let navigate = useNavigate();

  const [data, setData] = useState({
    id: id ? id : 0,
    teacher_name: '',
    teacher_id: 0,
    subject_name: '',
    subject_id: 0,
    name: '',
  });

  const { teachers, setTeachers } = useTeachers();
  const { students, setStudents } = useStudents();
  const { subjects, setSubjects } = useSubjects();
  const [message, setMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const [selectedTeacher, setSelectedTeacher] = useState<User>({
    id: 0,
    name: '',
    user_type_name: '',
  });
  const [selectedSubject, setSelectedSubject] = useState<Subject>({
    id: 0,
    name: '',
    description: '',
  });

  const [selectedStudents, setSelectedStudents] = useState<User[]>();

  const onSelectionChange = (id: number, header: string) => {
    switch (header) {
      case 'Teacher':
        setSelectedTeacher(
          teachers.find((user: User) => user.id == id) ?? {
            id: 0,
            name: '',
            user_type_name: '',
          },
        );
        break;
      case 'Subject':
        setSelectedSubject(
          subjects.find((subject: Subject) => subject.id == id) ?? {
            id: 0,
            name: '',
            description: '',
          },
        );
        break;
    }
  };

  const autocompleteHandle = (item) => {
    setSelectedTeacher(item);
  };
  useEffect(() => {
    setData({
      ...data,
      subject_name: selectedSubject.name,
      subject_id: selectedSubject.id,
    });
  }, [selectedSubject]);

  useEffect(() => {
    setData({
      ...data,
      teacher_name: selectedTeacher.name,
      teacher_id: selectedTeacher.id,
    });
  }, [selectedTeacher]);

  useEffect(() => {
    setData({
      ...data,
      teacher_name: selectedTeacher.name,
      teacher_id: selectedTeacher.id,
    });
  }, [selectedTeacher]);

  useEffect(() => {
    console.log('last updates: ', data);
  }, [data]);

  useEffect(() => {
    if (parseInt(id) > 0) {
      classService.getData(parseInt(id)).then((res) => {
        const data = res.data.data;
        setData({
          ...data,
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
    let class_id: number = id ? parseInt(id) : 0;
    classService.saveData(class_id, data).then((res) => {
      setData({ ...res.data.data });
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
      name: 'Course',
      selector: (row) => row.course_name,
    },
  ];

  return (
    <>
      <DefaultLayout>
        <Breadcrumb pageName="Class Form" />
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
                          Class Name <span className="text-meta-1">*</span>
                        </label>
                        <input
                          id="name"
                          value={data.name ?? ''}
                          onChange={handleOnChange}
                          type="text"
                          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                      </div>
                      <div className="mb-4.5">
                        <Autocomplete
                          items={teachers}
                          autocompleteHandle={(item) =>
                            autocompleteHandle(item)
                          }
                          header="Teacher"
                          name={data.teacher_name}
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
                          items={subjects}
                          onSelectionChange={(id, header) =>
                            onSelectionChange(id, header)
                          }
                          selectedItem={data.subject_id ?? 0}
                          header="Subject"
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
                    Students
                  </h3>
                </div>

                <div className="grid grid-cols-1">
                  <div className="max-w-full overflow-x-auto">
                    <div className="sticky bottom-0 flex justify-end">
                      <div className="text-gray-700 text-center bg-gray-400 px-4 py-2 m-2">
                        <button
                          className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
                          type="button"
                          onClick={handleClickOpen}
                        >
                          Add Student
                        </button>
                      </div>
                    </div>
                    <DataTable
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
          <div className="grid grid-cols-1 gap-4 mt-10">
            <div className="flex flex-row flex-row-reverse ">
              <button
                onClick={() => navigate(`/classes`)}
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
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Modal title
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
        <DialogContent dividers>
          <Typography gutterBottom>
            Cras mattis consectetur purus sit amet fermentum. Cras justo odio,
            dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta
            ac consectetur ac, vestibulum at eros.
          </Typography>
          <Typography gutterBottom>
            Praesent commodo cursus magna, vel scelerisque nisl consectetur et.
            Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor
            auctor.
          </Typography>
          <Typography gutterBottom>
            Aenean lacinia bibendum nulla sed consectetur. Praesent commodo
            cursus magna, vel scelerisque nisl consectetur et. Donec sed odio
            dui. Donec ullamcorper nulla non metus auctor fringilla.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            Save changes
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </>
  );
};
