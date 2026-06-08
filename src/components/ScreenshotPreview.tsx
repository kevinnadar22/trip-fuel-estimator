import { Box, IconButton } from '@mui/material';
import { X } from 'lucide-react';

interface ScreenshotPreviewProps {
  url: string;
  onClear: () => void;
}

export function ScreenshotPreview({ url, onClear }: ScreenshotPreviewProps) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-block', width: '100%', textAlign: 'center' }}>
      <img
        src={url}
        alt="Ride Screenshot"
        style={{ maxHeight: '180px', maxWidth: '100%', borderRadius: '10px', display: 'block', margin: '0 auto' }}
      />
      <IconButton
        size="small"
        onClick={onClear}
        sx={{
          position: 'absolute', top: 4, right: 4,
          bgcolor: 'rgba(0,0,0,0.55)', color: '#fff',
          width: 22, height: 22,
          '&:hover': { bgcolor: 'rgba(0,0,0,0.80)' },
        }}
      >
        <X size={12} />
      </IconButton>
    </Box>
  );
}
