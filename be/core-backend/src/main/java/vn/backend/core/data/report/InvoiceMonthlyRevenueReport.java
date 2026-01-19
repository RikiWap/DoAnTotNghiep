package vn.backend.core.data.report;

import lombok.Data;

@Data
public class InvoiceMonthlyRevenueReport {
    private Integer year;
    private Integer month;
    private Double totalRevenue;
}