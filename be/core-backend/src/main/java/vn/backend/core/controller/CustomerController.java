package vn.backend.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.config.model.ApiResponse;
import vn.backend.core.service.CustomerService;
import vn.backend.core.util.CommonUtils;
import vn.backend.core.util.Mapper;
import vn.backend.entity.data.mysql.Customer;
import vn.backend.entity.data.mysql.User;

import java.security.Principal;

@RestController
public class CustomerController extends BaseController {

    private static final String URI = "/customer/";

    @Autowired
    private CustomerService customerService;

    /**
     * Danh sách khách hàng (tìm kiếm & phân trang)
     */
    @GetMapping("/customer/list")
    public ResponseEntity<ApiResponse<Page<Customer>>> listCustomers(
            @RequestParam(required = false) String keyword,
            Pageable pageable,
            Principal principal
    ) {
        checkPermission(principal, URI, "VIEW");
        var result = customerService.getListCustomerByCriteria(keyword, pageable);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    /**
     * Lấy chi tiết khách hàng
     */
    @GetMapping("/customer/get")
    public ResponseEntity<ApiResponse<Customer>> getCustomerDetail(
            @RequestParam Integer id,
            Principal principal
    ) {
        checkPermission(principal, URI, "VIEW");
        var result = customerService.getCustomerById(id);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    /**
     * Thêm hoặc cập nhật khách hàng (Upsert)
     */
    @PostMapping("/customer/update")
    public ResponseEntity<ApiResponse<Customer>> upsertCustomer(
            @RequestBody Customer customer,
            Principal principal
    ) {
        String action = (CommonUtils.NVL(customer.getId()) <= 0) ? "ADD" : "UPDATE";
        User login = checkPermission(principal, URI, action);
        customer.setCreatorId(login.getId());
        Customer result = (CommonUtils.NVL(customer.getId()) <= 0)
                ? customerService.insertCustomer(customer)
                : customerService.updateCustomer(customer);

        return Mapper.map(result, ApiResponse::okEntity);
    }

    /**
     * Xóa khách hàng
     */
    @DeleteMapping("/customer/delete/{id}")
    public ResponseEntity<ApiResponse<Integer>> deleteCustomer(
            @PathVariable Integer id,
            Principal principal
    ) {
        checkPermission(principal, URI, "DELETE");
        var result = customerService.deleteCustomer(id);
        return Mapper.map(result, ApiResponse::okEntity);
    }
}
