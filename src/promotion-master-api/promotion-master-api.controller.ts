import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseArrayPipe, Req, Res, HttpStatus } from '@nestjs/common';
import { PromotionMasterApiService } from './promotion-master-api.service';
import { CreatePromotionMasterApiDto } from './dto/create-promotion-master-api.dto';
import { UpdatePromotionMasterApiDto, PromotionStatusUpdateDto } from './dto/update-promotion-master-api.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
@Controller('promotion-master-api')
@UseGuards(JwtAuthGuard)
@ApiTags('Promotion Master Api')
export class PromotionMasterApiController {

  constructor(private readonly promotionMasterApiService: PromotionMasterApiService) { }

  @Post('create-promotion')
  async create_promotion(
    @Req() req: Request,
    @Res() res: Response,
    @Body() createPromotionMasterApiDto: CreatePromotionMasterApiDto[]
  )
  {
    const promotionCreate = await this.promotionMasterApiService.create_promotion(createPromotionMasterApiDto);
    const result = {
      'success' : promotionCreate.success,
      'message' : promotionCreate.msg,
      'data' : []
    }
    res.status(HttpStatus.OK).json(result);
  }

  @Get('promotion-category-list')
  async promotionCategoryList(
    @Req() req: Request,
    @Res() res: Response
  )
  {
    const prmotionCategoryList = await this.promotionMasterApiService.promotionCategoryList();
    const result = {
      'success' : (prmotionCategoryList.length > 0) ? true : false,
      'message' : (prmotionCategoryList.length > 0) ? 'Promotion Category list Found Successfully.' : 'Promotion Category List Empty.',
      'data' : prmotionCategoryList
    }
    res.status(HttpStatus.OK).json(result);
  }

  @Get('by-professional-promotion-summary')
  async byProfessionalPromotionSummary(
    @Req() req: Request,
    @Res() res: Response
  ) 
  {
    const byProfessionalPromotionSummary = await this.promotionMasterApiService.byProfessionalPromotionSummary();
    const result = {
      'success' : (byProfessionalPromotionSummary.length > 0) ? true : false,
      'message' : (byProfessionalPromotionSummary.length > 0) ? 'Promotion List Found Successfully.' : 'Promotion List Not Found.',
      'data' : byProfessionalPromotionSummary
    }
    res.status(HttpStatus.OK).json(result);
  }

  @Get('by-professional-promotion-list/:professional_id?/:limit?')
  async professionalDetailsById(
    @Param() params,
    @Req() req: Request,
    @Res() res: Response
  )
  {    
    const byProfessionalPromotionList = await this.promotionMasterApiService.byProfessionalPromotionList(params);    
    const result = {
      'success' : (byProfessionalPromotionList.length > 0) ? true : false,
      'message' : (byProfessionalPromotionList.length > 0) ? 'Professional Details Found Successfully.' : 'Professional Details Not Found.',
      'data' : byProfessionalPromotionList
    }
    res.status(HttpStatus.OK).json(result);
  }

  @Get('promotion-details-by-id/:promotion_id?')
  async promotionDetailsById(
    @Param('promotion_id') promotion_id: number,
    @Req() req: Request,
    @Res() res: Response
  )
  {    
    const professionalDetailsById = await this.promotionMasterApiService.promotionDetailsById(promotion_id);    
    const result = {
      'success' : (professionalDetailsById.length > 0) ? true: false,
      'message' : (professionalDetailsById.length > 0) ? 'Professional Details Found Successfully.' : 'Professional Details Not Found.',
      'data' : professionalDetailsById
    }
    res.status(HttpStatus.OK).json(result);
  }

  @Patch('update-promotion/:id?')
  async updatePromotion(
    @Param('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
    @Body() updatePromotionMasterApiDto: UpdatePromotionMasterApiDto[]
  )
  {
    const updatePromotion = await this.promotionMasterApiService.updatePromotion(id, updatePromotionMasterApiDto);   
    const result = {
      'success' : updatePromotion,
      'message' : updatePromotion ? 'Profmotion Updated Successfully.' : 'Profmotion Updated Failed!',
      'data' : []
    }
    res.status(HttpStatus.OK).json(result);
  }

  @Patch('promotion-update-as-approved')
  async promotionUpdateAsApproved(
    @Req() req: Request,
    @Res() res: Response,
    @Body() promotionStatusUpdateDto: PromotionStatusUpdateDto
  )
  {
    const updateRequest = await this.promotionMasterApiService.promotionUpdateAsApproved(promotionStatusUpdateDto);   
    const result = {
      'success' : updateRequest,
      'message' : updateRequest ? 'Promotion Approved Successfully.' : 'Promotion Approved Failed',
      'data' : []
    }
    res.status(HttpStatus.OK).json(result);
  }

  @Patch('promotion-update-as-decline')
  async promotionUpdateAsDecline(
    @Req() req: Request,
    @Res() res: Response,
    @Body() promotionStatusUpdateDto: PromotionStatusUpdateDto
  )
  {
    const updateRequest = await this.promotionMasterApiService.promotionUpdateAsDecline(promotionStatusUpdateDto);   
    const result = {
      'success' : updateRequest,
      'message' : updateRequest ? 'Promotion Declined Successfully.' : 'Promotion Declined Failed!',
      'data' : []
    }
    res.status(HttpStatus.OK).json(result);
  }

  @Patch('promotion-update-as-deactivate')
  async promotionUpdateAsDeactivate(
    @Req() req: Request,
    @Res() res: Response,
    @Body() promotionStatusUpdateDto: PromotionStatusUpdateDto
  )
  {
    const updateRequest = await this.promotionMasterApiService.promotionUpdateAsDeactivate(promotionStatusUpdateDto);
    const result = {
      'success' : updateRequest,
      'message' : updateRequest ? 'Promotion Deactivated Successfully.' : 'Promotion Deactivated Failed!',
      'data' : []
    }
    res.status(HttpStatus.OK).json(result);
  }

  @Get('/promotion-sync-count/:user_id/:date?')
  async promotionSyncCount(
    @Param('user_id') user_id: number,
    @Param('date') date: string,
    @Req() req: Request,
    @Res() res: Response
  )
  {    
    const syncCount:any = await this.promotionMasterApiService.promotionSyncCount(user_id, date);    
    const result: object = {
      'success' : syncCount.success,
      'message' : syncCount.msg,
      'data' : syncCount.data
    }
    res.status(HttpStatus.OK).json(result);
  }

}
function Query() {
  throw new Error('Function not implemented.');
}

