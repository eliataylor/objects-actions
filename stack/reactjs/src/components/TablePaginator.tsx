import React, { useEffect, useState } from "react";
import { TablePagination } from "@mui/material";
import { useLocation } from "react-router-dom";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

interface PaginatorProps {
  totalItems: number;
  onPageChange: (limit: number, offset: number) => void;
}

const TablePaginator: React.FC<PaginatorProps> = ({
                                                    onPageChange,
                                                    totalItems
                                                  }) => {

  // TODO: pass defaults in rather than use search location
  const query = useQuery();

  const [offset, setOffset] = useState<number>(() => {
    const pageParam = query.get("offset");
    return pageParam ? parseInt(pageParam) : 0;
  });

  const [limit, setLimit] = useState<number>(() => {
    const pageSizeParam = query.get("limit");
    return pageSizeParam ? parseInt(pageSizeParam) : 10;
  });

  useEffect(() => {
    onPageChange(limit, offset);
  }, [offset, limit]);

  const handlePageChange = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    pageNum: number
  ) => {
    const offset = pageNum * limit;
    setOffset(offset); // Increment value to match 1-based offset index
  };

  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newPageSize = parseInt(event.target.value, 10);
    setLimit(newPageSize);
    setOffset(0); // reset to first item
  };

  return (
    <TablePagination
      component="div"
      count={totalItems}
      page={Math.floor(offset / limit)} // Adjust to zero-based index for MUI
      onPageChange={(event, newPage) => handlePageChange(event, newPage)}
      rowsPerPage={limit}
      onRowsPerPageChange={handlePageSizeChange}
      rowsPerPageOptions={[5, 10, 15, 25, 50]}
    />
  );
};

export default TablePaginator;
