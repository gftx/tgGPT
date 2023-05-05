import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import installer from '@ffmpeg-installer/ffmpeg';
import { createWriteStream } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import { removeFile } from '../utils/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url))

class OggConverter {
  constructor() {
    ffmpeg.setFfmpegPath(installer.path);
  }

  toMp3(oggPath, output) {
    try {
      const hash = new Date().toISOString();
      const outputPath = resolve(dirname(oggPath), `${output}-${hash}.mp3`)
      return new Promise((resolve, reject) => {
        ffmpeg(oggPath)
          .inputOption('-t 30')
          .output(outputPath)
          .on('end', () => {
            resolve(outputPath);
            removeFile(oggPath);
          })
          .on('error', err => reject(err.message))
          .run()
      })

    } catch (error) {
      console.log('error while to mp3 method', error)
    }
  }

  async create(url, filename) {
    try {
      const hash = new Date().toISOString();
      const oggPath = resolve(__dirname, '../../voices', `${filename}-${hash}.ogg`)
      const response = await axios({
        method: 'get',
        url,
        responseType: 'stream'
      })
      return new Promise(resolve => {
        const stream = createWriteStream(oggPath)
        response.data.pipe(stream)
        stream.on('finish', () => resolve(oggPath))
      })
    } catch (error) {
      console.error('create error', error.message)
    }
  }
}

const ogg = new OggConverter();
export default ogg;