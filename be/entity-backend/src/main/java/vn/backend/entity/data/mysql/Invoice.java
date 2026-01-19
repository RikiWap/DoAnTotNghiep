package vn.backend.entity.data.mysql;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Invoice {
    private Integer id;
    private String invoiceCode;
    private String invoiceType;
    private Double amount;
    private Double discount;
    private Double vatAmount;
    private Double fee;
    private Double amountCard;
    private Double paid;
    private Double debt;
    private Integer paymentType;
    private Integer status;
    private Integer statusTemp;
    private String receiptImage;
    private LocalDateTime receiptDate;
    private LocalDateTime createdTime;
    private LocalDateTime updatedTime;
    private Integer userId;
    private Integer customerId;
    private Integer branchId;

    private String voucherCode;

    // JOIN thêm
    private String customerName;
    private String userName;
}
