package vn.backend.core.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.data.report.*;
import vn.backend.core.repository.ReportRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository repository;

    public List<CustomerMonthlyReport> getCustomerByMonth(Integer year) {
        return repository.countCustomerByMonth(year);
    }

    public List<CustomerSourceReport> getCustomerBySource(Integer year) {
        return repository.countCustomerBySource(year);
    }

    public InvoiceMonthlyRevenueReport getMonthlyRevenue(Integer year, Integer month) {
        return repository.getMonthlyRevenue(year, month);
    }

    public Page<InvoiceFrequencyReport> getInvoiceFrequency(Integer year, Integer month, Pageable pageable) {
        List<InvoiceFrequencyReport> list = repository.getInvoiceFrequency(year, month, pageable);
        return new Page<>(pageable, list);
    }

    public Page<CustomerInterestAvgReport> getAvgInterestByCustomer(
            String customerName,
            Pageable pageable) {

        CompletableFuture<List<CustomerInterestAvgReport>> futureList =
                CompletableFuture.supplyAsync(() ->
                        repository.getAvgInterestByCustomer(customerName, pageable));

        CompletableFuture<Long> futureCount =
                CompletableFuture.supplyAsync(() ->
                        repository.countAvgInterestByCustomer(customerName));

        List<CustomerInterestAvgReport> list = futureList.join();
        Long count = futureCount.join();

        pageable.setTotal(count);
        return new Page<>(pageable, list);
    }

    public List<CustomerInterestMonthlyBarReport> getMonthlyInterestBar(
            Integer year,
            Double minAvgInterest) {

        List<CustomerInterestMonthlyBarReport> raw =
                repository.getMonthlyInterestBar(year, minAvgInterest);

        List<CustomerInterestMonthlyBarReport> result = new ArrayList<>();

        for (int m = 1; m <= 12; m++) {
            int month = m;
            CustomerInterestMonthlyBarReport item = raw.stream()
                    .filter(r -> r.getMonth().equals(month))
                    .findFirst()
                    .orElseGet(() -> {
                        CustomerInterestMonthlyBarReport empty =
                                new CustomerInterestMonthlyBarReport();
                        empty.setMonth(month);
                        empty.setTotalCustomer(0L);
                        empty.setHighInterestCustomer(0L);
                        return empty;
                    });
            result.add(item);
        }
        return result;
    }
}
