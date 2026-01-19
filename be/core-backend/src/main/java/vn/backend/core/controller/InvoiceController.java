package vn.backend.core.controller;

import vn.backend.core.service.InvoiceService;
import vn.backend.core.util.SecurityUtils;
import vn.backend.entity.data.mysql.Invoice;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.config.model.ApiResponse;
import vn.backend.core.util.CommonUtils;
import vn.backend.core.util.Mapper;
import vn.backend.entity.data.mysql.User;

import java.security.Principal;

@RestController
public class InvoiceController extends BaseController {

    private static final String URI = "/invoice/";

    @Autowired
    private InvoiceService service;

    @GetMapping("/invoice/list")
    public ResponseEntity<ApiResponse<Page<Invoice>>> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer customerId,
            @RequestParam(required = false) Integer status,
            Pageable pageable,
            Principal principal
    ) {
        checkPermission(principal, URI, "VIEW");
        var result = service.getListByCriteria(keyword, customerId, status, pageable);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @GetMapping("/invoice/get")
    public ResponseEntity<ApiResponse<Invoice>> get(
            @RequestParam Integer id,
            Principal principal
    ) {
        checkPermission(principal, URI, "VIEW");
        var result = service.getById(id);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/invoice/update")
    public ResponseEntity<ApiResponse<Invoice>> upsert(
            @RequestBody Invoice invoice,
            Principal principal
    ) {
        String action = (CommonUtils.NVL(invoice.getId()) <= 0) ? "ADD" : "UPDATE";
        User login = checkPermission(principal, URI, action);
        invoice.setUserId(login.getId());
        invoice.setBranchId(login.getBranchId());

        Invoice result = (CommonUtils.NVL(invoice.getId()) <= 0)
                ? service.insert(invoice)
                : service.update(invoice);

        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/invoice/updateStatus")
    public ResponseEntity<ApiResponse<Integer>> upsert(
            @RequestParam Integer invoiceId,
            @RequestParam Integer status,
            Principal principal
    ) {
        String action = "UPDATE";
        checkPermission(principal, URI, action);

        Integer result = service.updateStatus(invoiceId, status);

        return Mapper.map(result, ApiResponse::okEntity);
    }

    @DeleteMapping("/invoice/delete/{id}")
    public ResponseEntity<ApiResponse<Integer>> delete(
            @PathVariable Integer id,
            Principal principal
    ) {
        checkPermission(principal, URI, "DELETE");
        var result = service.delete(id);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @GetMapping("/invoice/draft")
    public ResponseEntity<ApiResponse<Invoice>> getOrCreateDraft(
            @RequestParam Integer customerId,
            Principal principal
    ) {
        User login = checkPermission(principal, URI, "ADD");

        Invoice result = service.getOrCreateDraftInvoice(
                customerId,
                login.getId(),
                login.getBranchId()
        );

        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/invoice/recalculate")
    public ResponseEntity<ApiResponse<Invoice>> recalculate(
            @RequestParam Integer invoiceId,
            Principal principal
    ) {
        checkPermission(principal, URI, "UPDATE");

        Invoice result = service.recalculateDraftAmount(invoiceId);
        return Mapper.map(result, ApiResponse::okEntity);
    }
}
