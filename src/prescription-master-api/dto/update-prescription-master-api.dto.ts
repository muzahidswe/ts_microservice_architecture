import { PartialType } from '@nestjs/swagger';
import { CreatePrescriptionMasterApiDto } from './create-prescription-master-api.dto';
import { IsBoolean,IsISO8601, IsDate, IsDateString, IsDecimal, IsNotEmpty, isArray, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";


export class UpdatePrescriptionMasterApiDto extends PartialType(CreatePrescriptionMasterApiDto) {
    @IsNotEmpty()
    @IsNumber()
    updated_by: number;
}
