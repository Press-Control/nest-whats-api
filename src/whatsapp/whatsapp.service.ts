import { Injectable } from '@nestjs/common';
import { Client } from 'whatsapp-web.js';
import { MessageMediaDto } from './dto/message-media.dto';
import { MessageTxtDto } from './dto/message-txt.dto';
import * as fs from 'fs';
import * as qr_svg_api from 'qr-image';
import * as qrcode from 'qrcode-terminal';
import { sendFileApi, sendMessageApi } from './helper/sendMessage';

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
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        args: ['--no-sandbox'],
      },
    });
    this.on('loading_screen', (percent, message) => {
      console.log('Cargando pantalla', percent, message);
    });

    this.on('qr', (qr) => {
      qrcode.generate(qr, { small: true });
      const qr_svg = qr_svg_api.image(qr, { type: 'svg' });
      qr_svg.pipe(
        fs.createWriteStream(`${__dirname}/../../public/qr-code.svg`),
      );
    });

    this.on('ready', () => {
      this.status = true;
      console.log('Cliente Listo');
    });

    this.on('message_reaction', (reaction) => {
      console.log(reaction);
    });

    this.on('message', (message) => {
      console.log(message);

      console.log(message.body);
    });

    this.on('disconnected', async (msg) => {
      console.log('Cliente desconectado', msg);
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
