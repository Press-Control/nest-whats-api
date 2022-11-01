import { Injectable } from '@nestjs/common';
import { Client } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import { sendMessageApi } from './helper/sendMessage';

@Injectable()
export class AppService extends Client {
  private status = false;
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
      console.log('Escanea el codigo QR que esta en la carepta tmp');
      // TODO: generar imagen
      console.log(qr);
      qrcode.generate(qr, { small: true });
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

  getHello(): string {
    return 'Hello World!';
  }
}
