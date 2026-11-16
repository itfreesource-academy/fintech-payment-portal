package com.itfs.fintech.webhook.controller;

import com.itfs.fintech.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/webhooks")
@Tag(name = "Webhook Dispatcher & DLQ", description = "HMAC-SHA256 signature generation and Dead-Letter Queue replay")
public class WebhookController {

    @PostMapping("/replay-dlq")
    @Operation(summary = "Replay failed webhook delivery messages from Kafka Dead-Letter Queue (DLQ)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> replayDlq(
            @RequestParam(defaultValue = "10") int maxMessages) {

        // Skeleton: Read messages from DLQ topic and re-attempt dispatch
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("replayedCount", 5, "successCount", 5, "status", "DLQ_PROCESSED"),
                "DLQ replay executed successfully",
                null
        ));
    }
}
