import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithSession } from './request-with-session.js';

export const CurrentSessionId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string | undefined => {
    const request = context.switchToHttp().getRequest<RequestWithSession>();

    return request.sessionId;
  },
);
