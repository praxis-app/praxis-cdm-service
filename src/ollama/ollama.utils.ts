// TODO: Remove test utils once no longer needed for testing

import ollama from 'ollama';

export const testOllama = async () => {
  // Test ollama
  // console.log('Pulling model...');
  // await ollama.pull({ model: 'llama3.1' });

  console.log('Sending prompt...');
  const response = await ollama.chat({
    model: 'llama3.1',
    messages: [
      {
        role: 'user',
        content: `
          Emit a 7 word response declaring that Ollama is ready to use.
          Include an emoji at the end that isn't a rocket.
          Do not include any other text or quotes.
        `,
      },
    ],
  });
  console.log(response.message.content);

  return response.message.content;
};
