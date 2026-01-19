package vn.backend.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.config.model.ApiResponse;
import vn.backend.core.service.CallHistoryService;
import vn.backend.core.util.CommonUtils;
import vn.backend.core.util.Mapper;
import vn.backend.entity.data.mysql.CallHistory;

import java.security.Principal;

@RestController
public class CallHistoryController extends BaseController {

    private static final String URI = "/callHistory/";

    @Autowired
    private CallHistoryService service;

    @GetMapping("/callHistory/list")
    public ResponseEntity<ApiResponse<Page<CallHistory>>> list(
            @RequestParam(name = "userId", required = false) Integer userId,
            @RequestParam(name = "customerId", required = false) Integer customerId,
            @RequestParam(name = "callType", required = false) Integer callType,
            @RequestParam(name = "status", required = false) Integer status,
            Pageable pageable,
            Principal principal) {

        checkPermission(principal, URI, "VIEW");
        var result = service.getByCriteria(userId, customerId, callType, status, pageable);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/callHistory/update")
    public ResponseEntity<ApiResponse<CallHistory>> upsert(
            @RequestBody CallHistory callHistory,
            Principal principal) {

        String action = (CommonUtils.NVL(callHistory.getId()) <= 0) ? "ADD" : "UPDATE";
        checkPermission(principal, URI, action);

        CallHistory result = (CommonUtils.NVL(callHistory.getId()) <= 0)
                ? service.insert(callHistory)
                : service.update(callHistory);

        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/callHistory/update-status")
    public ResponseEntity<ApiResponse<Integer>> updateStatus(
            @RequestParam(name = "id") Integer id,
            @RequestParam(name = "status") Integer status,
            Principal principal) {

        checkPermission(principal, URI, "UPDATE");
        var result = service.updateStatus(id, status);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @DeleteMapping("/callHistory/delete/{id}")
    public ResponseEntity<ApiResponse<Integer>> delete(
            @PathVariable(name = "id") Integer id,
            Principal principal) {

        checkPermission(principal, URI, "DELETE");
        var result = service.delete(id);
        return Mapper.map(result, ApiResponse::okEntity);
    }
}
