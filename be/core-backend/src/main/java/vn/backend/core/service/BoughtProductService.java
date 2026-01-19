package vn.backend.core.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.repository.BoughtProductRepository;
import vn.backend.entity.data.mysql.BoughtProduct;

import java.util.List;

@Service
public class BoughtProductService {

    @Autowired
    private BoughtProductRepository repository;

    public Page<BoughtProduct> getByCriteria(
            Integer invoiceId,
            Integer status,
            Pageable pageable
    ) {
        List<BoughtProduct> list = repository.getByCriteria(invoiceId, status, pageable);
        Long total = repository.countByCriteria(invoiceId, status);
        pageable.setTotal(total);
        return new Page<>(pageable, list);
    }

    public BoughtProduct getById(Integer id) {
        return repository.getById(id);
    }

    public BoughtProduct insert(BoughtProduct product) {
        return repository.insert(product);
    }

    public BoughtProduct update(BoughtProduct product) {
        return repository.update(product);
    }

    public Integer delete(Integer id) {
        return repository.delete(id);
    }
}
