import PropTypes from 'prop-types';

import { EditUserProfileView } from 'src/sections/user-profile/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: User Profile Edit',
};

export default function UserEditPage({ params }) {
  const { id } = params;

  return (
    <>
      <EditUserProfileView id={id} />
    </>
  ) 
}

UserEditPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};
