package vn.backend.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.config.model.ApiResponse;
import vn.backend.core.service.CustomerSourceService;
import vn.backend.core.util.CommonUtils;
import vn.backend.core.util.Mapper;
import vn.backend.entity.data.mysql.CustomerSource;

import java.security.Principal;

@RestController
public class CustomerSourceController extends BaseController {

    private static final String URI = "/customerSource/";

    @Autowired
    private CustomerSourceService service;

    @GetMapping("/customerSource/list")
    public ResponseEntity<ApiResponse<Page<CustomerSource>>> list(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "status", required = false) Integer status,
            Pageable pageable,
            Principal principal) {

        checkPermission(principal, URI, "VIEW");
        var result = service.getByCriteria(keyword, status, pageable);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/customerSource/update")
    public ResponseEntity<ApiResponse<CustomerSource>> upsert(
            @RequestBody CustomerSource source,
            Principal principal) {

        String action = (CommonUtils.NVL(source.getId()) <= 0) ? "ADD" : "UPDATE";
        checkPermission(principal, URI, action);

        CustomerSource result = (CommonUtils.NVL(source.getId()) <= 0)
                ? service.insert(source)
                : service.update(source);

        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/customerSource/update-status")
    public ResponseEntity<ApiResponse<Integer>> updateStatus(
            @RequestParam(name = "id") Integer id,
            @RequestParam(name = "status") Integer status,
            Principal principal) {

        checkPermission(principal, URI, "UPDATE");
        var result = service.updateStatus(id, status);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @DeleteMapping("/customerSource/delete/{id}")
    public ResponseEntity<ApiResponse<Integer>> delete(
            @PathVariable(name = "id") Integer id,
            Principal principal) {

        checkPermission(principal, URI, "DELETE");
        var result = service.delete(id);
        return Mapper.map(result, ApiResponse::okEntity);
    }
}
