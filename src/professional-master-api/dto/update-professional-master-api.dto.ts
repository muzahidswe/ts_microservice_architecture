import { PartialType } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean,IsISO8601, IsDate, IsDateString, IsDecimal, IsNotEmpty, isArray, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

import { CreateProfessionalMasterApiDto } from './create-professional-master-api.dto';

export class UpdateProfessionalMasterApiDto extends PartialType(CreateProfessionalMasterApiDto) {
    @IsNotEmpty()
    @IsString()
    professional_id: string;

    @IsNotEmpty()
    @IsNumber()
    updated_by: number;
}
