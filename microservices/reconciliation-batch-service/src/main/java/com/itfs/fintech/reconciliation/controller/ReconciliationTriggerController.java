package com.itfs.fintech.reconciliation.controller;

import com.itfs.fintech.common.dto.ApiResponse;
import com.itfs.fintech.reconciliation.service.VirtualThreadReconciler;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.IntStream;

@RestController
@RequestMapping("/api/v1/reconciliation")
@Tag(name = "High-Throughput Reconciliation", description = "Java 21 Virtual Threads 100K+ benchmark trigger")
public class ReconciliationTriggerController {

    private final VirtualThreadReconciler reconciler;

    public ReconciliationTriggerController(VirtualThreadReconciler reconciler) {
        this.reconciler = reconciler;
    }

    @PostMapping("/run-benchmark")
    @Operation(summary = "Trigger high-throughput reconciliation benchmark for 100K synthetic records")
    public ResponseEntity<ApiResponse<VirtualThreadReconciler.ReconciliationResult>> triggerBenchmark(
            @RequestParam(defaultValue = "100000") int count) {

        List<String> mockRecordIds = IntStream.range(0, count)
                .mapToObj(i -> "REC-" + i)
                .toList();

        VirtualThreadReconciler.ReconciliationResult result = reconciler.reconcileDataBatch(mockRecordIds);
        return ResponseEntity.ok(ApiResponse.success(result, "Reconciliation benchmark completed", null));
    }
}
