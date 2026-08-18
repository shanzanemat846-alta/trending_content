import { useState } from 'react';
import PropTypes from 'prop-types';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
// @mui
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
// routes
import { useRouter } from 'src/routes/hooks';
// components
import Iconify from 'src/components/iconify';
import SearchNotFound from 'src/components/search-not-found';

// ----------------------------------------------------------------------

export default function ProductSearch({ query, results, onSearch, hrefItem, loading }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleSelect = (product) => {
    if (!product?.id) return;
    router.push(hrefItem(product.id));
    setOpen(false);
  };

  const handleKeyUp = (event) => {
    if (event.key === 'Enter' && query) {
      const selectItem = results.find((product) => product.name === query);
      if (selectItem) {
        handleSelect(selectItem);
      }
    }
  };

  return (
    <Autocomplete
      sx={{ width: { xs: 1, sm: 260 } }}
      loading={loading}
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
      getOptionLabel={(option) => option.name}
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
            endAdornment: (
              <>
                {loading ? <Iconify icon="svg-spinners:8-dots-rotate" sx={{ mr: -3 }} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, product, { inputValue }) => {
        const matches = match(product.name, inputValue);
        const parts = parse(product.name, matches);

        return (
          <Box component="li" {...props} key={product.id}>
            <Avatar
              alt={product.name}
              src={product.coverUrl}
              variant="rounded"
              sx={{
                width: 48,
                height: 48,
                flexShrink: 0,
                mr: 1.5,
                borderRadius: 1,
              }}
            />

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

ProductSearch.propTypes = {
  hrefItem: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  onSearch: PropTypes.func.isRequired,
  query: PropTypes.string,
  results: PropTypes.array,
};
