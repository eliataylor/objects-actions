"use client";

import { TablePagination } from "@mui/material";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

interface TablePaginatorProps {
  totalItems: number;
  currentPage: number;
  rowsPerPage: number;
  onPageChange?: (page: number, rowsPerPage: number) => void;
}

export default function TablePaginator({
  totalItems,
  currentPage,
  rowsPerPage,
  onPageChange,
}: TablePaginatorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const handlePageChange = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    const offset = newPage * rowsPerPage;
    
    // Update URL with new offset
    router.push(pathname + "?" + createQueryString("offset", offset.toString()));
    
    // Call optional callback
    onPageChange?.(newPage, rowsPerPage);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    
    // Reset to first page when changing page size
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", newRowsPerPage.toString());
    params.delete("offset"); // Reset to first page
    
    router.push(pathname + "?" + params.toString());
    
    // Call optional callback
    onPageChange?.(0, newRowsPerPage);
  };

  return (
    <TablePagination
      component="div"
      count={totalItems}
      page={currentPage}
      onPageChange={handlePageChange}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={handleRowsPerPageChange}
      rowsPerPageOptions={[5, 10, 15, 25, 50]}
      showFirstButton
      showLastButton
    />
  );
} 