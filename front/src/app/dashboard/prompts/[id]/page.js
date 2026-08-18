import PropTypes from 'prop-types';
// utils
// import { paramCase } from 'src/utils/change-case';
// import axios, { endpoints } from 'src/utils/axios';
// sections
import { PostDetailsView } from 'src/sections/prompt/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Post Details',
};

export default function PostDetailsPage({ params }) {
  const { id } = params;

  return <PostDetailsView id={id} />;
}

// export async function generateStaticParams() {
//   const res = await axios.get(endpoints.post.list);

//   return res.data.posts.map((post) => ({
//     title: paramCase(post.title),
//   }));
// }

PostDetailsPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};
