package com.itfs.fintech.settlement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.itfs.fintech.settlement", "com.itfs.fintech.common"})
public class SettlementBatchApplication {

    public static void main(String[] args) {
        SpringApplication.run(SettlementBatchApplication.class, args);
    }
}
