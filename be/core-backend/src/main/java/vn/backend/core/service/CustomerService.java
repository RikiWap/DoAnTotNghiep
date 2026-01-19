package vn.backend.core.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.repository.CustomerAttributeRepository;
import vn.backend.core.repository.CustomerExtraInfoRepository;
import vn.backend.core.repository.CustomerRepository;
import vn.backend.entity.data.mysql.Customer;
import vn.backend.entity.data.mysql.CustomerAttribute;
import vn.backend.entity.data.mysql.CustomerExtraInfo;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Slf4j(topic = "CUSTOMER-SERVICE")
@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private CustomerExtraInfoService customerExtraInfoService;

    @Autowired
    private CustomerAttributeRepository customerAttributeRepository;

    public Page<Customer> getListCustomerByCriteria(String keyword, Pageable pageable) {
        // Tạo executor riêng (kiểm soát thread pool)
        var executor = java.util.concurrent.Executors.newFixedThreadPool(4);

        // 1. Lấy danh sách customer song song
        CompletableFuture<List<Customer>> futureList = CompletableFuture.supplyAsync(
                () -> customerRepository.getCustomerByCriteria(keyword, pageable), executor
        );

        // 2. Lấy tổng số lượng (count)
        CompletableFuture<Long> futureCount = CompletableFuture.supplyAsync(
                () -> customerRepository.countCustomerByCriteria(keyword), executor
        );

        // 3. Khi đã có danh sách, lấy danh sách ID khách hàng
        CompletableFuture<List<Integer>> futureCustomerIds = futureList.thenApply(
                customers -> customers.stream().map(Customer::getId).toList()
        );

        // 4. Lấy thông tin trường động và attribute song song
        CompletableFuture<List<CustomerExtraInfo>> futureExtraInfos = futureCustomerIds.thenApplyAsync(
                customerIds -> customerExtraInfoService.getCustomerExtraInfoByCustomerIds(customerIds), executor
        );

        CompletableFuture<List<CustomerAttribute>> futureAttributes = CompletableFuture.supplyAsync(() -> {
            Pageable attrPage = new Pageable();
            attrPage.setLimit(Integer.MAX_VALUE);
            return customerAttributeRepository.getCustomerAttributeByCriteria(2, null, null, attrPage);
        }, executor);

        // 5. Chờ tất cả hoàn thành cùng lúc
        CompletableFuture.allOf(futureList, futureCount, futureExtraInfos, futureAttributes).join();

        // 6. Lấy kết quả
        List<Customer> customers = futureList.join();
        Long totalCount = futureCount.join();
        List<CustomerExtraInfo> lstExtra = futureExtraInfos.join();
        List<CustomerAttribute> lstAttr = futureAttributes.join();

        pageable.setTotal(totalCount);

        if (customers == null || customers.isEmpty()) {
            executor.shutdown();
            return new Page<>(pageable, customers);
        }

        // 7. Gom nhóm dữ liệu song song
        Map<Integer, List<CustomerAttribute>> mapAttrByParent =
                lstAttr.parallelStream().collect(Collectors.groupingBy(CustomerAttribute::getParentId));

        Map<Integer, List<CustomerExtraInfo>> mapExtraByCustomer =
                lstExtra.parallelStream().collect(Collectors.groupingBy(CustomerExtraInfo::getCustomerId));

        // 8. Gán dữ liệu vào từng Customer (song song)
        customers.parallelStream().forEach(customer -> {
            List<CustomerExtraInfo> extras = mapExtraByCustomer.getOrDefault(customer.getId(), List.of());
            customer.setCustomerExtraInfos(extras);
            customer.setMapCustomerAttribute(mapAttrByParent);
        });

        executor.shutdown();
        return new Page<>(pageable, customers);
    }
    public Customer getCustomerById(Integer id) {
        return customerRepository.getCustomerById(id);
    }

    public Customer insertCustomer(Customer customer) {
        Customer customerDb = customerRepository.insertCustomer(customer);
        customerExtraInfoService.processCustomerExtraInfo(customerDb.getId(), customerDb);
        return customerDb;    }

    public Customer updateCustomer(Customer customer) {
        Customer customerDb = customerRepository.updateCustomer(customer);
        customerExtraInfoService.processCustomerExtraInfo(customerDb.getId(), customerDb);
        return customerDb;
    }

    public Integer deleteCustomer(Integer id) {
        return customerRepository.deleteCustomer(id);
    }
}
