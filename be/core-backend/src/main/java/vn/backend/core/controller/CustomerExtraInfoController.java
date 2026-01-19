package vn.backend.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.core.config.model.ApiResponse;
import vn.backend.core.service.CustomerExtraInfoService;
import vn.backend.core.util.Mapper;
import vn.backend.entity.data.mysql.CustomerExtraInfo;

import java.security.Principal;
import java.util.List;

@RestController
public class CustomerExtraInfoController extends BaseController {

    private static final String URI = "/customerAttribute/";

    @Autowired
    private CustomerExtraInfoService service;

    /**
     * Lấy danh sách thông tin bổ sung của 1 khách hàng
     */
    @GetMapping("/customerExtraInfo/list")
    public ResponseEntity<ApiResponse<List<CustomerExtraInfo>>> listCustomerExtraInfo(
            @RequestParam(defaultValue = "0") Integer customerId,
            Principal principal
    ) {
        checkPermission(principal, URI, "VIEW");
        var result = service.getCustomerExtraInfoByCustomerId(customerId);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    /**
     * Thêm mới 1 batch Customer Extra Info
     */
    @PostMapping("/customerExtraInfo/add-batch")
    public ResponseEntity<ApiResponse<List<CustomerExtraInfo>>> addBatch(
            @RequestBody List<CustomerExtraInfo> list,
            @RequestParam Integer customerId,
            Principal principal
    ) {
        checkPermission(principal, URI, "ADD");
        var result = service.insertBatchCustomerExtraInfo(list, customerId);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    /**
     * Cập nhật hàng loạt thông tin bổ sung
     */
    @PostMapping("/customerExtraInfo/update-batch")
    public ResponseEntity<ApiResponse<List<CustomerExtraInfo>>> updateBatch(
            @RequestBody List<CustomerExtraInfo> list,
            Principal principal
    ) {
        checkPermission(principal, URI, "UPDATE");
        var result = service.updateBatchCustomerExtraInfo(list);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    /**
     * Xóa danh sách thông tin bổ sung theo customerId + attributeIds
     */
    @DeleteMapping("/customerExtraInfo/delete-batch")
    public ResponseEntity<ApiResponse<Integer>> deleteBatch(
            @RequestBody List<CustomerExtraInfo> list,
            @RequestParam Integer customerId,
            Principal principal
    ) {
        checkPermission(principal, URI, "DELETE");
        var result = service.deleteCustomerExtraInfos(list, customerId);
        return Mapper.map(result, ApiResponse::okEntity);
    }
}
