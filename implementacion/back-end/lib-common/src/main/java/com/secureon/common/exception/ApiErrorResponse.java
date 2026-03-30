package com.secureon.common.exception;

import java.time.OffsetDateTime;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter
@Setter
@Builder
public class ApiErrorResponse {
    @Builder.Default
    private OffsetDateTime timestamp = OffsetDateTime.now();
    private Integer status;
    private String message;
    private Map<String, String> errors;

    public static ApiErrorResponse of(int status, String message) {
        return ApiErrorResponse.builder()
                .status(status)
                .message(message)
                .build();
    }

    public static ApiErrorResponse validation(int status, Map<String, String> errors) {
        return ApiErrorResponse.builder()
                .status(status)
                .errors(errors)
                .build();
    }
}
