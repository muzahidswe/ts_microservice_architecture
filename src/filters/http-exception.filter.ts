import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter<T extends HttpException>
    implements ExceptionFilter {
    catch(exception: T, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const exceptionResponse: any = exception.getResponse();
        const request = ctx.getRequest();
        const statusCode = exception.getStatus();
        const errorMessage =
            typeof exceptionResponse.message === 'string'
                ? exceptionResponse.message
                : exceptionResponse;
        response.status(statusCode).json({
            error: true,
            statusCode: statusCode,
            message: errorMessage,
            timestamp: new Date(),
            path: request.url,
        });
    }
}
