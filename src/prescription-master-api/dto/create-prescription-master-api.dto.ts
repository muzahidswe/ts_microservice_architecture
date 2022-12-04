import { Transform, Type } from "class-transformer";
import { IsBoolean,IsISO8601, IsDate, IsDateString, IsDecimal, IsNotEmpty, isArray, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export class CreatePrescriptionMasterApiDto {

    @IsNotEmpty()
    @IsNumber()
    professional_id: number;

    @IsNotEmpty()    
    prescription_image_data: string[];
      
    @IsNotEmpty()
    @IsNumber()
    created_by: number;
}

