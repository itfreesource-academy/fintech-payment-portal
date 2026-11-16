package com.itfs.fintech.compliance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.itfs.fintech.compliance", "com.itfs.fintech.common"})
public class AmlComplianceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AmlComplianceApplication.class, args);
    }
}
