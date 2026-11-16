package com.itfs.fintech.fulfillment.grpc;

import com.itfs.fintech.grpc.FulfillmentRequest;
import com.itfs.fintech.grpc.FulfillmentResponse;
import com.itfs.fintech.grpc.OrderStatusRequest;
import com.itfs.fintech.grpc.OrderStatusResponse;
import com.itfs.fintech.grpc.OrderFulfillmentGrpcServiceGrpc;
import io.grpc.stub.StreamObserver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class OrderFulfillmentGrpcServiceImpl extends OrderFulfillmentGrpcServiceGrpc.OrderFulfillmentGrpcServiceImplBase {

    private static final Logger log = LoggerFactory.getLogger(OrderFulfillmentGrpcServiceImpl.class);

    @Override
    public void processFulfillment(FulfillmentRequest request, StreamObserver<FulfillmentResponse> responseObserver) {
        log.info("Received gRPC fulfillment request for orderId: {}, idempotencyKey: {}",
                request.getOrderId(), request.getIdempotencyKey());

        // Skeleton: Execute internal fulfillment logic, inventory allocation
        FulfillmentResponse response = FulfillmentResponse.newBuilder()
                .setFulfillmentId(UUID.randomUUID().toString())
                .setStatus("CONFIRMED")
                .setMessage("Order fulfilled successfully via gRPC")
                .setTimestamp(Instant.now().toEpochMilli())
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void checkOrderStatus(OrderStatusRequest request, StreamObserver<OrderStatusResponse> responseObserver) {
        OrderStatusResponse response = OrderStatusResponse.newBuilder()
                .setOrderId(request.getOrderId())
                .setStatus("COMPLETED")
                .setLastUpdated(Instant.now().toString())
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
