import { Transform, Type } from "class-transformer";
import { IsBoolean,IsISO8601, IsDate, IsDateString, IsDecimal, IsNotEmpty, isArray, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export class CreatePromotionMasterApiDto {

    @IsNotEmpty()
    @IsString()
    promotion_id: string;
    
    @IsNotEmpty()
    @IsNumber()
    promotion_category_id: number;

    @IsNotEmpty()
    @IsNumber()
    professional_id: number;

    @IsNotEmpty()
    @IsNumber()
    dep_id: number;

    @IsNotEmpty()
    @IsNumber()
    ff_id: number;
    
    @IsNotEmpty()
    @IsString()
    promotion_description: string;

    @IsNotEmpty()
    @IsNumber()
    promotion_value: number;

    @IsNotEmpty()
    @IsNumber()
    usable_value: number;

    @IsOptional()
    @IsString()
    comments: string;    
    
    @IsNotEmpty()
    @IsNumber()
    created_by: number;
}

