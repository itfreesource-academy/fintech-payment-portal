package com.itfs.fintech.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorDetails {
    private String errorCode;
    private String errorMessage;
    private String path;
    private String correlationId;
    private List<String> validationErrors;
    @Builder.Default
    private Instant timestamp = Instant.now();
}
