package vn.backend.core.service;

import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.repository.CustomerVoucherUsageRepository;
import vn.backend.core.repository.InvoiceRepository;
import vn.backend.core.repository.InvoiceVoucherRepository;
import vn.backend.core.repository.VoucherRepository;
import vn.backend.entity.data.mysql.Invoice;
import vn.backend.entity.data.mysql.Voucher;

import java.util.List;

@Service
@AllArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceVoucherRepository invoiceVoucherRepository;
    private final VoucherRepository voucherRepository;
    private final CustomerVoucherUsageRepository customerVoucherUsageRepository;

    public Page<Invoice> getListByCriteria(String keyword, Integer customerId, Integer status, Pageable pageable) {
        List<Invoice> list = invoiceRepository.getInvoiceByCriteria(keyword, customerId, status, pageable);
        Long total = invoiceRepository.countInvoiceByCriteria(keyword, customerId, status);

        pageable.setTotal(total);
        return new Page<>(pageable, list);
    }

    public Invoice recalculateDraftAmount(Integer invoiceId) {
        Double totalAmount = invoiceRepository.calculateDraftAmount(invoiceId);

        invoiceRepository.updateInvoiceAmount(invoiceId, totalAmount);
        return invoiceRepository.getInvoiceById(invoiceId);
    }


    public Invoice getById(Integer id) {
        return invoiceRepository.getInvoiceById(id);
    }

    public Invoice getOrCreateDraftInvoice(Integer customerId, Integer userId, Integer branchId) {

        // 1. Kiểm tra xem có hóa đơn nháp chưa
        Invoice draft = invoiceRepository.getDraftInvoice(customerId);
        if (draft != null) {
            return draft; // Trả hóa đơn nháp cũ
        }

        // 2. Chưa có → tạo mới
        return invoiceRepository.insertDraftInvoice(customerId, userId, branchId);
    }

    public Invoice insert(Invoice item) {
        return invoiceRepository.insertInvoice(item);
    }

    @Transactional
    public Invoice update(Invoice item) {
        if (item.getStatus() == 1) {
            Voucher voucher = voucherRepository.getByCode(item.getVoucherCode());
            if (voucher != null) {
                invoiceVoucherRepository.insert(item.getId(), voucher.getId(), item.getDiscount());
                customerVoucherUsageRepository.increaseUsage(voucher.getId(), item.getCustomerId());
            }
        }
        return invoiceRepository.updateInvoice(item);
    }

    public Integer updateStatus(Integer invoiceId, Integer status) {
        return invoiceRepository.updateStatus(invoiceId, status);
    }

    public Integer delete(Integer id) {
        return invoiceRepository.deleteInvoice(id);
    }
}
