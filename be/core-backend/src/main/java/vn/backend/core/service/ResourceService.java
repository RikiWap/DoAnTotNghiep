package vn.backend.core.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.repository.ResourceRepository;
import vn.backend.entity.data.mysql.Resource;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Slf4j(topic = "RESOURCE-SERVICE")
@Service
public class ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    public Page<Resource> getListResourceByCriteria(String name, Integer active, Pageable pageable) {
        CompletableFuture<List<Resource>> futureList = CompletableFuture.supplyAsync(
                () -> resourceRepository.getResourceByCriteria(name, active, pageable)
        );
        CompletableFuture<Long> futureCount = CompletableFuture.supplyAsync(
                () -> resourceRepository.countResourceByCriteria(name, active)
        );

        List<Resource> list = futureList.join();
        Long count = futureCount.join();

        pageable.setTotal(count);
        return new Page<>(pageable, list);
    }

    public Resource getResourceById(Integer id) {
        return resourceRepository.getResourceById(id);
    }

    public Resource insertResource(Resource resource) {
        return resourceRepository.insertResource(resource);
    }

    public Resource updateResource(Resource resource) {
        return resourceRepository.updateResource(resource);
    }

    public int deleteResource(Integer id) {
        return resourceRepository.deleteResource(id);
    }

    public int updateResourceStatus(Integer id, Integer active) {
        return resourceRepository.updateResourceStatus(id, active);
    }
}
