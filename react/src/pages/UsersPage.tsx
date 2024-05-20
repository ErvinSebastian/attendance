import DefaultLayout from '../layout/DefaultLayout';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import DataTable, { TableColumn } from 'react-data-table-component';
import useUsers from '../hooks/useUsers';
import { useNavigate } from 'react-router-dom';
import { User } from '../services/user-service';
import { useMemo, useState } from 'react';
import { Button, TextField, styled } from '@mui/material';

interface DataRow {
  id: number;
  name: string;
  email: string;
  user_type_name: string;
  course_name: string;
  is_approved: string;
  student_id: string;
}

const UsersPage = () => {
  const { users, setUsers } = useUsers();
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [filterText, setFilterText] = useState('');
  const filteredItems = users?.filter((item) => {
    return (
      (item.name &&
        item.name.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.course_name &&
        item.course_name.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.is_approved &&
        item.is_approved.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.student_id &&
        item.student_id.toLowerCase().includes(filterText.toLowerCase()))
    );
  });

  let navigate = useNavigate();

  const columns: TableColumn<DataRow>[] = [
    {
      name: 'Student ID',
      selector: (row) => (row.student_id ? row.student_id : 'N/A'),
      sortable: true,
    },
    {
      name: 'Name',
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: 'User Type',
      selector: (row) => row.user_type_name,
    },
    {
      name: 'Course',
      selector: (row) => (row.course_name ? row.course_name : 'N/A'),
    },
    {
      name: 'Status',
      selector: (row) => row.is_approved,
    },
  ];

  const handleRowClick = (e: object) => {
    navigate(`/users/edit/${e.id}`);
  };

  const handleFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterText(event.target.value);
  };

  return (
    <>
      <DefaultLayout>
        <Breadcrumb pageName="Users" />
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
            <div className="flex flex-col gap-9 col-span-1"></div>
            <div className="flex flex-col gap-9 col-span-1">
              <input
                type="text"
                id="filterText"
                value={filterText ?? ''}
                onChange={handleFilter}
                className="w-full rounded border-[1px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                placeholder="Search"
              />
            </div>
          </div>

          <div className="max-w-full overflow-x-auto">
            <DataTable
              columns={columns}
              data={filteredItems}
              pagination
              paginationResetDefaultPage={resetPaginationToggle}
              highlightOnHover
              pointerOnHover
              onRowClicked={handleRowClick}
              persistTableHead
              dense
            />
          </div>
        </div>

        <div className="flex flex-col gap-10">
          <div className="sticky bottom-0 flex justify-end">
            <div className="text-gray-700 text-center bg-gray-400 px-4 py-2 m-2">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
                onClick={() => navigate(`/users/add/`)}
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      </DefaultLayout>
    </>
  );
};

export default UsersPage;
