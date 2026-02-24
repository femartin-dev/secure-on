package com.secureon.seguridad.exeptions;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.HttpRequestMethodNotSupportedException;

import com.secureon.seguridad.util.MessagesService;

import lombok.extern.slf4j.Slf4j;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @Autowired
    private MessagesService messageService;

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> resourceNotFoundException(ResourceNotFoundException ex) {
        ApiErrorResponse body = ApiErrorResponse.of(HttpStatus.NOT_FOUND.value(), ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiErrorResponse> badRequestException(BadRequestException ex) {
        ApiErrorResponse body = ApiErrorResponse.of(HttpStatus.BAD_REQUEST.value(), ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiErrorResponse> badCredentialsException(BadCredentialsException ex) {
        log.error("Bad credentials exception: ", ex);
        ApiErrorResponse body = ApiErrorResponse.of(HttpStatus.UNAUTHORIZED.value(),
                messageService.getMessage("err.user.login"));
        return new ResponseEntity<>(body, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiErrorResponse> unauthorizedException(UnauthorizedException ex) {
        ApiErrorResponse body = ApiErrorResponse.of(HttpStatus.UNAUTHORIZED.value(), ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> validationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        ApiErrorResponse body = ApiErrorResponse.validation(HttpStatus.BAD_REQUEST.value(), errors);
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiErrorResponse> methodNotSupportedException(HttpRequestMethodNotSupportedException ex) {
        ApiErrorResponse body = ApiErrorResponse.of(HttpStatus.METHOD_NOT_ALLOWED.value(), ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.METHOD_NOT_ALLOWED);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> globalExceptionHandler(Exception ex) {
        ApiErrorResponse body = ApiErrorResponse.of(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                messageService.getMessage("err.server.internal", ex.getMessage()));
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}