import React, { useState, useMemo, useCallback } from "react";
import styles from "./data-table.module.css";

interface Column<T> {
  id: string;
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  pageSize?: number;
  searchable?: boolean;
  selectable?: boolean;
  onRowClick?: (item: T) => void;
  onSelectionChange?: (selectedItems: T[]) => void;
  getRowId?: (item: T) => string;
}

type SortDirection = "asc" | "desc" | null;

/**
 * Data Table Pattern
 *
 * Features:
 * - Sorting by column
 * - Pagination
 * - Search/filtering
 * - Row selection
 * - Loading states
 * - Empty states
 * - Responsive design
 * - Keyboard navigation
 * - Screen reader support
 */
export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  isLoading = false,
  error = null,
  emptyMessage = "No data available",
  pageSize = 10,
  searchable = true,
  selectable = false,
  onRowClick,
  onSelectionChange,
  getRowId = (item) => item.id,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();
    return data.filter((item) => {
      return columns.some((column) => {
        const value =
          typeof column.accessor === "function"
            ? column.accessor(item)
            : item[column.accessor];

        return String(value).toLowerCase().includes(query);
      });
    });
  }, [data, searchQuery, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData;

    const column = columns.find((col) => col.id === sortColumn);
    if (!column) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue =
        typeof column.accessor === "function"
          ? column.accessor(a)
          : a[column.accessor];
      const bValue =
        typeof column.accessor === "function"
          ? column.accessor(b)
          : b[column.accessor];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection, columns]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const start = currentPage * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Handle sorting
  const handleSort = (columnId: string) => {
    if (!columns.find((col) => col.id === columnId)?.sortable) return;

    if (sortColumn === columnId) {
      setSortDirection((current) => {
        if (current === "asc") return "desc";
        if (current === "desc") return null;
        return "asc";
      });
    } else {
      setSortColumn(columnId);
      setSortDirection("asc");
    }
    setCurrentPage(0); // Reset to first page when sorting
  };

  // Handle row selection
  const handleRowSelect = useCallback(
    (rowId: string) => {
      setSelectedRows((prev) => {
        const next = new Set(prev);
        if (next.has(rowId)) {
          next.delete(rowId);
        } else {
          next.add(rowId);
        }

        if (onSelectionChange) {
          const selectedItems = data.filter((item) => next.has(getRowId(item)));
          onSelectionChange(selectedItems);
        }

        return next;
      });
    },
    [data, getRowId, onSelectionChange],
  );

  const handleSelectAll = useCallback(() => {
    if (selectedRows.size === paginatedData.length) {
      // Deselect all on current page
      const pageRowIds = new Set(paginatedData.map(getRowId));
      setSelectedRows((prev) => {
        const next = new Set(prev);
        pageRowIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      // Select all on current page
      const pageRowIds = paginatedData.map(getRowId);
      setSelectedRows((prev) => new Set([...prev, ...pageRowIds]));
    }

    if (onSelectionChange) {
      const selectedItems = data.filter((item) =>
        selectedRows.has(getRowId(item)),
      );
      onSelectionChange(selectedItems);
    }
  }, [paginatedData, selectedRows, data, getRowId, onSelectionChange]);

  // Reset page when search changes
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(0);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} aria-label="Loading data..." />
        <p>Loading data...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.errorContainer} role="alert">
        <p>{error}</p>
      </div>
    );
  }

  const getSortIcon = (columnId: string) => {
    if (sortColumn !== columnId) return "↕️";
    if (sortDirection === "asc") return "↑";
    if (sortDirection === "desc") return "↓";
    return "↕️";
  };

  const allPageRowsSelected =
    paginatedData.length > 0 &&
    paginatedData.every((item) => selectedRows.has(getRowId(item)));

  return (
    <div className={styles.container}>
      {/* Search Bar */}
      {searchable && (
        <div className={styles.searchContainer}>
          <label htmlFor="table-search" className={styles.srOnly}>
            Search table
          </label>
          <input
            id="table-search"
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className={styles.searchInput}
            aria-label="Search table data"
          />
        </div>
      )}

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table} role="table">
          <thead>
            <tr role="row">
              {selectable && (
                <th role="columnheader" className={styles.checkboxColumn}>
                  <input
                    type="checkbox"
                    checked={allPageRowsSelected}
                    onChange={handleSelectAll}
                    aria-label="Select all rows on this page"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.id}
                  role="columnheader"
                  style={{
                    width: column.width,
                    textAlign: column.align || "left",
                  }}
                  className={column.sortable ? styles.sortable : ""}
                  onClick={() => handleSort(column.id)}
                  aria-sort={
                    sortColumn === column.id
                      ? sortDirection === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <span className={styles.headerContent}>
                    {column.header}
                    {column.sortable && (
                      <span className={styles.sortIcon} aria-hidden="true">
                        {getSortIcon(column.id)}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className={styles.emptyMessage}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => {
                const rowId = getRowId(item);
                const isSelected = selectedRows.has(rowId);

                return (
                  <tr
                    key={rowId}
                    role="row"
                    className={`
                      ${onRowClick ? styles.clickableRow : ""}
                      ${isSelected ? styles.selectedRow : ""}
                    `}
                    onClick={() => onRowClick?.(item)}
                    tabIndex={onRowClick ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (onRowClick && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        onRowClick(item);
                      }
                    }}
                    aria-rowindex={currentPage * pageSize + index + 2}
                  >
                    {selectable && (
                      <td role="cell" className={styles.checkboxColumn}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleRowSelect(rowId)}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Select row ${index + 1}`}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.id}
                        role="cell"
                        style={{ textAlign: column.align || "left" }}
                      >
                        {typeof column.accessor === "function"
                          ? column.accessor(item)
                          : item[column.accessor]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <div className={styles.pageInfo}>
            Showing {currentPage * pageSize + 1} to{" "}
            {Math.min((currentPage + 1) * pageSize, sortedData.length)} of{" "}
            {sortedData.length} results
          </div>

          <nav className={styles.pageControls} aria-label="Table pagination">
            <button
              onClick={() => setCurrentPage(0)}
              disabled={currentPage === 0}
              className={styles.pageButton}
              aria-label="Go to first page"
            >
              First
            </button>

            <button
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={currentPage === 0}
              className={styles.pageButton}
              aria-label="Go to previous page"
            >
              Previous
            </button>

            <span className={styles.currentPage}>
              Page {currentPage + 1} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage >= totalPages - 1}
              className={styles.pageButton}
              aria-label="Go to next page"
            >
              Next
            </button>

            <button
              onClick={() => setCurrentPage(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
              className={styles.pageButton}
              aria-label="Go to last page"
            >
              Last
            </button>
          </nav>
        </div>
      )}

      {/* Selection info */}
      {selectable && selectedRows.size > 0 && (
        <div className={styles.selectionInfo} role="status" aria-live="polite">
          {selectedRows.size} row{selectedRows.size !== 1 ? "s" : ""} selected
        </div>
      )}
    </div>
  );
}

// Example usage
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  status: "active" | "inactive";
}

export const UserTableExample: React.FC = () => {
  const users: User[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "Admin",
      createdAt: new Date("2023-01-15"),
      status: "active",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "User",
      createdAt: new Date("2023-02-20"),
      status: "active",
    },
    {
      id: "3",
      name: "Bob Johnson",
      email: "bob@example.com",
      role: "User",
      createdAt: new Date("2023-03-10"),
      status: "inactive",
    },
    // ... more users
  ];

  const columns: Column<User>[] = [
    {
      id: "name",
      header: "Name",
      accessor: "name",
      sortable: true,
    },
    {
      id: "email",
      header: "Email",
      accessor: "email",
      sortable: true,
    },
    {
      id: "role",
      header: "Role",
      accessor: "role",
      sortable: true,
      width: "120px",
    },
    {
      id: "status",
      header: "Status",
      accessor: (user) => (
        <span className={`${styles.badge} ${styles[`badge-${user.status}`]}`}>
          {user.status}
        </span>
      ),
      sortable: true,
      width: "100px",
      align: "center",
    },
    {
      id: "createdAt",
      header: "Created",
      accessor: (user) => user.createdAt.toLocaleDateString(),
      sortable: true,
      width: "120px",
    },
  ];

  return (
    <DataTable
      data={users}
      columns={columns}
      pageSize={5}
      searchable
      selectable
      onRowClick={(user) => console.log("Clicked:", user)}
      onSelectionChange={(selected) => console.log("Selected:", selected)}
    />
  );
};
