import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseArrayPipe, Req, Res, HttpStatus } from '@nestjs/common';
import { ProfessionalMasterApiService } from './professional-master-api.service';
import { CreateProfessionalMasterApiDto, GetAllProfessionalFilterDto } from './dto/create-professional-master-api.dto';
import { UpdateProfessionalMasterApiDto, ProfessionalStatusUpdateDto } from './dto/update-professional-master-api.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';

@Controller('professional-master-api')
@UseGuards(JwtAuthGuard)
@ApiTags('Professional Master Api')
export class ProfessionalMasterApiController {

  constructor(private readonly professionalMasterApiService: ProfessionalMasterApiService) { }

  @Post('create-professional')
  async create_professional(
    @Req() req: Request,
    @Res() res: Response,
    @Body() createProfessionalMasterApiDto: CreateProfessionalMasterApiDto[]
  )
  {
    const professional: any = await this.professionalMasterApiService.create_professional(createProfessionalMasterApiDto);
    const result: object = {
      'success' : professional.success,
      'message' : professional.msg,
      'data' : []
    }
    res.status(HttpStatus.OK).json(result);
  }

  @Get('professional-category-list')
  async professionalCategoryList(
    @Req() req: Request,
    @Res() res: Response
  )
  {
    const categoryList: any[] = await this.professionalMasterApiService.professionalCategoryList();
    const result: object = {
      'success' : (categoryList.length > 0) ? true : false,
      'message' : (categoryList.length > 0) ? 'Professional Category List Found Successfully.' : 'Professional Category List Not Found.',
      'data' : categoryList
    }
    res.status(HttpStatus.OK).json(result);
  }

  @Post('/professional-list')
  async professionalList(
    @Req() req: Request,
    @Res() res: Response,
    @Body() getAllProfessionalFilterDto: GetAllProfessionalFilterDto
    )
  {
    const professionalList: any[] = await this.professionalMasterApiService.professionalList(getAllProfessionalFilterDto);
    const result: object = {
      'success' : (professionalList.length > 0) ? true : false,
      'message' : (professionalList.length > 0) ? 'Professional List Found Successfully.' : 'Professional List Not Found.',
      'data' : professionalList
    }
    res.status(HttpStatus.OK).json(result);
  }

  @Get('/professional-details-by-id/:professional_id?')
  async professionalDetailsById(
    @Param('professional_id') professional_id: number,
    @Req() req: Request,
    @Res() res: Response
  )
  {    
    const professionalDetailsById: any[] = await this.professionalMasterApiService.professionalDetailsById(professional_id);    
    const result: object = {
      'success' : professionalDetailsById ? true : false,
      'message' : professionalDetailsById ? 'Professional Details Found Successfully.' : 'Professional Details Not Found.',
      'data' : professionalDetailsById
    }
    res.status(HttpStatus.OK).json(result);
  }

  @Get('/professional-details-by-professional-id/:professional_id?')
  async professionalDetailsByProfessionalId(
    @Param('professional_id') professional_id: string,
    @Req() req: Request,
    @Res() res: Response
  ) 
  {    
    const professionalDetailsById: any[] = await this.professionalMasterApiService.professionalDetailsByProfessionalId(professional_id);    
    const result: object = {
      'success' : professionalDetailsById ? true : false,
      'message' : professionalDetailsById ? 'Professional Details Found Successfully.' : 'Professional Details Not Found.',
      'data' : professionalDetailsById ? professionalDetailsById : {}
    }
    res.status(HttpStatus.OK).json(result);
  }

  @Patch('update-professional/:professional_id?')
  async updateProfessional(
    @Param('professional_id') professional_id: number,
    @Req() req: Request,
    @Res() res: Response,
    @Body() updateProfessionalMasterApiDto: UpdateProfessionalMasterApiDto[]) {
    const updateProfessional: any = await this.professionalMasterApiService.updateProfessional(professional_id, updateProfessionalMasterApiDto);   
    const result: object = {
      'success' : updateProfessional.success,
      'message' : updateProfessional.msg,
      'data' : []
    }
    res.status(HttpStatus.OK).json(result);
  }

  @Patch('professional-update-as-approved')
  async professionalUpdateAsApproved(
    @Req() req: Request,
    @Res() res: Response,
    @Body() professionalStatusUpdateDto: ProfessionalStatusUpdateDto
  )
  {
    const updateRequest: any = await this.professionalMasterApiService.professionalUpdateAsApproved(professionalStatusUpdateDto);   
    const result: object = {
      'success' : updateRequest,
      'message' : updateRequest ? 'Professional Approved Successfully.' : 'Professional Approved Failed.',
      'data' : []
    }
    res.status(HttpStatus.OK).json(result);
  }

  @Patch('professional-update-as-decline')
  async professionalUpdateAsDecline(
    @Req() req: Request,
    @Res() res: Response,
    @Body() professionalStatusUpdateDto: ProfessionalStatusUpdateDto
  )
  {
    const updateRequest: any = await this.professionalMasterApiService.professionalUpdateAsDecline(professionalStatusUpdateDto);   
    const result: object = {
      'success' : updateRequest,
      'message' : updateRequest ? 'Professional Declined Successfully.' : 'Professional Declined Failed.',
      'data' : []
    }
    res.status(HttpStatus.OK).json(result);
  }

  @Patch('professional-update-as-deactivate')
  async professionalUpdateAsDeactivate(
    @Req() req: Request,
    @Res() res: Response,
    @Body() professionalStatusUpdateDto: ProfessionalStatusUpdateDto
  )
  {
    const updateRequest: any = await this.professionalMasterApiService.professionalUpdateAsDeactivate(professionalStatusUpdateDto);
    const result: object = {
      'success' : updateRequest,
      'message' : updateRequest ? 'Professional Deactivated Successfully.' : 'Professional Deactivated Failed.',
      'data' : []
    }
    res.status(HttpStatus.OK).json(result);
  }

  @Patch('professional-update-request-as-deactivate')
  async professionalUpdateRequestAsDeactivate(
    @Req() req: Request,
    @Res() res: Response,
    @Body() professionalStatusUpdateDto: ProfessionalStatusUpdateDto
  )
  {
    const updateRequest: any = await this.professionalMasterApiService.professionalUpdateRequestAsDeactivate(professionalStatusUpdateDto);
    const result: object = {
      'success' : updateRequest,
      'message' : updateRequest ? 'Professional Deactivate Request Saved Successfully.' : 'Professional Deactivate Request Saved Failed.',
      'data' : []
    }
    res.status(HttpStatus.OK).json(result);
  }

  @Get('/professional-sync-count/:user_id/:date?')
  async professionalSyncCount(
    @Param('user_id') user_id: number,
    @Param('date') date: string,
    @Req() req: Request,
    @Res() res: Response
  )
  {    
    const syncCount:any = await this.professionalMasterApiService.professionalSyncCount(user_id, date);    
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

