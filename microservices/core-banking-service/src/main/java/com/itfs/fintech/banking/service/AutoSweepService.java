package com.itfs.fintech.banking.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/**
 * Replicates the State Bank of India (SBI) EasyCollect auto-sweep facility:
 * Automatically balances daily collections across pooling accounts and sweeps
 * excess balances above defined threshold to main institutional accounts.
 */
@Service
public class AutoSweepService {

    private static final Logger log = LoggerFactory.getLogger(AutoSweepService.class);

    // E.g., threshold of 100,000 above which balance is auto-swept
    private static final BigDecimal SWEEP_THRESHOLD = new BigDecimal("100000.00");

    @Scheduled(cron = "0 0 23 * * ?") // Runs daily at 11:00 PM
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public void executeDailyAutoSweep() {
        log.info("Starting daily auto-sweep job across pooling accounts...");
        // Skeleton: Query pooling accounts with balance > SWEEP_THRESHOLD,
        // create double-entry journal transfers to institutional treasury account.
    }
}
