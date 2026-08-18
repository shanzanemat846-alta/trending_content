import PropTypes from 'prop-types';
// sections
import { PostEditView } from 'src/sections/prompt/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Post Edit',
};

export default function PostEditPage({ params }) {
  const { id } = params;
  return <PostEditView id={id} />;
}

PostEditPage.propTypes = {
  params: PropTypes.shape({
  id: PropTypes.string,
  }),
};
