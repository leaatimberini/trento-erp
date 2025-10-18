import { IsArray, IsUUID } from 'class-validator';

export class AssignOrdersDto {
  @IsArray()
  @IsUUID('4', { each: true })
  orderIds: string[];
}