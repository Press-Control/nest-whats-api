import { Client, MessageMedia } from 'whatsapp-web.js';
import { cleanData } from './cleanData';

export const sendMessageApi = async (
  client: Client,
  number: number,
  message: string,
) => {
  const clean_data = await cleanData(client, number);
  if (clean_data['ok']) {
    const sendMessageTxt = await client.sendMessage(
      `521${clean_data['number']}@c.us`,
      message,
    );
    console.log(sendMessageTxt);
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

export const sendFileApi = async (
  client: Client,
  number: number,
  path: string,
) => {
  const clean_data = await cleanData(client, number);
  if (clean_data['ok']) {
    const file = path;
    try {
      const media = MessageMedia.fromFilePath(file);
      await client.sendMessage(`521${clean_data['number']}@c.us`, media);
      console.log('Client send');
      const respuesta = {
        ok: true,
        msg: 'Mensaje envido',
        status: 200,
      };
      return respuesta;
    } catch (error) {
      console.log(error);
      const respuesta = {
        ok: true,
        msg: 'No se encontro el archivo',
        status: 404,
      };
      return respuesta;
    }
  } else {
    return clean_data;
  }
};
