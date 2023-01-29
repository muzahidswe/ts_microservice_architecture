import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseArrayPipe, Req, Res, HttpStatus } from '@nestjs/common';
import { PrescriptionMasterApiService } from './prescription-master-api.service';
import { CreatePrescriptionMasterApiDto } from './dto/create-prescription-master-api.dto';
import { UpdatePrescriptionMasterApiDto } from './dto/update-prescription-master-api.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
@Controller('Prescription-master-api')
@UseGuards(JwtAuthGuard)
@ApiTags('Prescription Master Api')
export class PrescriptionMasterApiController {

  constructor(private readonly prescriptionMasterApiService: PrescriptionMasterApiService) { }

  @Post('create-prescription')
  async create_prescription(
    @Req() req: Request,
    @Res() res: Response,
    @Body(new ParseArrayPipe({ items: CreatePrescriptionMasterApiDto }))
    CreatePrescriptionMasterApiDto: CreatePrescriptionMasterApiDto[]) {
    const prescriptionCreate = this.prescriptionMasterApiService.create_prescription(CreatePrescriptionMasterApiDto);
    const result = {
      'success' : true,
      'message' : 'Prescription Added Successfully.',
      'data' : []
    }
    res.status(HttpStatus.OK).json(result);
  }

  @Get('by-professional-prescription-summary')
  async byProfessionalPrescriptionSummary(
    @Req() req: Request,
    @Res() res: Response
    ) {
    const byProfessionalPromotionSummary = await this.prescriptionMasterApiService.byProfessionalPrescriptionSummary();
    const result = {
      'success' : true,
      'message' : 'Prescription List Found Successfully.',
      'data' : byProfessionalPromotionSummary
    }
    res.status(HttpStatus.OK).json(result);
  }
 
  @Get('by-professional-prescription-image-list/:professional_id?/:limit?')
  async byProfessionalPrescriptionImageList(
    @Param() params,
    @Req() req: Request,
    @Res() res: Response
    ) {
    const byProfessionalPromotionSummary = await this.prescriptionMasterApiService.byProfessionalPrescriptionImageList(params);
    const result = {
      'success' : true,
      'message' : 'Prescription List Found Successfully.',
      'data' : byProfessionalPromotionSummary
    }
    res.status(HttpStatus.OK).json(result);
  }

}
function Query() {
  throw new Error('Function not implemented.');
}

