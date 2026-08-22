export interface UploadOptions {
  onProgress?: (percent: number) => void;
}

export async function uploadToCloudinary(
  file: File,
  resourceType: "auto" | "image" | "video" | "raw" = "auto",
  options: UploadOptions = {}
): Promise<string> {
  const CLOUD_NAME = "sxe9lc5o";
  const UPLOAD_PRESET = "wcmeyhiw";

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`
    );

    // Real progress tracking
    if (options.onProgress) {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          options.onProgress!(pct);
        }
      });
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (!data.secure_url) {
            reject(new Error("Upload failed: no secure_url returned"));
            return;
          }
          resolve(data.secure_url);
        } catch (err) {
          reject(new Error("Invalid response from Cloudinary"));
        }
      } else {
        reject(new Error(`Cloudinary upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.ontimeout = () => reject(new Error("Upload timed out"));

    xhr.timeout = 60000; // 60 second timeout
    xhr.send(formData);
  });
}

/**
 * Convert any Cloudinary URL into a PDF-friendly URL that opens in a new tab.
 */
export function makePdfViewableUrl(url: string): string {
  if (!url) return url;
  const separator = url.includes("?") ? "&" : "?";
  if (url.includes("/raw/upload/") || url.toLowerCase().endsWith(".pdf")) {
    return `${url}${separator}fl_inline.attachment=false`;
  }
  return `${url}${separator}fl_attachment=false`;
}