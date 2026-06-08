import { useState } from 'react';
import { Box, Typography, Modal, Fade, Backdrop, IconButton } from '@mui/material';
import { ZoomIn, X } from 'lucide-react';
import { COLORS } from '../theme';

const EXAMPLE_IMAGES = [
  { src: '/uber_example.jpg', label: 'Example 1' },
  { src: '/uber_example2.jpg', label: 'Example 2' },
];

function ThumbnailPreview({ src, index }: { src: string; index: number }) {
  return (
    <Box sx={{ position: 'relative', flexShrink: 0 }}>
      <img
        src={src}
        alt={`Example ${index + 1}`}
        style={{
          width: 32,
          height: 46,
          objectFit: 'cover',
          objectPosition: 'top',
          borderRadius: 6,
          display: 'block',
          border: `1px solid ${COLORS.border}`,
        }}
      />
      <Box sx={{
        position: 'absolute', inset: 0, borderRadius: '6px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        bgcolor: 'rgba(0,0,0,0.25)',
      }}>
        <ZoomIn size={10} color="#fff" />
      </Box>
    </Box>
  );
}

function LightboxImage({ src, label }: { src: string; label: string }) {
  return (
    <Box sx={{ position: 'relative' }}>
      <img src={src} alt={label} style={{ width: '100%', borderRadius: 10, display: 'block', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }} />
      <Box sx={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)',
        borderRadius: '0 0 10px 10px',
        px: 1, py: 0.75,
      }}>
        <Typography sx={{ color: '#fff', fontSize: '0.72rem', fontWeight: 600, textAlign: 'center' }}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

function LightboxModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 200, sx: { bgcolor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' } } }}
    >
      <Fade in={open}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          outline: 'none', width: '95vw', maxWidth: 640,
          maxHeight: '90vh', overflowY: 'auto', borderRadius: 3,
        }}>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              position: 'sticky', top: 8, float: 'right', mr: 1, mt: 1,
              bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', zIndex: 10,
              width: 28, height: 28, backdropFilter: 'blur(4px)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
            }}
          >
            <X size={14} />
          </IconButton>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, p: 1.5, pt: 0 }}>
            {EXAMPLE_IMAGES.map((ex) => (
              <LightboxImage key={ex.src} src={ex.src} label={ex.label} />
            ))}
          </Box>

          <Box sx={{
            mx: 1.5, mb: 1.5,
            bgcolor: COLORS.surface, borderRadius: 2, px: 1.5, py: 1,
            display: 'flex', alignItems: 'center', gap: 0.75,
            border: `1px solid ${COLORS.border}`,
          }}>
            <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: COLORS.accent, flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: COLORS.text, lineHeight: 1.5, fontSize: '0.75rem', fontWeight: 500 }}>
              Take a screenshot of your completed ride and upload it.
            </Typography>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
}

export function ExampleScreenshot() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Box
        onClick={() => setOpen(true)}
        sx={{
          display: 'flex', alignItems: 'center', gap: 1.5,
          bgcolor: COLORS.tagBg, border: `1px solid ${COLORS.border}`,
          borderRadius: 2, px: 1.5, py: 1,
          cursor: 'pointer', transition: 'all 0.15s ease',
          '&:hover': { borderColor: COLORS.accent, bgcolor: COLORS.accentLight },
        }}
      >
        {EXAMPLE_IMAGES.map((img, i) => (
          <ThumbnailPreview key={img.src} src={img.src} index={i} />
        ))}

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '0.78rem', color: COLORS.text, mb: 0.2 }}>
            See example screenshots
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', lineHeight: 1.4 }}>
            Upload a screenshot like these from Uber, Ola, or Rapido
          </Typography>
        </Box>

        <Typography sx={{ fontSize: '0.68rem', fontWeight: 500, color: COLORS.accent, whiteSpace: 'nowrap' }}>
          View →
        </Typography>
      </Box>

      <LightboxModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
