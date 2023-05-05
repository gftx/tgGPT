import { Configuration, OpenAIApi }  from 'openai';
import config from 'config';
import { createReadStream } from 'fs';

class OpenAi {
  roles = {
    ASSISTANT: 'assistant',
    USER: 'user',
    SYSTEM: 'system'
  }

  constructor(apiKey) {
    const configuration = new Configuration({
      apiKey: apiKey,
    });
    this.openai = new OpenAIApi(configuration);
  }

  async chat(messages) {
    try {
      const response = await this.openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages
      });

      return response.data.choices[0].message

    } catch (error) {
      console.error('error while chat', error.message)
    }
  }

  async transcription(mp3Path) {
    try {
      const response = await this.openai.createTranscription(
        createReadStream(mp3Path),
        'whisper-1'
      );
      return response.data.text;
    } catch (error) {
      console.error('error while transcription', error.message)
    }
  }
}

export const openai = new OpenAi(config.OPENAI_TOKEN);
