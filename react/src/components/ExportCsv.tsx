import React from 'react';
import DataTable from 'react-data-table-component';

// Blatant "inspiration" from https://codepen.io/Jacqueline34/pen/pyVoWr
function convertArrayOfObjectsToCSV(array) {
  let result;

  const columnDelimiter = ',';
  const lineDelimiter = '\n';
  const keys = Object.keys(data[0]);

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
}

// Blatant "inspiration" from https://codepen.io/Jacqueline34/pen/pyVoWr
function downloadCSV(array) {
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
}

const Export = ({ onExport }) => (
  <button
    type="submit"
    className="rounded bg-success p-3 font-medium text-gray hover:bg-opacity-90 m-1"
    onClick={(e) => onExport(e.target.value)}
  >
    Export
  </button>
);

const columns = [
  {
    name: 'Title',
    selector: (row) => row.title,
    sortable: true,
  },
  {
    name: 'Director',
    selector: (row) => row.director,
    sortable: true,
  },
  {
    name: 'Year',
    selector: (row) => row.year,
    sortable: true,
  },
];

export const ExportCSV = () => {
  const actionsMemo = React.useMemo(
    () => <Export onExport={() => downloadCSV(data)} />,
    [],
  );

  return (
    <DataTable
      title="Movie List"
      columns={columns}
      data={data}
      actions={actionsMemo}
    />
  );
};

export default {
  title: 'Examples/Export CSV',
  component: ExportCSV,
};
