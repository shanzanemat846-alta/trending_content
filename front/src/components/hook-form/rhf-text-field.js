import PropTypes from 'prop-types';
import { useFormContext, Controller, useFormState } from 'react-hook-form';
// @mui
import TextField from "@mui/material/TextField"

// ----------------------------------------------------------------------

// export default function RHFTextField({ name, helperText, type, ...other }) {
//   const { control } = useFormContext();

//   return (
//     <Controller
//       name={name}
//       control={control}
//       render={({ field, fieldState: { error } }) => (
//         <TextField
//           {...field}
//           fullWidth
//           type={type}
//           value={type === 'number' && field.value === 0 ? '' : field.value}
//           onChange={(event) => {
//             if (type === 'number') {
//               field.onChange(Number(event.target.value));
//             } else {
//               field.onChange(event.target.value);
//             }
//           }}
//           error={!!error}
//           helperText={error ? error?.message : helperText}
//           {...other}
//         />
//       )}
//     />
//   );
// }
export default function RHFTextField({ name, helperText, type, ...other }) {
  const { control } = useFormContext();
  const { touchedFields, errors } = useFormState({ control });
    // console.log('isTouched:', touchedFields);
    // console.log('error:', errors);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          fullWidth
          type={type}
          value={type === 'number' && field.value === 0 ? '' : field.value}
          onChange={(event) => {
            const value = type === 'number'
              ? Number(event.target.value)
              : event.target.value;
            field.onChange(value);
          }}
          error={touchedFields[name] && !!errors[name]}
          helperText={touchedFields[name] && errors[name]?.message || helperText}
          {...other}
        />
      )}
    />
  )
}


RHFTextField.propTypes = {
  helperText: PropTypes.object,
  name: PropTypes.string,
  type: PropTypes.string,
  sx: PropTypes.object,
}
