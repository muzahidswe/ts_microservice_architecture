import { Transform, Type } from "class-transformer";
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean,IsISO8601, IsDate, IsDateString, IsDecimal, IsNotEmpty, isArray, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export class CreateProfessionalMasterApiDto {
    
    @IsNotEmpty()
    @IsNumber()
    category_id: number;

    @IsNotEmpty()
    @IsString()
    professional_id: string;
    
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    designation: string;    
    
    @IsNotEmpty()
    @IsString()
    department: string;

    @IsOptional()
    @IsString()
    organization: string;
        
    @IsOptional()
    @IsString()
    contact_person: string;

    @IsNotEmpty()
    @IsString()
    mobile_number: string;

    @IsOptional()
    @IsString()
    academic_background: string;
    
    @IsOptional()
    @IsNumber()
    visit_fee: number;
    
    @IsOptional()
    @IsString()
    calendar_type: string;
    
    @IsOptional()    
    visiting_schedule: object[];
        
    @IsOptional()
    @IsString()
    chamber: string;

    @IsNotEmpty()
    @IsNumber()
    territory_id: number;

    @IsNotEmpty()
    @IsNumber()
    dep_id: number;

    @IsNotEmpty()
    @IsNumber()
    route_id: number;
    
    @IsNotEmpty()
    @IsNumber()
    contract_value: number;
    
    @IsNotEmpty()
    @IsNumber()
    contract_tenure: number;
    
    @IsOptional()
    @IsNumber()
    patients_per_week: number;

    @IsOptional()
    @IsNumber()
    baby_food_prescriptions: number;

    @IsOptional()
    @IsNumber()
    prescription_for_mother_smile: number;

    @IsNotEmpty()
    @IsString()
    image_data: string;

    @IsOptional()
    @IsString()
    comments: string;    
    
    @IsNotEmpty()
    @IsNumber()
    created_by: number;
}

export class GetAllProfessionalFilterDto{
    @IsNotEmpty()
    point_ids: number[];
}

