import { ApiProperty } from '@nestjs/swagger';

export class MessageTxtDto {
  @ApiProperty({
    example: 'Hola, soy un mensaje',
    description: 'Mensaje que se va a mandar',
  })
  message: string;

  @ApiProperty()
  phoneNumber: string;
}
