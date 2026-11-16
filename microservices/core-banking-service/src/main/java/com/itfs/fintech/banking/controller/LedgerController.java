package com.itfs.fintech.banking.controller;

import com.itfs.fintech.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/banking/ledger")
@Tag(name = "Core Banking & Ledger", description = "Double-entry accounting, account balances, and journal postings")
public class LedgerController {

    @PostMapping("/post-entry")
    @Operation(summary = "Post an atomic double-entry transaction (Debit = Credit)")
    public ResponseEntity<ApiResponse<String>> postJournalEntry(@RequestBody Map<String, Object> journalEntryRequest) {
        // Skeleton: Validate debit amount == credit amount, post atomic transaction
        return ResponseEntity.ok(ApiResponse.success("ENTRY_POSTED", "Journal entry posted successfully", null));
    }

    @PostMapping("/trigger-sweep")
    @Operation(summary = "Manually trigger auto-sweep from pooling accounts to institutional accounts")
    public ResponseEntity<ApiResponse<String>> triggerManualSweep() {
        // Skeleton: Execute sweep calculation
        return ResponseEntity.ok(ApiResponse.success("SWEEP_COMPLETED", "Auto-sweep executed successfully", null));
    }
}
