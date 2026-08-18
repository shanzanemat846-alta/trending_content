import PropTypes from 'prop-types';
// sections
import { ChatView } from 'src/sections/chat/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: Project ChatGPT',
};

export default function ChatPage({ params }) {
  
  const { id } = params;
  
  return <ChatView id = {id} />;
}

ChatPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};