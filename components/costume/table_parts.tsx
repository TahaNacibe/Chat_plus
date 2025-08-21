type TableProps = React.TableHTMLAttributes<HTMLTableElement> & {
  className?: string;
};

// Custom Table Components
export const Table = ({ children, className = '', ...props }:TableProps) => (
  <table className={`w-full ${className}`} {...props}>
    {children}
  </table>
);

type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement> & {
  className?: string;
};
export const TableBody: React.FC<TableBodyProps> = ({
  children,
  className = "",
  ...props
}) => (
  <tbody className={className} {...props}>
    {children}
  </tbody>
);

type TableRowProps = React.HTMLAttributes<HTMLTableRowElement> & {
  className?: string;
};
export const TableRow: React.FC<TableRowProps> = ({
  children,
  className = "",
  ...props
}) => (
  <tr className={className} {...props}>
    {children}
  </tr>
);

type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement> & {
  className?: string;
};
export const TableHead: React.FC<TableHeadProps> = ({
  children,
  className = "",
  ...props
}) => (
  <th
    className={`px-6 py-3 text-left text-sm ${className}`}
    {...props}
  >
    {children}
  </th>
);

type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement> & {
  className?: string;
};
export const TableCell: React.FC<TableCellProps> = ({
  children,
  className = "",
  ...props
}) => (
  <td
    className={`px-6 py-3 text-sm ${className}`}
    {...props}
  >
    {children}
  </td>
);