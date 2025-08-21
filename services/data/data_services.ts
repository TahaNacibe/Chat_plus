// Download functions
  const downloadImage = async (raw_imageUrl: string, filename?: string) => {
      try {
    const corsProxy = "https://corsproxy.io/?";
    const imageUrl = corsProxy + encodeURIComponent(raw_imageUrl);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      // Fallback: open in new tab
      window.open(raw_imageUrl, '_blank');
    }
  };

  const downloadAllImages = async (images:string[]) => {
    for (let i = 0; i < images.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between downloads
      downloadImage(images[i], `image-${i + 1}.jpg`);
    }
};
  

const downloadJsonAsHiddenFile = (data: object, name: string) => {
  // Serialize the JSON with indentation
  const jsonString = JSON.stringify(data, null, 2);

  // Create a Blob from the string
  const blob = new Blob([jsonString], { type: "application/json" });

  // Create a download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  // Use .ch extension to "hide" the real content
  link.download = `${name}.ch`;
  link.href = url;

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}




export {downloadAllImages, downloadImage, downloadJsonAsHiddenFile}