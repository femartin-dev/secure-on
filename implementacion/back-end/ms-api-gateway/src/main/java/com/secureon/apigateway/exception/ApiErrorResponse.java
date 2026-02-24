package com.secureon.apigateway.exception;

import java.time.OffsetDateTime;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiErrorResponse {

    private OffsetDateTime timestamp;
    private Integer status;
    private String message;
    private Map<String, String> errors;

    public static ApiErrorResponse of(int status, String message) {
        ApiErrorResponse response = new ApiErrorResponse();
        response.setTimestamp(OffsetDateTime.now());
        response.setStatus(status);
        response.setMessage(message);
        return response;
    }

    public static ApiErrorResponse validation(int status, Map<String, String> errors) {
        ApiErrorResponse response = new ApiErrorResponse();
        response.setTimestamp(OffsetDateTime.now());
        response.setStatus(status);
        response.setErrors(errors);
        return response;
    }

    public OffsetDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(OffsetDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Map<String, String> getErrors() {
        return errors;
    }

    public void setErrors(Map<String, String> errors) {
        this.errors = errors;
    }
}
