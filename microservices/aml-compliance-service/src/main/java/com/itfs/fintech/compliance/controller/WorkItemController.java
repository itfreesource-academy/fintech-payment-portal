package com.itfs.fintech.compliance.controller;

import com.itfs.fintech.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/work-items")
@Tag(name = "Work Items & Alert Ingestion", description = "Dual XML/JSON Work Item creation with strict Schema validation")
public class WorkItemController {

    /**
     * Dual XML & JSON ingestion endpoint:
     * Accepts both application/json and application/xml
     */
    @PostMapping(
            consumes = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE},
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    @Operation(summary = "Ingest Work Item / Alert with dual XML and JSON support")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createWorkItem(
            @RequestBody Map<String, Object> payload,
            @RequestHeader(value = "Content-Type") String contentType) {

        // Skeleton:
        // 1. Run JSON Schema pre-validation rules (or XML XSD validation if XML)
        // 2. Reject non-compliant records before persisting
        // 3. Persist work item with full state stored in PostgreSQL JSONB
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("workItemId", "WI-" + System.currentTimeMillis(), "status", "VALIDATED"),
                "Work item created successfully via " + contentType,
                null
        ));
    }
}
