import { useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { UploadCloud } from 'lucide-react';
import { COLORS } from '../theme';

interface UploadZoneProps {
  onFile: (file: File) => void;
}

export function UploadZone({ onFile }: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    </Box>
  );
}
