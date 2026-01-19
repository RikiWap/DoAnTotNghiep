package vn.backend.core.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.repository.CustomerAttributeRepository;
import vn.backend.entity.data.mysql.CustomerAttribute;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class CustomerAttributeService {

    @Autowired
    private CustomerAttributeRepository repository;

    public Page<CustomerAttribute> getListCustomerAttributeByCriteria(Integer isParent, String name, String dataType, Pageable pageable) {
        CompletableFuture<List<CustomerAttribute>> listFuture = CompletableFuture.supplyAsync(
                () -> repository.getCustomerAttributeByCriteria(isParent, name, dataType, pageable)
        );
        CompletableFuture<Long> countFuture = CompletableFuture.supplyAsync(
                () -> repository.countCustomerAttributeByCriteria(isParent, name, dataType)
        );

        List<CustomerAttribute> list = listFuture.join();
        Long count = countFuture.join();
        pageable.setTotal(count);
        return new Page<>(pageable, list);
    }

    public CustomerAttribute getCustomerAttributeById(Integer id) {
        return repository.getCustomerAttributeById(id);
    }

    public CustomerAttribute insertCustomerAttribute(CustomerAttribute attr) {
        return repository.insertCustomerAttribute(attr);
    }

    public CustomerAttribute updateCustomerAttribute(CustomerAttribute attr) {
        return repository.updateCustomerAttribute(attr);
    }

    public Integer deleteCustomerAttribute(Integer id) {
        return repository.deleteCustomerAttribute(id);
    }
}
