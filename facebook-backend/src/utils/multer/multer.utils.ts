import { Request } from 'express';
import { memoryStorage } from 'multer';

interface GetMulterMediaOptionsArgs {
  fileSize?: number; // File size limit in MB (optional)
  fileExtensions: string[]; // Base allowed file extensions
  addedFileExtensions?: string[]; // Extensions to add to the allowed list
  removedFileExtensions?: string[]; // Extensions to remove from the allowed list
}

function getMulterMediaOptions({
  fileSize = 50, // Default file size limit to 50 MB
  fileExtensions,
  addedFileExtensions = [],
  removedFileExtensions = [],
}: GetMulterMediaOptionsArgs) {
  if (!Array.isArray(fileExtensions) || fileExtensions.length === 0) {
    throw new Error('fileExtensions must be a non-empty array.');
  }

  return {
    storage: memoryStorage(),

    limits: {
      fileSize: fileSize * 1024 * 1024, // Convert MB to bytes
    },

    fileFilter: (
      req: Request,
      file: Express.Multer.File,
      callback: (error: Error | null, acceptFile: boolean) => void,
    ) => {
      try {
        // Ensure valid mimetype is provided
        if (!file || !file.mimetype) {
          return callback(
            new Error(
              'Invalid file or missing mimetype. Please upload a valid file.',
            ),
            false,
          );
        }

        // Derive the current file extension from the mimetype
        const fileExt = file.mimetype.split('/')[1];

        if (!fileExt) {
          return callback(
            new Error('Unable to extract file extension from the mimetype.'),
            false,
          );
        }

        // Merge and filter allowed extensions
        let allowedExtensions = Array.from(
          new Set([
            ...fileExtensions,
            ...addedFileExtensions.filter((ext) => typeof ext === 'string'),
          ]),
        );

        // Remove any unwanted extensions
        removedFileExtensions.forEach((ext) => {
          allowedExtensions = allowedExtensions.filter(
            (allowedExt) => allowedExt !== ext,
          );
        });

        // Log allowed extensions for debugging

        // Check if the file extension is allowed
        if (allowedExtensions.includes(fileExt)) {
          callback(null, true);
        } else {
          callback(
            new Error(
              `Invalid file type. Allowed types are: ${allowedExtensions.join(', ')}.`,
            ),
            false,
          );
        }
      } catch (error) {
        console.log({ error });

        callback(
          new Error(
            'An error occurred during file validation. Please try again.',
          ),
          false,
        );
      }
    },
  };
}

interface GetMulterCSVOptionsArgs {
  fileSize?: number; // Max file size in MB (default 50MB)
}

function getMulterCSVOptions({ fileSize = 50 }: GetMulterCSVOptionsArgs) {
  return {
    // Define memory storage for the file (you could also use diskStorage if needed)
    storage: memoryStorage(),

    // File size limit in bytes (convert MB to bytes)
    limits: {
      fileSize: fileSize * 1024 * 1024, // Convert MB to bytes
    },

    // File filter function to validate CSV files
    fileFilter: (
      req: Request,
      file: Express.Multer.File,
      callback: (error: Error | null, acceptFile: boolean) => void,
    ) => {
      try {
        if (!file || !file.mimetype) {
          return callback(
            new Error(
              'Invalid file or missing mimetype. Please upload a valid file.',
            ),
            false,
          );
        }

        // Validate the mimetype to ensure it's a CSV file
        const isCsv =
          file.mimetype === 'text/csv' ||
          file.mimetype === 'application/vnd.ms-excel';

        if (!isCsv) {
          return callback(
            new Error('Invalid file type. Only CSV files are allowed.'),
            false,
          );
        }

        // Proceed if file is a CSV
        callback(null, true);
      } catch (error) {
        console.log({ error });

        callback(
          new Error(
            'An error occurred during file validation. Please try again.',
          ),
          false,
        );
      }
    },
  };
}

export { getMulterMediaOptions, getMulterCSVOptions };
