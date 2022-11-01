import { Client } from 'whatsapp-web.js';
import { cleanData } from './cleanData';

export const sendMessageApi = async (
  client: Client,
  number: number,
  message: string,
) => {
  const clean_data = await cleanData(client, number);
  if (clean_data['ok']) {
    await client.sendMessage(`521${clean_data['number']}@c.us`, message);
    console.log('Client send');
    const respuesta = {
      ok: true,
      msg: 'Mensaje envido',
      status: 200,
    };
    return respuesta;
  } else {
    return clean_data;
  }
};
