import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
} from '@nestjs/common';
import { AppService } from './app.service';

interface MessageTxt {
  message: string;
  phoneNumber: any;
}

interface MessageResponse {
  ok: boolean;
  msg: string | null;
  status: number;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/send')
  async postTxt(@Body() messageTxt: MessageTxt): Promise<MessageResponse> {
    const sendMessage: MessageResponse = await this.appService.sendTxt(
      messageTxt['phoneNumber'].replace(/\s+/g, ''),
      messageTxt['message'],
    );
    if (sendMessage['status'] == 404) {
      throw new ForbiddenException(sendMessage);
    }
    return sendMessage;
  }
}
