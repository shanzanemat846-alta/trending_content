import PropTypes from 'prop-types';
// sections
import { PostDetailsView } from 'src/sections/store/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Post Details',
};

export default function PostDetailsPage({ params }) {
  const { id } = params;

  return <PostDetailsView id={id} />;
}


PostDetailsPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};
