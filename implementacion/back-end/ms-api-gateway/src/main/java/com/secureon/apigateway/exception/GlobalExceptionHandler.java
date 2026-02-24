package com.secureon.apigateway.exception;

import java.util.Collections;
import java.util.Map;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private final ObjectMapper objectMapper;

    public GlobalExceptionHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @ExceptionHandler(DownstreamHttpException.class)
    public ResponseEntity<ApiErrorResponse> handleDownstreamHttpException(DownstreamHttpException ex) {
        ApiErrorResponse body = normalizeDownstreamError(ex.getStatus(), ex.getResponseBody());
        return ResponseEntity.status(ex.getStatus()).body(body);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiErrorResponse> handleResponseStatusException(ResponseStatusException ex) {
        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
        ApiErrorResponse body = ApiErrorResponse.of(status.value(),
                ex.getReason() != null ? ex.getReason() : status.getReasonPhrase());
        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiErrorResponse> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex) {
        ApiErrorResponse body = ApiErrorResponse.of(HttpStatus.METHOD_NOT_ALLOWED.value(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGenericException(Exception ex) {
        ApiErrorResponse body = ApiErrorResponse.of(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Error interno del servidor: " + ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    private ApiErrorResponse normalizeDownstreamError(HttpStatus status, String responseBody) {
        if (responseBody == null || responseBody.isBlank()) {
            return ApiErrorResponse.of(status.value(), status.getReasonPhrase());
        }

        JsonNode rootNode = readJson(responseBody);
        if (rootNode == null || !rootNode.isObject()) {
            return ApiErrorResponse.of(status.value(), responseBody);
        }

        Map<String, String> errors = extractErrors(rootNode.path("errors"));
        String message = extractStringField(rootNode, "message");

        if (!errors.isEmpty()) {
            ApiErrorResponse response = ApiErrorResponse.validation(status.value(), errors);
            if (message != null && !message.isBlank()) {
                response.setMessage(message);
            }
            return response;
        }

        if (message != null && !message.isBlank()) {
            return ApiErrorResponse.of(status.value(), message);
        }

        return ApiErrorResponse.of(status.value(), responseBody);
    }

    private JsonNode readJson(String responseBody) {
        try {
            return objectMapper.readTree(responseBody);
        } catch (Exception ignored) {
            return null;
        }
    }

    private Map<String, String> extractErrors(JsonNode errorsNode) {
        if (errorsNode == null || !errorsNode.isObject()) {
            return Collections.emptyMap();
        }

        Map<String, String> errors = objectMapper.convertValue(errorsNode, objectMapper.getTypeFactory()
                .constructMapType(Map.class, String.class, String.class));
        return errors;
    }

    private String extractStringField(JsonNode rootNode, String field) {
        JsonNode fieldNode = rootNode.path(field);
        if (fieldNode.isMissingNode() || fieldNode.isNull()) {
            return null;
        }
        return fieldNode.asText();
    }
}
