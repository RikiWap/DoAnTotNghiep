package vn.backend.core.data.report;


import lombok.Data;

@Data
public class InvoiceFrequencyReport {
    private Integer customerId;
    private String customerName;
    private Long totalInvoice;
    private Double totalFee;
    private Double avgFee;
}