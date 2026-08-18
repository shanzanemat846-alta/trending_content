import PropTypes from 'prop-types';
// sections
import { JobListView } from 'src/sections/campaign/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Campaign List',
};

export default function JobListPage({ params }) {
  
  const { id } = params;

  return <JobListView id={id} />;
}

JobListPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};