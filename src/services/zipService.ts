import JSZip from 'jszip';

export interface ZipItem {
  name: string;
  blob: Blob;
}

export const createAndDownloadZip = async (
  items: ZipItem[],
  archiveName: string = `aetherpix-batch-${Date.now()}.zip`
): Promise<void> => {
  if (!items || items.length === 0) return;

  const zip = new JSZip();

  items.forEach((item) => {
    zip.file(item.name, item.blob);
  });

  const content = await zip.generateAsync({ type: 'blob' });

  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = archiveName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
