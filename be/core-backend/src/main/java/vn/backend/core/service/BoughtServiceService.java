package vn.backend.core.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.repository.BoughtServiceRepository;
import vn.backend.entity.data.mysql.BoughtService;

import java.util.List;

@Service
public class BoughtServiceService {

    @Autowired
    private BoughtServiceRepository repository;

    public Page<BoughtService> getByCriteria(
            Integer invoiceId,
            Integer status,
            Pageable pageable
    ) {
        List<BoughtService> list = repository.getByCriteria(invoiceId, status, pageable);
        Long total = repository.countByCriteria(invoiceId, status);
        pageable.setTotal(total);
        return new Page<>(pageable, list);
    }

    public BoughtService getById(Integer id) {
        return repository.getById(id);
    }

    public BoughtService insert(BoughtService service) {
        return repository.insert(service);
    }

    public BoughtService update(BoughtService service) {
        return repository.update(service);
    }

    public Integer delete(Integer id) {
        return repository.delete(id);
    }
}
