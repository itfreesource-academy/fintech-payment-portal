package com.itfs.fintech.payment.controller;

import com.itfs.fintech.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@Tag(name = "Payments & Orders", description = "Transactional Idempotent Payment Submissions")
public class PaymentController {

    @PostMapping("/charge")
    @Operation(summary = "Submit a payment transaction with Idempotency Key protection")
    public ResponseEntity<ApiResponse<Map<String, Object>>> processPayment(
            @Parameter(description = "Unique client-generated idempotency key", required = true)
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @RequestBody Map<String, Object> paymentPayload) {

        // Skeleton:
        // 1. Check Redis for idempotencyKey existence (SET key val NX EX 300)
        // 2. If present: return previously cached response immediately (deduplication)
        // 3. If new: publish PaymentInitiatedEvent to Kafka topic, trigger gRPC fulfillment, return result
        return ResponseEntity.ok(ApiResponse.success(
                Map.of(
                        "paymentId", "PAY-" + System.currentTimeMillis(),
                        "idempotencyKey", idempotencyKey,
                        "status", "SETTLED"
                ),
                "Payment processed successfully with idempotency defense",
                null
        ));
    }
}
