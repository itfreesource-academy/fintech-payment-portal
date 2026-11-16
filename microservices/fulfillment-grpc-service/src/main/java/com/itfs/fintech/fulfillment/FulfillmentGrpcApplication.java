package com.itfs.fintech.fulfillment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.itfs.fintech.fulfillment", "com.itfs.fintech.common"})
public class FulfillmentGrpcApplication {

    public static void main(String[] args) {
        SpringApplication.run(FulfillmentGrpcApplication.class, args);
    }
}
