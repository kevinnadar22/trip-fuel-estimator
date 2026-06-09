import { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { UploadCloud } from 'lucide-react';
import { COLORS } from '../theme';

interface UploadZoneProps {
  onFile: (file: File) => void;
}

function extractImageFromClipboard(e: ClipboardEvent): File | null {
  const items = Array.from(e.clipboardData?.items ?? []);
  const imageItem = items.find((item) => item.type.startsWith('image/'));
  return imageItem ? imageItem.getAsFile() : null;
}

export function UploadZone({ onFile }: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const file = extractImageFromClipboard(e);
      if (file) onFile(file);
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onFile]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) onFile(e.target.files[0]);
  };

  return (
    <Box
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      sx={{
        border: `2.5px dashed ${COLORS.accent}`,
        borderRadius: 2.5,
        background: `linear-gradient(160deg, ${COLORS.accentLight}60 0%, ${COLORS.surface} 100%)`,
        py: 3.5,
        px: 2,
        textAlign: 'center',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.2s ease',
        animation: 'uploadPulse 2.5s ease-in-out infinite',
        '@keyframes uploadPulse': {
          '0%, 100%': { boxShadow: `0 0 0 0px ${COLORS.accent}30` },
          '50%': { boxShadow: `0 0 0 6px ${COLORS.accent}18` },
        },
        '&:hover': {
          borderColor: COLORS.accentDark,
          background: `linear-gradient(160deg, ${COLORS.accentLight}90 0%, ${COLORS.accentLight}30 100%)`,
          boxShadow: `0 0 0 6px ${COLORS.accent}22 !important`,
          animation: 'none',
          transform: 'translateY(-1px)',
        },
        '&:active': { transform: 'translateY(0)' },
      }}
    >
      <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleFileChange} />

      <Box sx={{
        width: 52, height: 52, borderRadius: '50%',
        background: `linear-gradient(135deg, ${COLORS.accentLight}, ${COLORS.accent}40)`,
        border: `2px solid ${COLORS.accent}50`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        mx: 'auto', mb: 1.5,
        boxShadow: `0 0 0 6px ${COLORS.accent}12`,
      }}>
        <UploadCloud color={COLORS.accentDark} size={24} strokeWidth={2.5} />
      </Box>

      <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', mb: 0.3, color: COLORS.text }}>
        Drop your ride screenshot here
      </Typography>
      <Typography variant="caption" color="text.secondary">
        or{' '}
        <Box component="span" sx={{ color: COLORS.accent, fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 2 }}>
          tap to browse
        </Box>
        {'  ·  '}JPG, PNG, WEBP
      </Typography>

      {/* Paste hint */}
      <Box sx={{ mt: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.6 }}>
        <Box
          component="kbd"
          sx={{
            fontSize: '0.62rem', fontFamily: 'inherit', fontWeight: 600,
            px: 0.75, py: 0.25, borderRadius: 0.75,
            bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`,
            color: COLORS.textMuted, boxShadow: '0 1px 0 rgba(0,0,0,0.12)',
            lineHeight: 1.5,
          }}
        >
          Ctrl+V
        </Box>
        <Typography variant="caption" sx={{ color: COLORS.textMuted, fontSize: '0.68rem' }}>
          to paste from clipboard
        </Typography>
      </Box>
    </Box>
  );
}
