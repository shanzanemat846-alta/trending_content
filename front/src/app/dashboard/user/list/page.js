// sections
import { RoleBasedGuard } from 'src/auth/guard';
import { UserListView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: User List',
};

export default function UserListPage() {
  return (
    <RoleBasedGuard hasContent roles = {["admin"]} > 
      <UserListView />
    </RoleBasedGuard>
  );
}
