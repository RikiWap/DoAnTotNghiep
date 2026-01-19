package vn.backend.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.config.model.ApiResponse;
import vn.backend.core.service.CustomerAttributeService;
import vn.backend.core.util.CommonUtils;
import vn.backend.core.util.Mapper;
import vn.backend.entity.data.mysql.CustomerAttribute;

import java.security.Principal;

@RestController
public class CustomerAttributeController extends BaseController {

    private static final String URI = "/customerAttribute/";

    @Autowired
    private CustomerAttributeService service;

    /**
     * Danh sách Customer Attribute (tìm kiếm & phân trang)
     */
    @GetMapping("/customerAttribute/list")
    public ResponseEntity<ApiResponse<Page<CustomerAttribute>>> listCustomerAttributes(
            @RequestParam(required = false) Integer isParent,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String dataType,
            Pageable pageable,
            Principal principal
    ) {
        checkPermission(principal, URI, "VIEW");
        var result = service.getListCustomerAttributeByCriteria(isParent, keyword, dataType, pageable);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    /**
     * Lấy chi tiết Customer Attribute
     */
    @GetMapping("/customerAttribute/get")
    public ResponseEntity<ApiResponse<CustomerAttribute>> getCustomerAttribute(
            @RequestParam Integer id,
            Principal principal
    ) {
        checkPermission(principal, URI, "VIEW");
        var result = service.getCustomerAttributeById(id);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    /**
     * Thêm hoặc cập nhật Customer Attribute (Upsert)
     */
    @PostMapping("/customerAttribute/update")
    public ResponseEntity<ApiResponse<CustomerAttribute>> upsertCustomerAttribute(
            @RequestBody CustomerAttribute attr,
            Principal principal
    ) {
        String action = (CommonUtils.NVL(attr.getId()) <= 0) ? "ADD" : "UPDATE";
        checkPermission(principal, URI, action);

        CustomerAttribute result = (CommonUtils.NVL(attr.getId()) <= 0)
                ? service.insertCustomerAttribute(attr)
                : service.updateCustomerAttribute(attr);

        return Mapper.map(result, ApiResponse::okEntity);
    }

    /**
     * Xóa Customer Attribute
     */
    @DeleteMapping("/customerAttribute/delete/{id}")
    public ResponseEntity<ApiResponse<Integer>> deleteCustomerAttribute(
            @PathVariable Integer id,
            Principal principal
    ) {
        checkPermission(principal, URI, "DELETE");
        var result = service.deleteCustomerAttribute(id);
        return Mapper.map(result, ApiResponse::okEntity);
    }
}