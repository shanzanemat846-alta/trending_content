import { List, ListItem, ListItemButton, ListItemText } from '@mui/material'

export default function ThreadList({ threads, selectedThreadId, onSelectThread }) {
  return (
    <List>
      {threads.map((thread) => (
        <ListItem key={thread.threadId} disablePadding>
          <ListItemButton 
            selected={thread.threadId === selectedThreadId}
            onClick={() => onSelectThread(thread.threadId)}
          >
            <ListItemText primary={thread.title} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  )
}

