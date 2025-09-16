import TableCell from "./TableCell";
import TableSectionHeader from "./TableSectionHeader";
import type { Column, TableRow } from "../types";

const ComparisonTable: React.FC<{
  rows: TableRow[];
  sectionTitle?: string;
}> = ({ rows, sectionTitle }) => {
  const columns: Column[] = [
    { title: 'Feature' },
    { title: 'Sonacove Meets', isPrimary: true },
    { title: 'Zoom' },
    { title: 'Google Meet' },
  ];

  return (
    <div className='mb-16'>
      {sectionTitle && (
        <h3 className='text-2xl font-semibold mb-6 text-gray-800 border-b border-gray-200 pb-2'>
          {sectionTitle}
        </h3>
      )}
      <div className='overflow-x-auto'>
        <table className='w-full text-left border-collapse text-base'>
          <thead>
            <tr className='bg-gray-100'>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`p-4 border border-gray-200 text-lg ${
                    column.isPrimary ? 'text-primary-700' : ''
                  } ${index === 0 ? 'rounded-tl-lg w-1/4' : ''} ${
                    index === columns.length - 1 ? 'rounded-tr-lg' : ''
                  } text-center`}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='text-base'>
            {rows.map((row) =>
              row.isHeader ? (
                <TableSectionHeader key={row.feature} title={row.feature} />
              ) : (
                <tr key={row.feature}>
                  <TableCell content={row.feature} />
                  <TableCell
                    content={row.sonacove.value || ''}
                    icon={row.sonacove.icon}
                    primary={row.sonacove.isPrimary}
                    centerText={!row.sonacove.value}
                    note={row.sonacove.note}
                  />
                  <TableCell
                    content={row.zoom.value || ''}
                    icon={row.zoom.icon}
                    centerText={!row.zoom.value}
                    note={row.zoom.note}
                  />
                  <TableCell
                    content={row.googleMeet.value || ''}
                    icon={row.googleMeet.icon}
                    centerText={!row.googleMeet.value}
                    note={row.googleMeet.note}
                  />
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonTable