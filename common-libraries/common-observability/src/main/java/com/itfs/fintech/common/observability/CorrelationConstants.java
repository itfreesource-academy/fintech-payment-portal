package com.itfs.fintech.common.observability;

public final class CorrelationConstants {
    public static final String CORRELATION_ID_HEADER = "X-Correlation-ID";
    public static final String CORRELATION_ID_MDC_KEY = "correlationId";

    private CorrelationConstants() {}
}
