import PropTypes from 'prop-types';

export const metadata = {
  title: 'Dashboard: User Profile',
};

export default function UserEditPage({ params }) {
  return (
    <h1>User View</h1>
  ) 
}

UserEditPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};
