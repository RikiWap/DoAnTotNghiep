package vn.backend.core.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.backend.core.repository.CustomerExtraInfoRepository;
import vn.backend.entity.data.mysql.Customer;
import vn.backend.entity.data.mysql.CustomerExtraInfo;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CustomerExtraInfoService {

    @Autowired
    private CustomerExtraInfoRepository repository;

    public List<CustomerExtraInfo> getCustomerExtraInfoByCustomerId(Integer customerId) {
        return repository.getCustomerExtraInfoByCustomerId(customerId);
    }

    public List<CustomerExtraInfo> getCustomerExtraInfoByCustomerIds(List<Integer> customerIds) {
        return repository.getCustomerExtraInfoByCustomerIds(customerIds);
    }

    public List<CustomerExtraInfo> insertBatchCustomerExtraInfo(List<CustomerExtraInfo> list, Integer customerId) {
        return repository.insertBatchCustomerExtraInfo(list, customerId);
    }

    public List<CustomerExtraInfo> updateBatchCustomerExtraInfo(List<CustomerExtraInfo> list) {
        return repository.updateBatchCustomerExtraInfo(list);
    }

    public Integer deleteCustomerExtraInfos(List<CustomerExtraInfo> list, Integer customerId) {
        return repository.deleteCustomerExtraInfos(list, customerId);
    }

    public Integer deleteCustomerExtraInfoByAttributeId(Integer attributeId) {
        return repository.deleteCustomerExtraInfoByAttributeId(attributeId);
    }

    /**
     * Đồng bộ thông tin Customer Extra Info (thêm/sửa/xóa)
     */
    public void processCustomerExtraInfo(Integer customerId, Customer customer) {
        List<CustomerExtraInfo> customerExtraInfos = customer.getCustomerExtraInfos();
        List<CustomerExtraInfo> lstCustomerExtraInfo = getCustomerExtraInfoByCustomerId(customerId);

        // Trường hợp DB chưa có gì
        if (lstCustomerExtraInfo == null || lstCustomerExtraInfo.isEmpty()) {
            if (customerExtraInfos == null || customerExtraInfos.isEmpty()) {
                return;
            }
            insertBatchCustomerExtraInfo(customerExtraInfos, customerId);
            return;
        }

        // Trường hợp form rỗng => xóa toàn bộ
        if (customerExtraInfos == null || customerExtraInfos.isEmpty()) {
            deleteCustomerExtraInfos(lstCustomerExtraInfo, customerId);
            return;
        }

        // Tạo 3 danh sách: thêm mới / cập nhật / xóa
        List<CustomerExtraInfo> added = new ArrayList<>();
        List<CustomerExtraInfo> updated = new ArrayList<>();
        List<CustomerExtraInfo> deleted = new ArrayList<>();

        Map<Integer, CustomerExtraInfo> mapForm = customerExtraInfos.stream()
                .collect(Collectors.toMap(CustomerExtraInfo::getAttributeId, e -> e));
        Map<Integer, CustomerExtraInfo> mapDb = lstCustomerExtraInfo.stream()
                .collect(Collectors.toMap(CustomerExtraInfo::getAttributeId, e -> e));

        // So sánh dữ liệu form với DB
        for (CustomerExtraInfo formInfo : customerExtraInfos) {
            CustomerExtraInfo dbInfo = mapDb.get(formInfo.getAttributeId());
            if (dbInfo != null) {
                // Kiểm tra thay đổi giá trị
                if (!Objects.equals(dbInfo.getAttributeValue(), formInfo.getAttributeValue())) {
                    updated.add(formInfo);
                }
            } else {
                added.add(formInfo);
            }
        }

        // Xác định các bản ghi bị xóa
        for (CustomerExtraInfo dbInfo : lstCustomerExtraInfo) {
            if (!mapForm.containsKey(dbInfo.getAttributeId())) {
                deleted.add(dbInfo);
            }
        }

        // Thực thi đồng bộ
        if (!deleted.isEmpty()) {
            deleteCustomerExtraInfos(deleted, customerId);
        }

        if (!updated.isEmpty()) {
            updateBatchCustomerExtraInfo(updated);
        }

        if (!added.isEmpty()) {
            insertBatchCustomerExtraInfo(added, customerId);
        }
    }
}
