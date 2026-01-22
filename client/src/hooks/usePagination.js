import { useState, useMemo } from 'react';

const usePagination = (data = [], initialRowsPerPage = 100) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const paginatedData = useMemo(() => {
    if (rowsPerPage === -1) {
      // Show all data when rowsPerPage is -1
      return data;
    }
    const startIndex = currentPage * rowsPerPage;
    return data.slice(startIndex, startIndex + rowsPerPage);
  }, [data, currentPage, rowsPerPage]);

  const totalPages = useMemo(() => {
    if (rowsPerPage === -1) {
      return 1; // Only one page when showing all data
    }
    return Math.ceil(data.length / rowsPerPage);
  }, [data, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const value = event.target.value;
    const newRowsPerPage = value === 'all' ? -1 : parseInt(value, 10);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(0); // Reset to first page when changing rows per page
  };

  const resetPagination = () => {
    setCurrentPage(0);
  };

  return {
    paginatedData,
    currentPage,
    totalPages,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    resetPagination,
  };
};

export default usePagination;