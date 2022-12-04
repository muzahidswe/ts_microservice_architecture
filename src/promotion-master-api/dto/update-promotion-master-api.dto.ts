import { PartialType } from '@nestjs/swagger';
import { CreatePromotionMasterApiDto } from './create-promotion-master-api.dto';
import { IsBoolean,IsISO8601, IsDate, IsDateString, IsDecimal, IsNotEmpty, isArray, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";


export class UpdatePromotionMasterApiDto extends PartialType(CreatePromotionMasterApiDto) {
    @IsNotEmpty()
    @IsNumber()
    updated_by: number;
}
