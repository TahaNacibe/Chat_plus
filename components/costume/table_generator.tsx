'use client'

import * as React from "react"
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  getPaginationRowModel,
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

type Props = {
  headers: string[]
  rows: string[][]
}

export function DynamicTable({ headers, rows }: Props) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  // Build dynamic column definitions
  const columns: ColumnDef<any>[] = React.useMemo(() => {
    return headers.map((header) => ({
      accessorKey: header,
      header: header,
      cell: ({ row }) => row.getValue(header),
    }))
  }, [headers])

  // Convert rows into array of objects
  const data = React.useMemo(() => {
    return rows.map((row) =>
      headers.reduce((obj, key, index) => {
        obj[key] = row[index] ?? ""
        return obj
      }, {} as Record<string, string>)
    )
  }, [headers, rows])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="w-full overflow-x-auto border rounded-md bg-white text-black dark:text-white dark:bg-black py-4 px-1">
      <Table>
        <TableHeader className="bg-gray-700 dark:bg-gray-600">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="border border-gray-200 dark:border-gray-800">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-gray-100 dark:hover:bg-gray-900">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="border border-gray-200">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={headers.length} className="text-center h-24">
                No data found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Optional Pagination Controls */}
      <div className="flex items-center justify-end p-2 space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
