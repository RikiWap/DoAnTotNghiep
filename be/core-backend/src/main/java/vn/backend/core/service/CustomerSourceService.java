package vn.backend.core.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.repository.CustomerSourceRepository;
import vn.backend.entity.data.mysql.CustomerSource;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Slf4j(topic = "CUSTOMER-SOURCE-SERVICE")
@Service
@RequiredArgsConstructor
public class CustomerSourceService {

    private final CustomerSourceRepository repository;

    public Page<CustomerSource> getByCriteria(
            String name,
            Integer status,
            Pageable pageable) {

        CompletableFuture<List<CustomerSource>> futureList =
                CompletableFuture.supplyAsync(() ->
                        repository.getByCriteria(name, status, pageable));

        CompletableFuture<Long> futureCount =
                CompletableFuture.supplyAsync(() ->
                        repository.countByCriteria(name, status));

        List<CustomerSource> list = futureList.join();
        Long count = futureCount.join();

        pageable.setTotal(count);
        return new Page<>(pageable, list);
    }

    public CustomerSource insert(CustomerSource source) {
        return repository.insert(source);
    }

    public CustomerSource update(CustomerSource source) {
        return repository.update(source);
    }

    public Integer updateStatus(Integer id, Integer status) {
        return repository.updateStatus(id, status);
    }

    public Integer delete(Integer id) {
        return repository.delete(id);
    }
}
