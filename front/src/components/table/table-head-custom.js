import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
// @mui
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SwapVertIcon from '@mui/icons-material/SwapVert';

import { PLATFORMS, SORTING_COLUMNS_REDDIT, SORTING_COLUMNS_YOUTUBE } from 'src/utils/constants';

// ----------------------------------------------------------------------

export default function TableHeadCustom({
  order,
  orderBy,
  rowCount = 0,
  headLabel,
  numSelected = 0,
  onSort,
  onSelectAllRows,
  sx,
  platform,
  disabled = false
}) {
  // console.log('onSort', onSort);
  // console.log('headlabel', headLabel);
  // console.log('orderBy', orderBy);

  const [sortingColumns, setSortingColumns] = useState([]);

  useEffect(() => {
    if (platform === PLATFORMS.REDDIT) {
      setSortingColumns(SORTING_COLUMNS_REDDIT);
    } else if (platform === PLATFORMS.YOUTUBE) {
      setSortingColumns(SORTING_COLUMNS_YOUTUBE);
    } 
  }, [platform]);

  return (
    <TableHead sx={sx}>
      <TableRow>
        {onSelectAllRows && (
          <TableCell padding="checkbox">
            <Checkbox
              disabled={disabled}
              indeterminate={!!numSelected && numSelected < rowCount}
              checked={!!rowCount && numSelected === rowCount}
              onChange={(event) => onSelectAllRows(event.target.checked)}
            />
          </TableCell>
        )}

        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
            // sx={{ width: headCell.width, minWidth: headCell.minWidth }}
            sx={{
              width: headCell.width ? `${headCell.width}px` : '100px',
              minWidth: headCell.minWidth ? `${headCell.minWidth}px` : "100px",
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span>{headCell.label}</span>
              {sortingColumns.length && sortingColumns?.includes(headCell.label) ? 
                <button
                  type="button"
                  onClick={() => onSort(headCell.id)}
                  style={{
                    cursor: 'pointer',
                    marginLeft: '4px',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  aria-label={`Sort by ${headCell.label}`}
                >
                  {(() => {
                    if (orderBy === headCell.id) {
                      return order === 'asc' ? (
                        <ArrowUpwardIcon sx={{ fontSize: 20, marginTop: 0.4 }} />
                      ) : (
                        <ArrowDownwardIcon sx={{ fontSize: 20, marginTop: 0.4 }} />
                      );
                    }
                    return <SwapVertIcon />;
                  })()}
                </button>
              :  null
              }
            </div>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

TableHeadCustom.propTypes = {
  sx: PropTypes.object,
  onSort: PropTypes.func,
  orderBy: PropTypes.string,
  headLabel: PropTypes.array,
  rowCount: PropTypes.number,
  numSelected: PropTypes.number,
  onSelectAllRows: PropTypes.func,
  order: PropTypes.oneOf(['asc', 'desc']),
};
