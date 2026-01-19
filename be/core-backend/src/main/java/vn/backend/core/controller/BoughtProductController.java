package vn.backend.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.config.model.ApiResponse;
import vn.backend.core.service.BoughtProductService;
import vn.backend.core.util.CommonUtils;
import vn.backend.core.util.Mapper;
import vn.backend.entity.data.mysql.BoughtProduct;

import java.security.Principal;

@RestController
public class BoughtProductController extends BaseController {

    private static final String URI = "/boughtProduct/";

    @Autowired
    private BoughtProductService service;

    /**
     * Danh sách sản phẩm trong hóa đơn (nháp / đã thanh toán)
     */
    @GetMapping("/boughtProduct/list")
    public ResponseEntity<ApiResponse<Page<BoughtProduct>>> list(
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
     * Chi tiết sản phẩm đã mua
     */
    @GetMapping("/boughtProduct/get")
    public ResponseEntity<ApiResponse<BoughtProduct>> get(
            @RequestParam Integer id,
            Principal principal
    ) {
        checkPermission(principal, URI, "VIEW");
        return Mapper.map(service.getById(id), ApiResponse::okEntity);
    }

    /**
     * Thêm / cập nhật sản phẩm vào hóa đơn
     * status = 1 → hóa đơn nháp
     */
    @PostMapping("/boughtProduct/update")
    public ResponseEntity<ApiResponse<BoughtProduct>> update(
            @RequestBody BoughtProduct product,
            Principal principal
    ) {
        String action = CommonUtils.NVL(product.getId()) <= 0 ? "ADD" : "UPDATE";
        checkPermission(principal, URI, action);

        BoughtProduct result = CommonUtils.NVL(product.getId()) <= 0
                ? service.insert(product)
                : service.update(product);

        return Mapper.map(result, ApiResponse::okEntity);
    }

    /**
     * Xóa sản phẩm khỏi hóa đơn
     */
    @DeleteMapping("/boughtProduct/delete/{id}")
    public ResponseEntity<ApiResponse<Integer>> delete(
            @PathVariable Integer id,
            Principal principal
    ) {
        checkPermission(principal, URI, "DELETE");
        return Mapper.map(service.delete(id), ApiResponse::okEntity);
    }
}
