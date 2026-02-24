import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const started = Date.now();
    const method = request.method;
    const url = request.urlWithParams;

    // Log request
    console.group(`%c→ ${method} ${url}`, 'color: #2196F3; font-weight: bold');
    console.log('%cHeaders:', 'color: #9E9E9E', this.formatHeaders(request));
    if (request.body) {
      console.log('%cPayload:', 'color: #FF9800; font-weight: bold', JSON.parse(JSON.stringify(request.body)));
    }
    console.groupEnd();

    return next.handle(request).pipe(
      tap({
        next: (event) => {
          if (event instanceof HttpResponse) {
            const elapsed = Date.now() - started;
            console.group(
              `%c← ${event.status} ${method} ${url} %c(${elapsed}ms)`,
              event.status < 400 ? 'color: #4CAF50; font-weight: bold' : 'color: #f44336; font-weight: bold',
              'color: #9E9E9E'
            );
            if (event.body) {
              console.log('%cResponse:', 'color: #4CAF50', event.body);
            }
            console.groupEnd();
          }
        },
        error: (error: HttpErrorResponse) => {
          const elapsed = Date.now() - started;
          console.group(
            `%c✖ ${error.status} ${method} ${url} %c(${elapsed}ms)`,
            'color: #f44336; font-weight: bold',
            'color: #9E9E9E'
          );
          console.log('%cError:', 'color: #f44336', error.message);
          if (error.error) {
            console.log('%cBody:', 'color: #f44336', error.error);
          }
          console.groupEnd();
        }
      })
    );
  }

  private formatHeaders(req: HttpRequest<unknown>): Record<string, string> {
    const headers: Record<string, string> = {};
    for (const key of req.headers.keys()) {
      headers[key] = req.headers.get(key) || '';
    }
    return headers;
  }
}
