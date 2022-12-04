import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseArrayPipe, Req, Res, HttpStatus } from '@nestjs/common';
import { PromotionMasterApiService } from './promotion-master-api.service';
import { CreatePromotionMasterApiDto } from './dto/create-promotion-master-api.dto';
import { UpdatePromotionMasterApiDto } from './dto/update-promotion-master-api.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
@Controller('Promotion-master-api')
@UseGuards(JwtAuthGuard)
@ApiTags('Promotion Master Api')
export class PromotionMasterApiController {

  constructor(private readonly promotionMasterApiService: PromotionMasterApiService) { }

  @Post('create-promotion')
  async create_promotion(
    @Req() req: Request,
    @Res() res: Response,
    @Body(new ParseArrayPipe({ items: CreatePromotionMasterApiDto }))
    CreatePromotionMasterApiDto: CreatePromotionMasterApiDto[]) {
    const promotionCreate = this.promotionMasterApiService.create_promotion(CreatePromotionMasterApiDto);
    const result = {
      'success' : true,
      'message' : 'Promotion Added Successfully.',
      'data' : []
    }
    res.status(HttpStatus.OK).json(result);
  }

  @Get('promotion-category-list')
   async promotionCategoryList(
    @Req() req: Request,
    @Res() res: Response
    ) {
    const prmotionCategoryList = await this.promotionMasterApiService.promotionCategoryList();
    const result = {
      'success' : true,
      'message' : 'Promotion Category list Found Successfully.',
      'data' : prmotionCategoryList
    }
    res.status(HttpStatus.OK).json(result);
  }

  @Get('by-professional-promotion-summary')
   async byProfessionalPromotionSummary(
    @Req() req: Request,
    @Res() res: Response
    ) {
    const byProfessionalPromotionSummary = await this.promotionMasterApiService.byProfessionalPromotionSummary();
    const result = {
      'success' : true,
      'message' : 'Promotion List Found Successfully.',
      'data' : byProfessionalPromotionSummary
    }
    res.status(HttpStatus.OK).json(result);
  }

  @Get('by-professional-promotion-list/:professional_id?/:limit?')
  async professionalDetailsById(
    @Param() params,
    @Req() req: Request,
    @Res() res: Response
    ) {    
    const byProfessionalPromotionList = await this.promotionMasterApiService.byProfessionalPromotionList(params);    
    const result = {
      'success' : true,
      'message' : 'Professional Details Found Successfully.',
      'data' : byProfessionalPromotionList
    }
    res.status(HttpStatus.OK).json(result);
  }

  @Get('promotion-details-by-id/:promotion_id?')
  async promotionDetailsById(
    @Param('promotion_id') promotion_id: number,
    @Req() req: Request,
    @Res() res: Response
    ) {    
    const professionalDetailsById = await this.promotionMasterApiService.promotionDetailsById(promotion_id);    
    const result = {
      'success' : true,
      'message' : 'Professional Details Found Successfully.',
      'data' : professionalDetailsById
    }
    res.status(HttpStatus.OK).json(result);
  }

  @Patch('update-promotion/:id?')
  async updatePromotion(
    @Param('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
    @Body() updatePromotionMasterApiDto: UpdatePromotionMasterApiDto[]) {
    const updatePromotion = this.promotionMasterApiService.updatePromotion(id, updatePromotionMasterApiDto);   
    const result = {
      'success' : true,
      'message' : 'Profmotion Updated Successfully.',
      'data' : []
    }
    res.status(HttpStatus.OK).json(result);
  }

}
function Query() {
  throw new Error('Function not implemented.');
}

