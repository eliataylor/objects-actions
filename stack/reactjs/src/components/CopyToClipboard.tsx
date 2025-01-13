import React from 'react';
import { IconButton } from '@mui/material';
import { useSnackbar } from 'notistack';

interface CopyToClipboardProps {
  textToCopy: string;
  copiedMessage?: string;
  children: React.ReactNode;
}

const CopyToClipboard: React.FC<CopyToClipboardProps> = ({
  textToCopy,
  children,
  copiedMessage = 'Copied to clipboard'
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const handleCopy = async () => {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        enqueueSnackbar(copiedMessage, { variant: 'success' });
      } catch (error) {
        console.error('Failed to copy text: ', error);
        enqueueSnackbar('Failed to copy text', { variant: 'error' });
      }
    } else {
      alert(
        'Clipboard API is not available. Please copy manually: ' + textToCopy,
      );
    }
  };

  return (
    <IconButton
      color="primary"
      aria-label="copy to clipboard"
      onClick={handleCopy}
    >
      {children}
    </IconButton>
  );
};

export default CopyToClipboard;
