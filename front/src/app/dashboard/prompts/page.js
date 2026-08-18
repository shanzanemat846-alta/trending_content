// sections
import { PostListView } from 'src/sections/prompt/view';
import { RoleBasedGuard } from 'src/auth/guard';
// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Post List',
};

export default function PostListPage() {
  return (
    <RoleBasedGuard hasContent roles = {["user", "admin"]} > 
      <PostListView />
    </RoleBasedGuard>
  )
}
