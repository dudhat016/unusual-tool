import { useEffect } from 'react';

export const useClipboardPaste = (onFilesPasted: (files: File[]) => void, enabled: boolean = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const pastedFiles: File[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            // Rename pasted file with timestamp
            const extension = file.type.split('/')[1] || 'png';
            const renamedFile = new File(
              [file],
              `pasted-image-${Date.now()}.${extension}`,
              { type: file.type }
            );
            pastedFiles.push(renamedFile);
          }
        }
      }

      if (pastedFiles.length > 0) {
        e.preventDefault();
        onFilesPasted(pastedFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [onFilesPasted, enabled]);
};
