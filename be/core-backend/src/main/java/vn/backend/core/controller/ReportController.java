package vn.backend.core.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.config.model.ApiResponse;
import vn.backend.core.data.report.*;
import vn.backend.core.service.ReportService;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/report")
public class ReportController extends BaseController {

    private static final String URI = "                                ";

    @Autowired
    private ReportService service;

    /**
     * Biểu đồ cột: khách hàng theo tháng
     */
    @GetMapping("/customer/by-month")
    public ResponseEntity<ApiResponse<List<CustomerMonthlyReport>>> reportByMonth(
            @RequestParam(name = "year") Integer year,
            Principal principal) {

        checkPermission(principal, URI, "VIEW");
        return ResponseEntity.ok(ApiResponse.ok(service.getCustomerByMonth(year)));
    }

    /**
     * Biểu đồ tròn: khách hàng theo nguồn
     */
    @GetMapping("/customer/by-source")
    public ResponseEntity<ApiResponse<List<CustomerSourceReport>>> reportBySource(
            @RequestParam(name = "year") Integer year,
            Principal principal) {

        checkPermission(principal, URI, "VIEW");
        return ResponseEntity.ok(ApiResponse.ok(service.getCustomerBySource(year)));
    }

    /**
     * Tổng doanh thu trong tháng
     */
    @GetMapping("/invoice/monthly-revenue")
    public ResponseEntity<ApiResponse<InvoiceMonthlyRevenueReport>> monthlyRevenue(
            @RequestParam(name = "year") Integer year,
            @RequestParam(name = "month") Integer month,
            Principal principal) {

        checkPermission(principal, URI, "VIEW");
        return ResponseEntity.ok(ApiResponse.ok(
                service.getMonthlyRevenue(year, month)
        ));
    }

    /**
     * Tần suất mua bán trong tháng
     */
    @GetMapping("/invoice/frequency")
    public ResponseEntity<ApiResponse<Page<InvoiceFrequencyReport>>> frequency(
            @RequestParam(name = "year") Integer year,
            @RequestParam(name = "month") Integer month,
            Principal principal,
            Pageable pageable) {

        checkPermission(principal, URI, "VIEW");
        return ResponseEntity.ok(ApiResponse.ok(
                service.getInvoiceFrequency(year, month, pageable)
        ));
    }

    @GetMapping("/callHistory/avg-interest")
    public ResponseEntity<ApiResponse<Page<CustomerInterestAvgReport>>> avgInterest(
            @RequestParam(name = "keyword", required = false) String keyword,
            Pageable pageable,
            Principal principal) {

        checkPermission(principal, URI, "VIEW");
        var result = service
                .getAvgInterestByCustomer(keyword, pageable);

        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/callHistory/interest-bar")
    public ResponseEntity<ApiResponse<List<CustomerInterestMonthlyBarReport>>> interestBar(
            @RequestParam(name = "year") Integer year,
            @RequestParam(name = "minAvgInterest") Double minAvgInterest,
            Principal principal) {

        checkPermission(principal, URI, "VIEW");

        return ResponseEntity.ok(ApiResponse.ok(
                service
                        .getMonthlyInterestBar(year, minAvgInterest)
        ));
    }
}
