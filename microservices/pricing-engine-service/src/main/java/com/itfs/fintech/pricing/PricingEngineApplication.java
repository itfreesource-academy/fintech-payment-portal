package com.itfs.fintech.pricing;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.itfs.fintech.pricing", "com.itfs.fintech.common"})
public class PricingEngineApplication {

    public static void main(String[] args) {
        SpringApplication.run(PricingEngineApplication.class, args);
    }
}
