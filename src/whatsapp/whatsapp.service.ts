import { Injectable } from '@nestjs/common';
import { Client } from 'whatsapp-web.js';
import { MessageMediaDto } from './dto/message-media.dto';
import { MessageTxtDto } from './dto/message-txt.dto';
import * as fs from 'fs';
import * as qr_svg_api from 'qr-image';
import * as qrcode from 'qrcode-terminal';
import { sendFileApi, sendMessageApi } from './helper/sendMessage';
import axios, { AxiosResponse } from 'axios';
import { connectToServer } from './socket-client';
import * as phone from 'google-libphonenumber';
import * as fsPromise from 'fs/promises';

interface MessengerCreateResponse {
  ok: boolean;
  msg: string;
}

@Injectable()
export class WhatsappService extends Client {
  status = false;
  constructor() {
    super({
      puppeteer: {
        // Si se ejecuta en linux normalmente el path de google chrome es el siguiente
        // executablePath: '/usr/bin/google-chrome',
        // Si se ejecuta en Macos el path es el siguiente
        // executablePath: '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome',
        executablePath:
          //   '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome',
          '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome',
        args: ['--no-sandbox'],
      },
    });
    this.on('loading_screen', async (percent, message) => {
      // await axios.patch(`http://localhost:3000/api/messenger/${process.env.USERID}`, { status: "loading_screen", updatedAt: Date.now() });
      console.log('Cargando pantalla', percent, message);
    });

    this.on('qr', async (qr) => {
      qrcode.generate(qr, { small: true });
      const qr_svg = qr_svg_api.image(qr, { type: 'svg' });
      qr_svg.pipe(
        fs.createWriteStream(`${__dirname}/../../public/qr-code.svg`),
      );
      // await axios.patch(`http://localhost:3000/api/messenger/${process.env.USERID}`, { status: "qr", updatedAt: Date.now() });
    });

    this.on('ready', async () => {
      try {
        console.log(this.info.wid.user);
        // Implementar el metodo google phone para extraer el numero del usuario
        const phoneUtil = phone.PhoneNumberUtil.getInstance();
        const _userPhone = phoneUtil.parseAndKeepRawInput(
          this.info.wid.user,
          'MX',
        );
        const _myPhone = phoneUtil.getNationalSignificantNumber(_userPhone);
        console.log(_myPhone);
        this.status = true;
        console.log('Cliente Listo');
        // TODO: GUARDAR EN LA VARIABLE DE ENTORNO LA RESPUESTA DE userId
        const userId: AxiosResponse<MessengerCreateResponse> = await axios.post(
          `${process.env.MAIN_URL}${process.env.CREATE_MESSENGER_URL}`,
          { phone: _myPhone, botProcessId: process.env.BOT_PROCESS_ID },
        );
        await fsPromise.appendFile(
          `${__dirname}/../../.env`,
          `\n${'messengerId'.toUpperCase()}=${userId.data.msg}`,
        );
        await axios.patch(
          `${process.env.MAIN_URL}${process.env.UPDATE_BOT_PROCESS_URL}/${process.env.BOT_PROCESS_ID}`,
          { status: 'ready', updatedAt: Date.now() },
        );
        connectToServer();
      } catch (error) {
        console.log(error);
      }
    });

    // this.on('message_reaction', (reaction) => {
    //   console.log(reaction);
    // });

    this.on('message', (message) => {
      // TODO: Guradar mensaje en la base de datos
      if (message.from === 'status@broadcast') {
        return;
      }

      console.log(message.body);
      console.log(message.from);
    });

    this.on('disconnected', async (msg) => {
      console.log('Cliente desconectado', msg);
      // await axios.delete(`${process.env.MAIN_URL}/api/messenger/removepm2/${process.env.USERID}`);
    });
    this.initialize();
  }

  async createMessageTxt(messageTxtDto: MessageTxtDto) {
    const phoneNumber = parseInt(messageTxtDto.phoneNumber);
    const message = messageTxtDto.message;

    const send = await sendMessageApi(this, phoneNumber, message);
    console.log(send['status']);
    return { ok: send['ok'], msg: send['msg'], status: send['status'] };
  }

  async createMessageMedia(messageMediaDto: MessageMediaDto) {
    const phoneNumber = parseInt(messageMediaDto.phoneNumber);
    const path = messageMediaDto.path;

    const send = await sendFileApi(this, phoneNumber, path);
    return { ok: send['ok'], msg: send['msg'], status: send['status'] };
  }

  // create(createWhatsappDto: MessageTxtDto) {
  //   return 'This action adds a new whatsapp';
  // }

  // findAll() {
  //   return `This action returns all whatsapp`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} whatsapp`;
  // }
}
