package vn.backend.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.config.model.ApiResponse;
import vn.backend.core.service.ServiceItemService;
import vn.backend.core.util.CommonUtils;
import vn.backend.core.util.Mapper;
import vn.backend.entity.data.mysql.ServiceItem;
import vn.backend.entity.data.mysql.User;

import java.security.Principal;

@RestController
public class ServiceItemController extends BaseController {

    private static final String URI = "/service/";

    @Autowired
    private ServiceItemService serviceItemService;

    @GetMapping("/service/list")
    public ResponseEntity<ApiResponse<Page<ServiceItem>>> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Integer isCombo,
            @RequestParam(required = false) Integer featured,
            Pageable pageable,
            Principal principal) {

        checkPermission(principal, URI, "VIEW");
        var result = serviceItemService.getListService(keyword, categoryId, isCombo, featured, pageable);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @GetMapping("/service/get")
    public ResponseEntity<ApiResponse<ServiceItem>> get(
            @RequestParam Integer id,
            Principal principal) {

        checkPermission(principal, URI, "VIEW");
        var result = serviceItemService.getServiceById(id);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/service/update")
    public ResponseEntity<ApiResponse<ServiceItem>> update(
            @RequestBody ServiceItem service,
            Principal principal) {

        String action = (CommonUtils.NVL(service.getId()) <= 0) ? "ADD" : "UPDATE";
        User login = checkPermission(principal, URI, action);

        ServiceItem result = (CommonUtils.NVL(service.getId()) <= 0)
                ? serviceItemService.insertService(service)
                : serviceItemService.updateService(service);

        return Mapper.map(result, ApiResponse::okEntity);
    }

    @DeleteMapping("/service/delete/{id}")
    public ResponseEntity<ApiResponse<Integer>> delete(
            @PathVariable Integer id,
            Principal principal) {

        checkPermission(principal, URI, "DELETE");
        var result = serviceItemService.deleteService(id);
        return Mapper.map(result, ApiResponse::okEntity);
    }
}
