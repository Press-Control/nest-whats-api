import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Res,
} from '@nestjs/common';
import * as fs from 'fs';
import { AppService } from './app.service';
import { MessageTxtDto } from './dto/messagetxt.dto';

interface MessageResponse {
  ok: boolean;
  msg: string | null;
  status: number;
}

interface SendFile {
  path: string;
  phoneNumber: any;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/qr')
  getQr(@Res() res: any) {
    const status = this.appService.status;
    if (!status) {
      res.writeHead(200, { 'content-type': 'image/svg+xml' });
      fs.createReadStream(`${__dirname}/../public/qr-code.svg`).pipe(res);
    } else {
      res.send('Cliente Logeado');
    }
  }

  @Post('/sendtxt')
  async postTxt(@Body() messageTxt: MessageTxtDto): Promise<MessageResponse> {
    const message: any = messageTxt['phoneNumber'].replace(/\s+/g, '');
    const messageNumber: number = parseInt(message);
    const sendMessage: MessageResponse = await this.appService.sendTxt(
      messageNumber,
      messageTxt['message'],
    );
    if (sendMessage['status'] == 404) {
      throw new ForbiddenException(sendMessage);
    }
    return sendMessage;
  }

  @Post('/sendfile')
  async postFile(@Body() messageTxt: SendFile): Promise<MessageResponse> {
    const sendFile: MessageResponse = await this.appService.sendFile(
      messageTxt['phoneNumber'].replace(/\s+/g, ''),
      messageTxt['path'],
    );
    if (sendFile['status'] == 404) {
      throw new ForbiddenException(sendFile);
    }
    return sendFile;
  }
}
