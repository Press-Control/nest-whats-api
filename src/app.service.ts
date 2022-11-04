import { Injectable } from '@nestjs/common';
import { Client } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import { sendFileApi, sendMessageApi } from './helper/sendMessage';
import * as fs from 'fs';
import * as qr_svg_api from 'qr-image';

@Injectable()
export class AppService extends Client {
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
      qr_svg.pipe(fs.createWriteStream(`${__dirname}/../public/qr-code.svg`));
    });

    this.on('ready', () => {
      this.status = true;
      console.log('Cliente Listo');
    });

    this.on('disconnected', async (msg) => {
      console.log('Cliente desconectado', msg);
    });
    this.initialize();
  }

  async sendTxt(phoneNumber: number, message: string) {
    const send = await sendMessageApi(this, phoneNumber, message);
    console.log(send['status']);
    return { ok: send['ok'], msg: send['msg'], status: send['status'] };
  }

  async sendFile(phoneNumber: number, path: string) {
    const send = await sendFileApi(this, phoneNumber, path);
    console.log(send['status']);
    return { ok: send['ok'], msg: send['msg'], status: send['status'] };
  }
}
