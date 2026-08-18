// sections
import { UserCardsView } from 'src/sections/user/view';
import { RoleBasedGuard } from 'src/auth/guard';
// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: User Cards',
};

export default function UserCardsPage() {
  return (
    <RoleBasedGuard hasContent roles = {["admin"]} > 
      <UserCardsView />;
    </RoleBasedGuard>
  );
}
