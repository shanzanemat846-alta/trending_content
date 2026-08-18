import PropTypes from 'prop-types';
import { useState } from 'react';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
// @mui
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
// components
import Iconify from 'src/components/iconify';
import SearchNotFound from 'src/components/search-not-found';

// ----------------------------------------------------------------------

export default function JobSearch({ query, results, onSearch, filteredCampaigns }) {
  const [open, setOpen] = useState(false);

  const handleSelect = (selectedJob) => {
    if (!selectedJob) return;
    filteredCampaigns([selectedJob]);
    setOpen(false);
  };

  const handleKeyUp = (event) => {
    if (event.key === 'Enter' && query) {
      const selectProduct = results.find((job) => job.title === query);
      if (selectProduct) {
        handleSelect(selectProduct);
      }
    }
  };

  return (
    <Autocomplete
      sx={{ width: { xs: 1, sm: 260 } }}
      autoHighlight
      popupIcon={null}
      options={results}
      open={open}
      onOpen={() => {
        if (query) {
          setOpen(true);
        }
      }}
      onClose={() => setOpen(false)}
      onInputChange={(event, newValue) => {
        onSearch(newValue);
        setOpen(newValue.length > 0);
      }}
      onChange={(event, value) => handleSelect(value)}
      getOptionLabel={(option) => option.title}
      noOptionsText={<SearchNotFound query={query} sx={{ bgcolor: 'unset' }} />}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      slotProps={{
        popper: {
          placement: 'bottom-start',
          sx: {
            minWidth: 320,
          },
        },
        paper: {
          sx: {
            [`.${autocompleteClasses.option}`]: {
              pl: 0.75,
            },
          },
        },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search..."
          onKeyUp={handleKeyUp}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ ml: 1, color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      )}
      renderOption={(props, job, { inputValue }) => {
        const matches = match(job.title, inputValue);
        const parts = parse(job.title, matches);

        return (
          <Box component="li" {...props} key={job.id}>
            <div>
              {parts.map((part, index) => (
                <Typography
                  key={index}
                  component="span"
                  color={part.highlight ? 'primary' : 'textPrimary'}
                  sx={{
                    typography: 'body2',
                    fontWeight: part.highlight ? 'fontWeightSemiBold' : 'fontWeightMedium',
                  }}
                >
                  {part.text}
                </Typography>
              ))}
            </div>
          </Box>
        );
      }}
    />
  );
}

JobSearch.propTypes = {
  filteredCampaigns: PropTypes.func,
  onSearch: PropTypes.func,
  query: PropTypes.string,
  results: PropTypes.array,
};
