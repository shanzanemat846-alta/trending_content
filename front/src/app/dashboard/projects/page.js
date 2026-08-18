// sections
import { TourListView } from 'src/sections/project/view';
import { RoleBasedGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Projects List',
};

export default function TourListPage() {
  return (
    <RoleBasedGuard hasContent roles = {["user"]} > 
      <TourListView />
    </RoleBasedGuard>
  )
}
