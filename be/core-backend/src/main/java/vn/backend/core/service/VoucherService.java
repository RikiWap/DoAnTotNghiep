package vn.backend.core.service;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.exception.AppException;
import vn.backend.core.repository.CustomerVoucherUsageRepository;
import vn.backend.core.repository.InvoiceVoucherRepository;
import vn.backend.core.repository.VoucherRepository;
import vn.backend.entity.data.mysql.Invoice;
import vn.backend.entity.data.mysql.Voucher;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class VoucherService {

    private final VoucherRepository voucherRepository;
    private final InvoiceService invoiceService;
    private final InvoiceVoucherRepository invoiceVoucherRepository;
    private final CustomerVoucherUsageRepository customerVoucherUsageRepository;

    public Page<Voucher> getList(String keyword, Integer status, Integer branchId, Pageable pageable) {
        List<Voucher> list = voucherRepository.getByCriteria(keyword, status, branchId, pageable);
        Long total = voucherRepository.countByCriteria(keyword, status, branchId);

        pageable.setTotal(total);
        return new Page<>(pageable, list);
    }

    public Voucher getById(Integer id) {
        return voucherRepository.getById(id);
    }

    public Voucher getByCode(String code) {
        return voucherRepository.getByCode(code);
    }

    public Voucher insert(Voucher v) {
        return voucherRepository.insert(v);
    }

    public Voucher update(Voucher v) {
        return voucherRepository.update(v);
    }

    public Integer delete(Integer id) {
        return voucherRepository.delete(id);
    }

    private Double calculateDiscount(Double invoiceAmount, Voucher voucher) {

        if (invoiceAmount == null || invoiceAmount <= 0) {
            return 0D;
        }

        if (voucher == null) {
            return 0D;
        }

        double discount = 0D;

        // 1 = FIXED AMOUNT, 2 = PERCENT
        switch (voucher.getDiscountType()) {

            case 1: // FIXED AMOUNT
                discount = voucher.getDiscountValue();
                break;

            case 2: // PERCENT
                discount = invoiceAmount * voucher.getDiscountValue() / 100D;

                // áp max_discount nếu có
                if (voucher.getMaxDiscount() != null && voucher.getMaxDiscount() > 0) {
                    discount = Math.min(discount, voucher.getMaxDiscount());
                }
                break;

            default:
                discount = 0D;
        }

        // không cho giảm vượt quá tiền hóa đơn
        discount = Math.min(discount, invoiceAmount);

        // tránh số âm
        return Math.max(discount, 0D);
    }
    private void validateVoucher(
            Invoice invoice,
            Voucher voucher
    ) {
        if (voucher == null) {
            throw new AppException("Voucher không tồn tại");
        }

        // 1. Trạng thái voucher
        if (voucher.getStatus() == null || voucher.getStatus() != 1) {
            throw new AppException("Voucher đã bị vô hiệu hóa");
        }

        // 2. Thời gian hiệu lực
        LocalDateTime now = LocalDateTime.now();

        if (voucher.getStartDate() != null && now.isBefore(voucher.getStartDate())) {
            throw new AppException("Voucher chưa đến thời gian áp dụng");
        }

        if (voucher.getEndDate() != null && now.isAfter(voucher.getEndDate())) {
            throw new AppException("Voucher đã hết hạn");
        }

        // 3. Chi nhánh
        if (voucher.getBranchId() != null
                && voucher.getBranchId() > 0
                && !voucher.getBranchId().equals(invoice.getBranchId())) {
            throw new AppException("Voucher không áp dụng cho chi nhánh này");
        }

        // 4. Giá trị đơn tối thiểu
        if (voucher.getMinInvoiceAmount() != null
                && invoice.getAmount() < voucher.getMinInvoiceAmount()) {
            throw new AppException(
                    "Hóa đơn tối thiểu phải là:  " + voucher.getMinInvoiceAmount()
            );
        }

        // 5. Giới hạn tổng lượt sử dụng (toàn hệ thống)
        Integer totalUsedCount = invoiceVoucherRepository.countTotalUsed((voucher.getId()));
        if (voucher.getTotalQuantity() != null && voucher.getTotalQuantity() > 0) {
            if (totalUsedCount >= voucher.getTotalQuantity()) {
                throw new AppException("Voucher đã hết lượt sử dụng");
            }
        }

        // 6. Giới hạn lượt sử dụng theo customer
        Integer customerUsedCount =
                customerVoucherUsageRepository.getUsedCount(
                        voucher.getId(),
                        invoice.getCustomerId()
                );

        if (voucher.getPerUserLimit() != null && voucher.getPerUserLimit() > 0) {
            if (customerUsedCount >= voucher.getPerUserLimit()) {
                throw new AppException("Khách hàng đã quá số lần sử dụng voucher này");
            }
        }
    }

    public Double applyVoucher(Integer invoiceId, String voucherCode, Double amount) {

        Voucher voucher = voucherRepository.getByCode(voucherCode);
        Invoice invoice = invoiceService.getById(invoiceId);

        validateVoucher(invoice, voucher);
        Double discount = calculateDiscount(amount, voucher);
        return discount;
    }

}
