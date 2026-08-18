import PropTypes from 'prop-types';
// sections
import { JobCreateView } from 'src/sections/campaign/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Create a new campaign',
};

export default function JobCreatePage({ params }) {

  const { id } = params;

  return <JobCreateView id={id} />;
}

JobCreatePage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};