import { useState } from 'react';
import PropTypes from 'prop-types';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
// @mui
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
// components
import Iconify from 'src/components/iconify';
import SearchNotFound from 'src/components/search-not-found';

// ----------------------------------------------------------------------

export default function PostSearch({ query, results, onSearch, filteredPrompts }) {
  const [open, setOpen] = useState(false);

  const handleSelect = (selectedPost) => {
    if (!selectedPost) return;
    filteredPrompts([selectedPost]);
    setOpen(false);
  };

  const handleKeyUp = (event) => {
    if (event.key === 'Enter' && query) {
      const selectPrompt = results.find((post) => 
        post.title.toLowerCase() === query.toLowerCase()
      );
      if (selectPrompt) {
        handleSelect(selectPrompt);
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
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      onInputChange={(event, newValue) => {
        onSearch(newValue);
        setOpen(newValue.length > 0);
      }}
      onChange={(event, value) => handleSelect(value)}
      getOptionLabel={(option) => option.title}
      noOptionsText={<SearchNotFound query={query} sx={{ bgcolor: 'unset' }} />}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      filterOptions={(options, state) => options} // Disable default filtering
      slotProps={{
        popper: {
          placement: 'bottom-start',
          sx: {
            minWidth: 320,
          },
        },
        paper: {
          sx: {
            [` .${autocompleteClasses.option}`]: {
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
      renderOption={(props, post, { inputValue }) => {
        const matches = match(post.title, inputValue);
        const parts = parse(post.title, matches);

        return (
          <Box component="li" {...props} key={post.id}>
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

PostSearch.propTypes = {
  filteredPrompts: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  query: PropTypes.string,
  results: PropTypes.array.isRequired,
};
