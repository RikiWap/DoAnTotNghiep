package vn.backend.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.config.model.ApiResponse;
import vn.backend.core.service.BoughtServiceService;
import vn.backend.core.util.CommonUtils;
import vn.backend.core.util.Mapper;
import vn.backend.entity.data.mysql.BoughtService;

import java.security.Principal;

@RestController
public class BoughtServiceController extends BaseController {

    private static final String URI = "/boughtService/";

    @Autowired
    private BoughtServiceService service;

    /**
     * Danh sách dịch vụ trong hóa đơn
     */
    @GetMapping("/boughtService/list")
    public ResponseEntity<ApiResponse<Page<BoughtService>>> list(
            @RequestParam(required = false) Integer invoiceId,
            @RequestParam(required = false) Integer status,
            Pageable pageable,
            Principal principal
    ) {
        checkPermission(principal, URI, "VIEW");
        var result = service.getByCriteria(invoiceId, status, pageable);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    /**
     * Chi tiết dịch vụ đã mua
     */
    @GetMapping("/boughtService/get")
    public ResponseEntity<ApiResponse<BoughtService>> get(
            @RequestParam Integer id,
            Principal principal
    ) {
        checkPermission(principal, URI, "VIEW");
        return Mapper.map(service.getById(id), ApiResponse::okEntity);
    }

    /**
     * Thêm / cập nhật dịch vụ vào hóa đơn
     */
    @PostMapping("/boughtService/update")
    public ResponseEntity<ApiResponse<BoughtService>> update(
            @RequestBody BoughtService boughtService,
            Principal principal
    ) {
        String action = CommonUtils.NVL(boughtService.getId()) <= 0 ? "ADD" : "UPDATE";
        checkPermission(principal, URI, action);

        BoughtService result = CommonUtils.NVL(boughtService.getId()) <= 0
                ? service.insert(boughtService)
                : service.update(boughtService);

        return Mapper.map(result, ApiResponse::okEntity);
    }

    /**
     * Xóa dịch vụ khỏi hóa đơn
     */
    @DeleteMapping("/boughtService/delete/{id}")
    public ResponseEntity<ApiResponse<Integer>> delete(
            @PathVariable Integer id,
            Principal principal
    ) {
        checkPermission(principal, URI, "DELETE");
        return Mapper.map(service.delete(id), ApiResponse::okEntity);
    }
}
