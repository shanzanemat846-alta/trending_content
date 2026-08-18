import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import Switch from '@mui/material/Switch';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function SwitchesGroup({
  showAllThreads,
  setShowAllThreads
}) {
  return (
    <FormControl sx={{display: {
            xs: 'none',
            sm: 'block'
          }}} component="fieldset" variant="standard">
      <FormGroup>
        <Stack display="flex" border="1px solid #00A76F" flexDirection="row" alignItems="center" sx={{padding: "2px 8px", justifyContent: {xs: 'center', sm: 'flex-start'}, width: {xs: '80vw', sm: 'auto'}, borderRadius: '8px'}}>
          <Typography color="primary" fontWeight="bold" sx={{ fontSize: {xs: 13, sm: 16}}}>All Threads</Typography>
          <Switch
            checked={showAllThreads}
            onChange={() => setShowAllThreads(!showAllThreads)}
            name="toggle"
          />
          <Typography color="primary" fontWeight="bold" sx={{ fontSize: {xs: 13, sm: 16}}}>Save Threads</Typography>
        </Stack>
      </FormGroup>
    </FormControl>
  );
}
