import PropTypes from 'prop-types';
// _mock

// sections
import { ProductListView } from 'src/sections/thread/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Project threads',
};

// export default function TourEditPage({ params }) {
//   const { id } = params;

//   return <TourEditView id={id} />;
// }

export default function ProductListPage({ params }) {
    const { id } = params;

  return <ProductListView  id={id} />;
}

ProductListPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};