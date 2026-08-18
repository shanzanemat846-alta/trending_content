// sections
import { UserCreateView } from 'src/sections/user/view';
import { RoleBasedGuard } from 'src/auth/guard';
// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Create a new user',
};

export default function UserCreatePage() {
  return (
    <RoleBasedGuard hasContent roles = {["admin"]} > 
      <UserCreateView />
    </RoleBasedGuard>
  );
}
