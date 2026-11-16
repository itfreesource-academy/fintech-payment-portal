package com.itfs.fintech.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.itfs.fintech.auth", "com.itfs.fintech.common"})
public class AuthIdentityApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthIdentityApplication.class, args);
    }
}
