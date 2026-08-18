import PropTypes from 'prop-types';
// sections
import { JobEditView } from 'src/sections/campaign/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Campaign Edit',
};

export default function JobEditPage({ params }) {
  const { id } = params;

  return <JobEditView id={id} />;
}


JobEditPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};
