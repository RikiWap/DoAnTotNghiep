package vn.backend.core.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;
import vn.backend.core.config.model.ApiResponse;
import vn.backend.core.data.response.VNPayResult;
import vn.backend.core.service.VNPayService;
import vn.backend.core.util.Mapper;
import vn.backend.entity.data.mysql.User;

@RestController
@AllArgsConstructor
public class VnPayController {

    private final VNPayService vnPayService;

    @PostMapping("/payment/submitOrder")
    public ResponseEntity<ApiResponse<String>> submitOrder(
            @RequestParam(name = "invoiceId") Long invoiceId,
            @RequestParam(name = "amount") int orderTotal,
            HttpServletRequest request
    ) {
        String baseUrl = request.getScheme() + "://" +
                request.getServerName() + ":" +
                request.getServerPort();

        var result = vnPayService.createOrder(invoiceId, orderTotal, baseUrl);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @GetMapping("/payment/vnpay-payment")
    public ModelAndView vnpayReturn(HttpServletRequest request) {

        VNPayResult result = vnPayService.orderReturn(request);

        ModelAndView mv = new ModelAndView("order-success");

        mv.addObject("success", result.isSuccess());
        mv.addObject("invoiceId", result.getInvoiceId());
        mv.addObject("transactionId", result.getTransactionId());
        mv.addObject("paymentTime", result.getPaymentTime());
        mv.addObject("totalPrice", result.getTotalPrice());

        return mv;
    }
}