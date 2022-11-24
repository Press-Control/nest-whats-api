import { Client, MessageMedia } from 'whatsapp-web.js';
import { validNumber } from './validNumber';

export const sendMessageApi = async (
  client: Client,
  number: number,
  message: string,
) => {
  const _validNumber = await validNumber(client, number);
  if (_validNumber) {
    const sendMessageTxt = await client.sendMessage(
      `521${number}@c.us`,
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
    const respuesta = {
      ok: false,
      msg: 'El número no es un usuario válido de whatsapp',
      status: 404,
    };
    return respuesta;
  }
};

export const sendFileApi = async (
  client: Client,
  number: number,
  path: string,
) => {
  const _validNumber = await validNumber(client, number);
  if (_validNumber) {
    const file = path;
    try {
      const media = MessageMedia.fromFilePath(file);
      await client.sendMessage(`521${number}@c.us`, media);
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
    const respuesta = {
      ok: false,
      msg: 'El número no es un usuario de whatsapp válido',
      status: 404,
    };
    return respuesta;
  }
};
