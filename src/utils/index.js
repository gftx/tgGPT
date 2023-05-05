import { unlink } from 'fs/promises';

async function removeFile(path) {
  try {
    await unlink(path);
  } catch (error) {
    console.error('error while remove file', error.message);
  }
};

export { removeFile };