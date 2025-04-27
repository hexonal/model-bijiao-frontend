import React from 'react';
import { cn } from '../../utils/cn';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ className, children, ...props }) => {
  return (
    <div className="overflow-x-auto">
      <table
        className={cn("min-w-full divide-y divide-gray-200", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ className, children, ...props }) => {
  return (
    <thead className={cn("bg-gray-50", className)} {...props}>
      {children}
    </thead>
  );
};

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableBody: React.FC<TableBodyProps> = ({ className, children, ...props }) => {
  return (
    <tbody
      className={cn("divide-y divide-gray-200 bg-white", className)}
      {...props}
    >
      {children}
    </tbody>
  );
};

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
}

export const TableRow: React.FC<TableRowProps> = ({ className, children, ...props }) => {
  return (
    <tr
      className={cn("hover:bg-gray-50 transition-colors", className)}
      {...props}
    >
      {children}
    </tr>
  );
};

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export const TableHead: React.FC<TableHeadProps> = ({ className, children, ...props }) => {
  return (
    <th
      scope="col"
      className={cn(
        "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
};

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export const TableCell: React.FC<TableCellProps> = ({ className, children, ...props }) => {
  return (
    <td
      className={cn("px-6 py-4 whitespace-nowrap text-sm text-gray-500", className)}
      {...props}
    >
      {children}
    </td>
  );
};