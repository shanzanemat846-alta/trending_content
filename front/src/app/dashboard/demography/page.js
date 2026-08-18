// sections
import Demography from 'src/sections/demography/view';
import { RoleBasedGuard } from 'src/auth/guard';
// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Demography',
};

export default function DemographicsPage() {
  return (
    <RoleBasedGuard hasContent roles = {["admin"]} > 
     <Demography />
    </RoleBasedGuard>
  )
}