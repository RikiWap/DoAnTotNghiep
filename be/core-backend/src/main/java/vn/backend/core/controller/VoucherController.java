package vn.backend.core.controller;

import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.config.model.ApiResponse;
import vn.backend.core.service.VoucherService;
import vn.backend.core.util.CommonUtils;
import vn.backend.core.util.Mapper;
import vn.backend.entity.data.mysql.Voucher;

import java.security.Principal;

@RestController
@AllArgsConstructor
public class VoucherController extends BaseController {

    private static final String URI = "/voucher/";
    private VoucherService voucherService;

    @GetMapping("/voucher/list")
    public ResponseEntity<ApiResponse<Page<Voucher>>> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Integer branchId,
            Pageable pageable,
            Principal principal
    ) {
        checkPermission(principal, URI, "VIEW");
        return Mapper.map(voucherService.getList(keyword, status, branchId, pageable), ApiResponse::okEntity);
    }

    @GetMapping("/voucher/get")
    public ResponseEntity<ApiResponse<Voucher>> get(
            @RequestParam Integer id,
            Principal principal
    ) {
        checkPermission(principal, URI, "VIEW");
        return Mapper.map(voucherService.getById(id), ApiResponse::okEntity);
    }

    @GetMapping("/voucher/getByCode")
    public ResponseEntity<ApiResponse<Voucher>> getByCode(
            @RequestParam String code,
            Principal principal
    ) {
        checkPermission(principal, URI, "VIEW");
        return Mapper.map(voucherService.getByCode(code), ApiResponse::okEntity);
    }

    @PostMapping("/voucher/update")
    public ResponseEntity<ApiResponse<Voucher>> upsert(
            @RequestBody Voucher v,
            Principal principal
    ) {
        String action = CommonUtils.NVL(v.getId()) <= 0 ? "ADD" : "UPDATE";
        checkPermission(principal, URI, action);

        Voucher result = CommonUtils.NVL(v.getId()) <= 0
                ? voucherService.insert(v)
                : voucherService.update(v);

        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/voucher/applyVoucher")
    public ResponseEntity<ApiResponse<Double>> applyVoucher(
            @RequestParam Integer invoiceId,
            @RequestParam String voucherCode,
            @RequestParam Double amount,
            Principal principal
    ) {
        checkPermission(principal, URI, "UPDATE");

        Double result = voucherService.applyVoucher(invoiceId, voucherCode, amount);

        return Mapper.map(result, ApiResponse::okEntity);
    }

    @DeleteMapping("/voucher/delete/{id}")
    public ResponseEntity<ApiResponse<Integer>> delete(
            @PathVariable Integer id,
            Principal principal
    ) {
        checkPermission(principal, URI, "DELETE");
        return Mapper.map(voucherService.delete(id), ApiResponse::okEntity);
    }
}
