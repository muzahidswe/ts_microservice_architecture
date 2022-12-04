import {
    ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import * as bodyParser from 'body-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
const { PORT, NODE_ENV } = process.env;
declare const module: any;

async function bootstrap() {
    // const app = await NestFactory.create(AppModule, { cors: true });
    const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });

    const config = new DocumentBuilder()
        .setTitle('Mothers Smile Professional Service API')
        .setDescription('')
        .setVersion('1.0')
        .addTag('')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
            //exception factory for custom validation error message as key value pair
            // exceptionFactory: (validationErrors: ValidationError[] = []) => {
            //     const response_data = {};
            //     validationErrors.filter(function (values) {
            //         response_data[values.property] = Object.keys(values.constraints).map(
            //             (k) => values.constraints[k],
            //         );
            //     });
            //     return new BadRequestException(response_data);
            // },
        }),
    );
    //app.useGlobalInterceptors(new CustomResponseInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useStaticAssets(`${__dirname}/public`);
    app.use(bodyParser.json({limit: '15mb'}));
    app.use(
        bodyParser.urlencoded({
          limit: "10mb",
          extended: true,
        })
      );
    await app.listen(PORT, () => {
        console.log(`Service : Professional service is running on port ${PORT}`);
        console.log(`Professional Service is running on ${NODE_ENV} environment`)
      });
    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => app.close());
    }
}
bootstrap();