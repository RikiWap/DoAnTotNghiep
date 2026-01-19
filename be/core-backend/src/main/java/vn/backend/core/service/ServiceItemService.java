package vn.backend.core.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.repository.ServiceRepository;
import vn.backend.entity.data.mysql.ServiceItem;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executors;

@Slf4j(topic = "SERVICE-SERVICE")
@Service
public class ServiceItemService {

    @Autowired
    private ServiceRepository repository;

    public Page<ServiceItem> getListService(String keyword,
                                            Integer categoryId,
                                            Integer isCombo,
                                            Integer featured,
                                            Pageable pageable) {

        var executor = Executors.newFixedThreadPool(4);

        CompletableFuture<List<ServiceItem>> futureList = CompletableFuture.supplyAsync(
                () -> repository.getServiceByCriteria(keyword, categoryId, isCombo, featured, pageable), executor
        );

        CompletableFuture<Long> futureCount = CompletableFuture.supplyAsync(
                () -> repository.countServiceByCriteria(keyword, categoryId, isCombo, featured), executor
        );

        List<ServiceItem> list = futureList.join();
        Long total = futureCount.join();

        pageable.setTotal(total);
        executor.shutdown();
        return new Page<>(pageable, list);
    }

    public ServiceItem getServiceById(Integer id) {
        return repository.getServiceById(id);
    }

    public ServiceItem insertService(ServiceItem service) {
        return repository.insertService(service);
    }

    public ServiceItem updateService(ServiceItem service) {
        return repository.updateService(service);
    }

    public Integer deleteService(Integer id) {
        return repository.deleteService(id);
    }
}
