import PropTypes from 'prop-types';
// sections
import { PostListView } from 'src/sections/store/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Content List',
};

export default function PostListPage( { params }) {
  
  const { id } = params;
  
  return <PostListView id={id}/>;
}

PostListPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};