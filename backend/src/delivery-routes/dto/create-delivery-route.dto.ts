import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateDeliveryRouteDto {
  @IsString()
  @IsNotEmpty()
  driverName: string;

  @IsDateString()
  @IsNotEmpty()
  routeDate: Date;
}