package com.itfs.fintech.reconciliation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.itfs.fintech.reconciliation", "com.itfs.fintech.common"})
public class ReconciliationBatchApplication {

    public static void main(String[] args) {
        SpringApplication.run(ReconciliationBatchApplication.class, args);
    }
}
