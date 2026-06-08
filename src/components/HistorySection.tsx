import { useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, Modal, Fade, Backdrop, Stack, IconButton } from '@mui/material';
import { History, X } from 'lucide-react';
import { COLORS } from '../theme';
import type { HistoryEntry } from '../types';

const MAX_HISTORY_VISIBLE = 3;

function HistoryListItem({ item, onClick }: { item: HistoryEntry; onClick: () => void }) {
  return (
    <ListItem
      onClick={onClick}
      sx={{
        py: 0.5, px: 1.25, cursor: 'pointer',
        transition: 'background 0.15s',
        '&:hover': { bgcolor: COLORS.tagBg },
      }}
    >
      <ListItemText
        primary={`${item.startLocation} → ${item.destination}`}
        secondary={`${item.distanceKm} km · ${item.date}`}
        slotProps={{
          primary: { style: { fontSize: '0.75rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
          secondary: { style: { fontSize: '0.65rem' } },
        }}
        sx={{ overflow: 'hidden', mr: 1 }}
      />
      <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: COLORS.accent, whiteSpace: 'nowrap', flexShrink: 0 }}>
        {item.currency}{item.actualFuelCost.toFixed(2)}
      </Typography>
    </ListItem>
  );
}

function TripDetailModal({ item, onClose }: { item: HistoryEntry | null; onClose: () => void }) {
  const detailRows = item ? [
    { label: 'From',     value: item.startLocation },
    { label: 'To',       value: item.destination },
    { label: 'Distance', value: `${item.distanceKm} km` },
    { label: 'Date',     value: item.date },
  ] : [];

  return (
    <Modal
      open={!!item}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 200, sx: { bgcolor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' } } }}
    >
      <Fade in={!!item}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', outline: 'none', width: '85vw', maxWidth: 360 }}>
          {item && (
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${COLORS.border}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Trip Details</Typography>
                <IconButton size="small" onClick={onClose} sx={{ bgcolor: COLORS.tagBg, width: 28, height: 28 }}>
                  <X size={14} />
                </IconButton>
              </Box>

              <Stack spacing={0.9} divider={<Divider />}>
                {detailRows.map((row) => (
                  <Box key={row.label} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Typography color="text.secondary" sx={{ fontSize: '0.82rem', minWidth: 72, flexShrink: 0 }}>{row.label}</Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', flex: 1, textAlign: 'right' }}>{row.value}</Typography>
                  </Box>
                ))}
              </Stack>

              <Box sx={{ mt: 2, pt: 2, borderTop: `2px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.88rem' }}>Fuel Cost</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: COLORS.accent, letterSpacing: '-0.03em' }}>
                  {item.currency}{item.actualFuelCost.toFixed(2)}
                </Typography>
              </Box>
            </Paper>
          )}
        </Box>
      </Fade>
    </Modal>
  );
}

interface HistorySectionProps {
  history: HistoryEntry[];
}

export function HistorySection({ history }: HistorySectionProps) {
  const [selectedItem, setSelectedItem] = useState<HistoryEntry | null>(null);

  if (history.length === 0) return null;

  return (
    <>
      <Box sx={{ mt: 1.5 }}>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: COLORS.textMuted, display: 'flex', alignItems: 'center', gap: 0.4, mb: 0.75 }}>
          <History size={12} /> Recent
        </Typography>
        <Paper sx={{ borderRadius: 2, overflow: 'hidden', border: `1px solid ${COLORS.border}`, bgcolor: COLORS.surface }}>
          <List disablePadding>
            {history.slice(0, MAX_HISTORY_VISIBLE).map((item, index) => (
              <Box key={item.id}>
                {index > 0 && <Divider />}
                <HistoryListItem item={item} onClick={() => setSelectedItem(item)} />
              </Box>
            ))}
          </List>
        </Paper>
      </Box>

      <TripDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </>
  );
}
