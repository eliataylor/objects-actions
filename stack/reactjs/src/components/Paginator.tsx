import React, { useEffect, useState } from 'react';
import { MenuItem, Pagination } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import InputLabel from '@mui/material/InputLabel';
import Grid from '@mui/material/Grid';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

interface PaginatorProps {
  totalItems: number;
  defaultPageSize?: number;
}

const Paginator: React.FC<PaginatorProps> = ({
  totalItems = 15,
  defaultPageSize = 15,
}) => {
  const navigate = useNavigate();
  const query = useQuery();

  const [page, setPage] = useState<number>(() => {
    const pageParam = query.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
  });

  const [pageSize, setPageSize] = useState<number>(() => {
    const pageSizeParam = query.get('page_size');
    return pageSizeParam ? parseInt(pageSizeParam, 10) : defaultPageSize;
  });

  const totalPages = Math.ceil(totalItems / pageSize);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('page_size', pageSize.toString());
    navigate({ search: params.toString() });
  }, [page, pageSize, navigate]);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setPage(value);
  };

  const handlePageSizeChange = (event: SelectChangeEvent<typeof pageSize>) => {
    setPageSize(parseInt(event.target.value as string, 10));
    setPage(1); // Reset to the first page whenever page size changes
  };

  return (
    <Grid container justifyContent={'space-between'}>
      <Grid item>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          shape="rounded"
          showFirstButton
          showLastButton
        />
      </Grid>
      <Grid item>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="page-size-select-label">Page Size</InputLabel>
          <Select
            labelId="page-size-select-label"
            id="page-size-select"
            value={pageSize}
            onChange={handlePageSizeChange}
            label="Page Size"
          >
            <MenuItem value={15}>15 of {totalItems}</MenuItem>
            <MenuItem value={25}>25 of {totalItems}</MenuItem>
            <MenuItem value={50}>50 of {totalItems}</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default Paginator;
