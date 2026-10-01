import fs from 'fs';
import path from 'path';

export interface UploadedFileInfo {
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  filePath: string;
  publicUrl: string;
}

export class StorageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  getPublicUrl(fileName: string): string {
    return `/uploads/${fileName}`;
  }

  saveBuffer(buffer: Buffer, originalName: string, mimeType: string): UploadedFileInfo {
    // Sanitize filename
    const sanitized = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = path.extname(sanitized).toLowerCase();
    const basename = path.basename(sanitized, ext);
    const uniqueName = `${Date.now()}_${basename.slice(0, 30)}${ext}`;
    const destination = path.join(this.uploadDir, uniqueName);

    fs.writeFileSync(destination, buffer);

    return {
      fileName: uniqueName,
      originalName,
      mimeType,
      size: buffer.length,
      filePath: destination,
      publicUrl: this.getPublicUrl(uniqueName),
    };
  }

  deleteFile(fileName: string): boolean {
    const destination = path.join(this.uploadDir, fileName);
    if (fs.existsSync(destination)) {
      fs.unlinkSync(destination);
      return true;
    }
    return false;
  }
}

export const storageService = new StorageService();
