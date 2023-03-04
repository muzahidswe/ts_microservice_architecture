import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

import { CreateProfessionalMasterApiDto } from './create-professional-master-api.dto';

export class UpdateProfessionalMasterApiDto extends PartialType(CreateProfessionalMasterApiDto) {
    @IsNotEmpty()
    @IsString()
    professional_id: string;

    @IsNotEmpty()
    @IsNumber()
    updated_by: number;
}

export class ProfessionalStatusUpdateDto {
    @IsNotEmpty()
    professional_ids: number[];

    @IsNotEmpty()
    @IsNumber()
    updated_by: number;
}
