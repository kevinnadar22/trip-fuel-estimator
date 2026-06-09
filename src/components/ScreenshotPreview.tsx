import { useState } from 'react';
import { Box, IconButton, Dialog, DialogContent } from '@mui/material';
import { X, ZoomIn } from 'lucide-react';

interface ScreenshotPreviewProps {
  url: string;
  onClear: () => void;
}

export function ScreenshotPreview({ url, onClear }: ScreenshotPreviewProps) {
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ position: 'relative', display: 'inline-block', width: '100%', textAlign: 'center' }}>
      <Box 
        onClick={() => setOpen(true)}
        sx={{ 
          position: 'relative', 
          cursor: 'zoom-in', 
          display: 'inline-block',
          mx: 'auto',
          '&:hover .zoom-overlay': { opacity: 1 } 
        }}
      >
        <img
          src={url}
          alt="Ride Screenshot"
          style={{ maxHeight: '180px', maxWidth: '100%', borderRadius: '10px', display: 'block', margin: '0 auto' }}
        />
        <Box 
          className="zoom-overlay"
          sx={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            bgcolor: 'rgba(0,0,0,0.35)', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', opacity: 0, transition: 'opacity 0.2s ease-in-out'
          }}
        >
          <ZoomIn size={24} />
        </Box>
      </Box>

      <IconButton
        size="small"
        onClick={onClear}
        sx={{
          position: 'absolute', top: 4, right: 4, zIndex: 2,
          bgcolor: 'rgba(0,0,0,0.55)', color: '#fff',
          width: 22, height: 22,
          '&:hover': { bgcolor: 'rgba(0,0,0,0.80)' },
        }}
      >
        <X size={12} />
      </IconButton>

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        maxWidth="md"
        PaperProps={{
          sx: { bgcolor: 'transparent', boxShadow: 'none', overflow: 'hidden', m: 2 }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img
            src={url}
            alt="Full Screenshot"
            style={{ maxHeight: '90vh', maxWidth: '90vw', objectFit: 'contain', borderRadius: '8px' }}
          />
          <IconButton
            onClick={() => setOpen(false)}
            sx={{
              position: 'absolute', top: 12, right: 12,
              bgcolor: 'rgba(0,0,0,0.65)', color: '#fff',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.85)' }
            }}
          >
            <X size={20} />
          </IconButton>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
