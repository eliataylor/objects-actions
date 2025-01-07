import React, { useEffect, useState } from 'react';
import { TablePagination } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

interface PaginatorProps {
  totalItems: number;
  onPageChange: (page: number, pageSize: number) => void;
}

const TablePaginator: React.FC<PaginatorProps> = ({
  onPageChange,
  totalItems,
}) => {
  const navigate = useNavigate();
  const query = useQuery();

  const [page, setPage] = useState<number>(() => {
    const pageParam = query.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
  });

  const [pageSize, setPageSize] = useState<number>(() => {
    const pageSizeParam = query.get('page_size');
    return pageSizeParam ? parseInt(pageSizeParam, 10) : 10;
  });

  useEffect(() => {
    onPageChange(page, pageSize);
  }, [page, pageSize]);

  const handlePageChange = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    value: number,
  ) => {
    setPage(value);
  };

  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const newPageSize = parseInt(event.target.value, 10);
    setPageSize(newPageSize);
    setPage(1); // Reset to the first page whenever page size changes
  };

  return (
    <TablePagination
      component="div"
      count={totalItems}
      page={page - 1}
      onPageChange={(event, newPage) => handlePageChange(event, newPage + 1)}
      rowsPerPage={pageSize}
      onRowsPerPageChange={handlePageSizeChange}
      rowsPerPageOptions={[5, 15, 25, 50]}
    />
  );
};

export default TablePaginator;
