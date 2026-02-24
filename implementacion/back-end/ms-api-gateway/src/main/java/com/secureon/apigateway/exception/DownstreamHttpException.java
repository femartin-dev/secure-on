package com.secureon.apigateway.exception;

import org.springframework.http.HttpStatus;

public class DownstreamHttpException extends RuntimeException {

    private final HttpStatus status;
    private final String responseBody;

    public DownstreamHttpException(HttpStatus status, String responseBody) {
        super("Downstream service error");
        this.status = status;
        this.responseBody = responseBody;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getResponseBody() {
        return responseBody;
    }
}
