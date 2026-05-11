package com.nearscop.demo.exception;

import com.nearscop.demo.dto.ErrorResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.reactive.function.client.WebClientException;


@RestControllerAdvice
public class GlobalExceptionHandler {


    private static final org.slf4j.Logger log =
            org.slf4j.LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(NasaApiException.class)
    public ResponseEntity<ErrorResponse> handleNasaApiError(NasaApiException ex) {
        log.error("NASA API error: {}", ex.getMessage());
        return ResponseEntity.status(503)
                .body(new ErrorResponse("NASA API unavailable", ex.getMessage()));
    }

    @ExceptionHandler(WebClientException.class)
    public ResponseEntity<ErrorResponse> handleWebClientError(WebClientException ex) {
        log.error("WebClient error: {}", ex.getMessage());
        return ResponseEntity.status(503)
                .body(new ErrorResponse("External API communication error", ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("Invalid argument: {}", ex.getMessage());
        return ResponseEntity.badRequest()
                .body(new ErrorResponse("Invalid request", ex.getMessage()));
    }
}
