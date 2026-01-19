package vn.backend.core.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.repository.CallHistoryRepository;
import vn.backend.entity.data.mysql.CallHistory;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Slf4j(topic = "CALL-HISTORY-SERVICE")
@Service
@RequiredArgsConstructor
public class CallHistoryService {

    private final CallHistoryRepository repository;

    public Page<CallHistory> getByCriteria(
            Integer userId,
            Integer customerId,
            Integer callType,
            Integer status,
            Pageable pageable) {

        CompletableFuture<List<CallHistory>> futureList =
                CompletableFuture.supplyAsync(() ->
                        repository.getByCriteria(userId, customerId, callType, status, pageable));

        CompletableFuture<Long> futureCount =
                CompletableFuture.supplyAsync(() ->
                        repository.countByCriteria(userId, customerId, callType, status));

        List<CallHistory> list = futureList.join();
        Long count = futureCount.join();

        pageable.setTotal(count);
        return new Page<>(pageable, list);
    }

    public CallHistory insert(CallHistory callHistory) {
        return repository.insert(callHistory);
    }

    public CallHistory update(CallHistory callHistory) {
        return repository.update(callHistory);
    }

    public Integer updateStatus(Integer id, Integer status) {
        return repository.updateStatus(id, status);
    }

    public Integer delete(Integer id) {
        return repository.delete(id);
    }
}
