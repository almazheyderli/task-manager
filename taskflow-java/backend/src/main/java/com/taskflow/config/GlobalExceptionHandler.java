package com.taskflow.config;

import com.taskflow.dto.Dto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Dto.ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .findFirst()
                .orElse("Validation xətası");
        return ResponseEntity.badRequest().body(new Dto.ErrorResponse(message, 400));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Dto.ErrorResponse> handleIllegal(IllegalArgumentException ex) {
        boolean isNotFound = ex.getMessage().contains("tapılmadı");
        int status = isNotFound ? 404 : 400;
        return ResponseEntity.status(status).body(new Dto.ErrorResponse(ex.getMessage(), status));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Dto.ErrorResponse> handleGeneral(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new Dto.ErrorResponse("Server xətası baş verdi", 500));
    }
}
