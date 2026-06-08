import { Box } from '@mui/material';
import { HistorySection } from './HistorySection';
import type { HistoryEntry } from '../types';

interface DesktopSidebarProps {
  history: HistoryEntry[];
}

export function DesktopSidebar({ history }: DesktopSidebarProps) {
  return (
    <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 2 }}>
      <HistorySection history={history} />
    </Box>
  );
}
