package com.itfs.fintech.settlement.controller;

import com.itfs.fintech.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/settlements")
@Tag(name = "Settlement Batch Processing", description = "Automated high-volume commission and tax batch execution")
public class SettlementJobController {

    private final JobLauncher jobLauncher;
    private final Job commissionAndTaxSettlementJob;

    public SettlementJobController(JobLauncher jobLauncher, Job commissionAndTaxSettlementJob) {
        this.jobLauncher = jobLauncher;
        this.commissionAndTaxSettlementJob = commissionAndTaxSettlementJob;
    }

    @PostMapping("/run-job")
    @Operation(summary = "Trigger the automated commission and tax settlement batch job")
    public ResponseEntity<ApiResponse<String>> triggerSettlementJob() throws Exception {
        JobParameters params = new JobParametersBuilder()
                .addLong("timestamp", System.currentTimeMillis())
                .toJobParameters();

        jobLauncher.run(commissionAndTaxSettlementJob, params);
        return ResponseEntity.ok(ApiResponse.success("JOB_TRIGGERED", "Settlement job started", null));
    }
}
