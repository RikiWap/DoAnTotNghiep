package vn.backend.core.data.report;

import lombok.Data;

@Data
public class CustomerSourceReport {
    private Integer sourceId;
    private String sourceName;
    private Long totalCustomer;
}