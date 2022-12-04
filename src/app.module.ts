import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { RefreshTokenMiddleware } from './middleware/refreshtoken.middleware';
import { DatabaseModule } from 'database.module';
import { ProfessionalMasterApiModule } from './professional-master-api/professional-master-api.module';
import { PromotionMasterApiModule } from './promotion-master-api/promotion-master-api.module';
import { PrescriptionMasterApiModule } from './prescription-master-api/prescription-master-api.module';
@Module({
    imports: [        
        ConfigModule.forRoot(),
        DatabaseModule, 
        AuthModule,
        ProfessionalMasterApiModule,
        PromotionMasterApiModule,
        PrescriptionMasterApiModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(RefreshTokenMiddleware)
            .forRoutes('*');
    }
}
