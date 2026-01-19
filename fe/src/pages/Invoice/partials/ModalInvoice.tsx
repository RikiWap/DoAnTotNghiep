/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState, useMemo, Fragment } from "react";
import { toast } from "react-toastify";
// UPDATE: Import file CustomSelect mới
import CustomSelect from "../../../components/CustomSelect/CustomSelect";
import InvoiceService from "../../../services/InvoiceService";
import CustomerService from "../../../services/CustomerService";
import { getCookie } from "../../../utils/common";
import Table from "../../../components/Table/Table";
import ProductService from "../../../services/ProductService";
import BoughtProductService, { type IBoughtProductRequest } from "../../../services/BoughtProductService";
import ModalProduct from "../../Product/partials/ModalProduct";
import type { IProductRequest } from "../../../model/product/ProductRequestModel";
import ServiceService from "../../../services/ServiceService";
import BoughtServiceService, { type IBoughtServiceRequest } from "../../../services/BoughtServiceService";
import ModalService from "../../Service/partials/ModalService";
import type { IServiceRequest } from "../../../model/service/ServiceRequestModel";
import type { IInvoiceRequest } from "../../../model/invoice/InvoiceRequestModel";
import type { IInvoiceResponse } from "../../../model/invoice/InvoiceResponseModel";
import "./ModalInvoice.scss";
import PaymentService from "../../../services/PaymentService";

export type IInvoiceItem = {
  id: any;
  itemType: "product" | "service";
  productId?: any;
  serviceId?: any;
  productName?: string;
  productImage?: string;
  unitId?: number;
  qty: number;
  price: number;
  fee: number;
  note?: string;
};

type Props = {
  type: "add" | "edit" | "delete" | "detail" | null;
  shown: boolean;
  item?: IInvoiceResponse;
  onClose: () => void;
  onSubmit: (payload: IInvoiceRequest) => void;
  onDelete?: () => void;
};

function OffcanvasForm({
  mode,
  shown,
  item,
  onClose,
  onSubmit,
}: {
  mode: "add" | "edit";
  shown: boolean;
  item?: IInvoiceResponse;
  onClose: () => void;
  onSubmit: (payload: IInvoiceRequest) => void;
}) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const token = getCookie("token") || "";
  const [invoiceIdDisplay, setInvoiceIdDisplay] = useState<string>("");
  const [dbId, setDbId] = useState<number | undefined>(undefined);
  const [, setClient] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<number>(1);
  const [notes, setNotes] = useState<string>("");
  const [apiTotalAmount, setApiTotalAmount] = useState<number>(0);
  const [customerOptions, setCustomerOptions] = useState<unknown[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [items, setItems] = useState<IInvoiceItem[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<any>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [selectedServiceToAdd, setSelectedServiceToAdd] = useState<any>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [deleteData, setDeleteData] = useState<{ id: number; type: "product" | "service" } | null>(null);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 16));
  const [voucherCode, setVoucherCode] = useState<string>("");
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  const productOptions = useMemo(() => {
    return availableProducts.map((p) => ({
      ...p,
      name: `${p.name} - ${new Intl.NumberFormat("vi-VN").format(p.price || 0)}đ`,
    }));
  }, [availableProducts]);

  const serviceOptions = useMemo(() => {
    return availableServices.map((s) => ({
      ...s,
      name: `${s.name} - ${new Intl.NumberFormat("vi-VN").format(s.price || 0)}đ`,
    }));
  }, [availableServices]);

  const paymentOptions = useMemo(
    () => [
      { id: 1, name: "Thanh toán tiền mặt" },
      { id: 2, name: "Chuyển khoản" },
    ],
    []
  );

  const tempAmount = useMemo(() => {
    return items.reduce((acc, curr) => acc + (curr.fee || 0), 0);
  }, [items]);

  const fetchMasterData = async () => {
    if (!token) return;
    try {
      const [prodRes, servRes] = await Promise.all([
        ProductService.list({ page: 1, limit: 1000 }, token),
        ServiceService.list({ page: 1, limit: 1000 }, token),
      ]);
      if (prodRes?.code === 200) setAvailableProducts(prodRes.result.items || []);
      if (servRes?.code === 200) setAvailableServices(servRes.result.items || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCustomers = async () => {
    if (!token) return;
    const res = await CustomerService.list({ page: 1, limit: 1000 }, token);
    if (res?.code === 200) setCustomerOptions(res.result.items || []);
  };

  const refreshInvoiceData = async (currentInvoiceId: number) => {
    if (!currentInvoiceId || !token) return;
    try {
      const [prodRes, servRes] = await Promise.all([
        BoughtProductService.list({ invoiceId: currentInvoiceId, status: 1 }, token),
        BoughtServiceService.list({ invoiceId: currentInvoiceId, status: 1 }, token),
      ]);
      let mergedItems: IInvoiceItem[] = [];
      if (prodRes?.code === 200) {
        const pList = Array.isArray(prodRes.result) ? prodRes.result : prodRes.result?.items || [];
        mergedItems = mergedItems.concat(pList.map((i: any) => ({ ...i, itemType: "product" })));
      }
      if (servRes?.code === 200) {
        const sList = Array.isArray(servRes.result) ? servRes.result : servRes.result?.items || [];
        mergedItems = mergedItems.concat(sList.map((i: any) => ({ ...i, itemType: "service" })));
      }
      mergedItems.sort((a, b) => a.id - b.id);
      setItems(mergedItems);
    } catch (error) {
      console.error("Lỗi load items:", error);
    }
  };

  const recalculateInvoice = async (currentInvoiceId: number) => {
    if (!currentInvoiceId || !token) return;
    const res = await InvoiceService.recalculate({ id: currentInvoiceId }, token);
    if (res?.code === 200) setApiTotalAmount(res.result.amount);
  };

  useEffect(() => {
    if (shown) {
      setDbId(mode === "add" ? undefined : item?.id);
      setInvoiceIdDisplay(item?.invoiceCode || `INV${Date.now()}`);
      setApiTotalAmount(item?.amount || 0);
      setPaymentMethod(item?.paymentType === 2 ? 2 : 1);
      const rDate = item?.receiptDate ? String(item.receiptDate) : new Date().toISOString();
      setDate(rDate.slice(0, 16));

      setNotes(String(item?.note || ""));
      setItems([]);
      setSelectedProductToAdd(null);
      setSelectedServiceToAdd(null);
      setDeleteData(null);
      setDiscountAmount(item?.discount || 0);
      setVoucherCode(item?.voucherCode || "");

      if (mode === "edit" && item) {
        setClient(item.customerName || "");
        setPhone(item.phone || "");
        setEmail(item.email || "");

        const preFillCustomer = {
          id: item.customerId,
          name: item.customerName,
          phone: item.phone,
          email: item.email,
        };
        setSelectedCustomer(preFillCustomer);
        refreshInvoiceData(item.id!);
      } else {
        setSelectedCustomer(null);
        setClient("");
        setPhone("");
        setEmail("");
      }

      fetchCustomers();
      fetchMasterData();
    }
  }, [shown, mode, item]);

  useEffect(() => {
    if (shown && customerOptions.length > 0) {
      if (mode === "edit" && item?.customerId) {
        const found = customerOptions.find((c: any) => c.id === item.customerId) as any;
        if (found) {
          setSelectedCustomer(found);
          setPhone(found.phone || "");
          setEmail(found.email || "");
          setClient(found.name || "");
        }
      }
    }
  }, [shown, mode, item, customerOptions]);

  const handleCustomerChange = async (option: any, shouldLoadDraft = true) => {
    setSelectedCustomer(option);
    if (option) {
      setClient(option.name || "");
      setPhone(option.phone || "");
      setEmail(option.email || "");

      if (shouldLoadDraft && token && option.id && mode === "add") {
        const res = await InvoiceService.getDraft(option.id, token);
        if (res?.code === 200 && res.result) {
          const draft = res.result;
          setDbId(draft.id);
          setInvoiceIdDisplay(draft.invoiceCode);
          setApiTotalAmount(draft.amount);
          await refreshInvoiceData(draft.id);
        }
      }
    }
  };

  const handleCreateNewProduct = async (payload: IProductRequest) => {
    if (!token) return;
    const res = await ProductService.update(payload, token);
    if (res?.code === 200) {
      toast.success("Tạo sản phẩm thành công!");
      setShowProductModal(false);
      fetchMasterData();
    }
  };

  const handleAddProductToDraft = async () => {
    if (!selectedProductToAdd) return toast.warning("Chưa chọn sản phẩm!");
    if (!dbId) return toast.warning("Chưa có khách hàng (hoặc chưa lưu nháp)!");

    const existing = items.find((it) => it.itemType === "product" && it.productId === selectedProductToAdd.id);

    const payload: IBoughtProductRequest = {
      id: existing?.id,
      invoiceId: dbId,
      productId: selectedProductToAdd.id,
      unitId: selectedProductToAdd.unitId || 1,
      qty: existing ? existing.qty + 1 : 1,
      price: selectedProductToAdd.price,
      fee: selectedProductToAdd.price * (existing ? existing.qty + 1 : 1),
      customerId: selectedCustomer?.id,
      status: 1,
      note: existing?.note || "",
    };

    const res = await BoughtProductService.update(payload, token);
    if (res?.code === 200) {
      toast.success(existing ? "Đã tăng số lượng" : "Đã thêm sản phẩm");
      await recalculateInvoice(dbId);
      await refreshInvoiceData(dbId);
    }
  };

  const handleCreateNewService = async (payload: IServiceRequest) => {
    if (!token) return;
    const res = await ServiceService.update(payload, token);
    if (res?.code === 200) {
      toast.success("Tạo dịch vụ thành công!");
      setShowServiceModal(false);
      fetchMasterData();
    }
  };

  const handleAddServiceToDraft = async () => {
    if (!selectedServiceToAdd) return toast.warning("Chưa chọn dịch vụ!");
    if (!dbId) return toast.warning("Chưa có khách hàng!");

    const existing = items.find((it) => it.itemType === "service" && it.serviceId === selectedServiceToAdd.id);

    const payload: IBoughtServiceRequest = {
      id: existing?.id,
      invoiceId: dbId,
      serviceId: selectedServiceToAdd.id,
      qty: existing ? existing.qty + 1 : 1,
      price: selectedServiceToAdd.price,
      fee: selectedServiceToAdd.price * (existing ? existing.qty + 1 : 1),
      customerId: selectedCustomer?.id,
      status: 1,
      note: existing?.note || "",
    };

    const res = await BoughtServiceService.update(payload, token);
    if (res?.code === 200) {
      toast.success(existing ? "Đã tăng số lượng dịch vụ" : "Đã thêm dịch vụ");
      await recalculateInvoice(dbId);
      await refreshInvoiceData(dbId);
    }
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.warning("Vui lòng nhập mã giảm giá!");
      return;
    }
    if (!dbId) {
      toast.warning("Vui lòng chọn khách hàng và tạo đơn nháp trước!");
      return;
    }
    try {
      const res = await InvoiceService.applyVoucher(dbId, voucherCode, tempAmount, token);
      if (res?.code === 200) {
        const returnedDiscount = res.result || 0;
        setDiscountAmount(returnedDiscount);
        toast.success(`Áp dụng thành công! Giảm: ${new Intl.NumberFormat("vi-VN").format(returnedDiscount)}đ`);
        await recalculateInvoice(dbId);
      } else {
        setDiscountAmount(0);
        toast.error(res?.message || "Không thể áp dụng mã voucher này.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi áp dụng mã.");
      setDiscountAmount(0);
    }
  };

  const confirmDelete = async () => {
    if (!deleteData || !token) return;
    let res;
    if (deleteData.type === "product") {
      res = await BoughtProductService.delete(deleteData.id, token);
    } else {
      res = await BoughtServiceService.delete(deleteData.id, token);
    }

    if (res?.code === 200) {
      toast.success("Đã xóa thành công");
      setDeleteData(null);
      if (dbId) {
        await recalculateInvoice(dbId);
        await refreshInvoiceData(dbId);
      }
    } else {
      toast.error("Xóa thất bại");
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedCustomer?.id) {
      toast.error("Vui lòng chọn khách hàng!");
      return;
    }

    const safeTempAmount = tempAmount || 0;
    const safeDiscount = discountAmount || 0;
    const finalTotal = safeTempAmount - safeDiscount;
    const safeFee = finalTotal > 0 ? finalTotal : 0;
    const currentStatus = paymentMethod === 2 ? 0 : 1;

    const payload: IInvoiceRequest = {
      id: dbId,
      invoiceCode: invoiceIdDisplay,
      // invoiceType: 2,
      amount: safeTempAmount,
      discount: safeDiscount,
      fee: safeFee,
      vatAmount: 0,
      amountCard: 0,
      paid: 0,
      debt: 0,
      paymentType: paymentMethod === 2 ? 2 : 1,
      // status: 1,
      status: currentStatus,
      statusTemp: 1,
      receiptDate: date,
      customerId: selectedCustomer.id,
      userId: 0,
      branchId: 0,
      voucherCode: voucherCode,
      note: notes,
    };

    // if (paymentMethod === 2) {
    //   toast.info("Đang khởi tạo giao dịch chuyển khoản...");
    //   try {
    //     const res = await PaymentService.payment(
    //       {
    //         invoiceId: dbId,
    //         amount: safeFee,
    //       },
    //       token
    //     );

    //     if (res && res.code === 200 && res.result) {
    //       // window.location.href = res.result;
    //       window.open(res.result, "_blank");
    //     } else {
    //       toast.error(res?.message || "Không lấy được đường dẫn thanh toán. Vui lòng thử lại.");
    //     }
    //   } catch (err) {
    //     console.error("Payment Error:", err);
    //     toast.error("Lỗi kết nối đến cổng thanh toán.");
    //   }
    // } else {
    //   onSubmit(payload);
    // }
    if (paymentMethod === 2) {
      try {
        await InvoiceService.update(payload, token);
      } catch (err) {
        console.error("Lỗi cập nhật hóa đơn trước khi thanh toán:", err);
      }

      toast.info("Đang khởi tạo giao dịch chuyển khoản...");
      try {
        const res = await PaymentService.payment(
          {
            invoiceId: dbId,
            amount: safeFee,
          },
          token
        );

        if (res && res.code === 200 && res.result) {
          window.open(res.result, "_blank");
        } else {
          toast.error(res?.message || "Không lấy được đường dẫn thanh toán. Vui lòng thử lại.");
        }
      } catch (err) {
        console.error("Payment Error:", err);
        toast.error("Lỗi kết nối đến cổng thanh toán.");
      }
    } else {
      onSubmit(payload);
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "stt",
        title: "#",
        className: "w-1 text-center align-middle",
        render: (_row: IInvoiceItem, _val: any, idx: number) => idx + 1,
      },
      {
        key: "name",
        title: "Tên Sản phẩm / Dịch vụ",
        className: "align-middle",
        render: (row: IInvoiceItem) => {
          let name = "Item";
          let img = "";
          const isService = row.itemType === "service";

          if (isService) {
            const info = availableServices.find((s: any) => s.id === row.serviceId);
            name = info?.name || "Dịch vụ";
            img = info?.avatar || "";
          } else {
            const info = availableProducts.find((p: any) => p.id === row.productId);
            name = info?.name || row.productName || "Sản phẩm";
            img = info?.avatar || row.productImage || "";
          }

          return (
            <div className="d-flex align-items-center">
              <div className="avatar avatar-sm me-2 flex-shrink-0">
                {img ? (
                  <img src={img} className="rounded-circle w-100 h-100 object-fit-cover" alt="img" />
                ) : (
                  <span className={`avatar-title rounded-circle ${isService ? "bg-light-info text-info" : "bg-light-primary text-primary"}`}>
                    <i className={`ti ${isService ? "ti-wand" : "ti-box"}`}></i>
                  </span>
                )}
              </div>
              <div className="d-flex flex-column">
                <span className="text-body fs-14 fw-medium">{name}</span>
                <span className="text-muted fs-12">
                  {isService ? "Dịch vụ" : "Sản phẩm"} {row.note ? ` - ${row.note}` : ""}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        key: "qty",
        title: "Số lượng",
        className: "text-center align-middle",
        render: (row: IInvoiceItem) => <span className="text-body fs-14">x{row.qty}</span>,
      },
      {
        key: "price",
        title: "Đơn giá (VNĐ)",
        className: "text-end align-middle",
        render: (row: IInvoiceItem) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(row.price || 0),
      },
      {
        key: "fee",
        title: "Thành tiền (VNĐ)",
        className: "text-end align-middle",
        render: (row: IInvoiceItem) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(row.fee || 0),
      },
      {
        key: "action",
        title: "",
        className: "text-end align-middle",
        render: (row: IInvoiceItem) => (
          <button
            type="button"
            className="btn btn-icon btn-sm btn-ghost-danger rounded-circle"
            onClick={() => setDeleteData({ id: row.id, type: row.itemType })}
          >
            <i className="ti ti-trash fs-16"></i>
          </button>
        ),
      },
    ],
    [items, availableProducts, availableServices]
  );

  return (
    <>
      <div className={`offcanvas offcanvas-end offcanvas-large ${shown ? " show" : ""}`} tabIndex={-1} style={{ visibility: "visible" }}>
        <div className="offcanvas-header border-bottom">
          <h5 className="mb-0">{mode === "add" ? "Tạo Hóa Đơn Mới" : "Cập Nhật Hóa Đơn"}</h5>
          <button type="button" className="btn-close custom-btn-close border p-1" onClick={onClose} />
        </div>
        <div className="offcanvas-body">
          <form ref={formRef} onSubmit={handleSubmit}>
            <div className="row">
              <div className="mb-3 col-12">
                <label className="form-label">
                  Khách hàng <span className="text-danger">*</span>
                </label>
                <CustomSelect
                  value={selectedCustomer}
                  options={customerOptions}
                  onChange={(opt: any) => handleCustomerChange(opt, true)}
                  placeholder="Chọn khách hàng"
                  isDisabled={customerOptions.length === 0}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Số điện thoại</label>
                <input className="form-control" readOnly value={phone} />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Email</label>
                <input className="form-control" readOnly value={email} />
              </div>

              <div className="col-12 mt-3">
                <div className="row g-3">
                  <div className="col-md-6 pl-0">
                    <div className="d-flex justify-content-between mb-2">
                      <label className="form-label mb-0 fw-bold text-primary">Sản phẩm</label>
                      <button type="button" className="btn btn-link btn-sm p-0 text-primary" onClick={() => setShowProductModal(true)}>
                        + Thêm mới
                      </button>
                    </div>
                    <div className="card bg-light border-0 mb-0">
                      <div className="card-body p-2">
                        <div className="mb-2">
                          <CustomSelect
                            value={selectedProductToAdd}
                            options={productOptions}
                            onChange={setSelectedProductToAdd}
                            placeholder="Tìm sản phẩm..."
                          />
                        </div>
                        <button
                          type="button"
                          className="btn btn-primary w-100 btn-sm"
                          onClick={handleAddProductToDraft}
                          disabled={!selectedProductToAdd || !dbId}
                        >
                          <i className="ti ti-plus me-1"></i>Thêm vào hoá đơn nháp
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 pr-0">
                    <div className="d-flex justify-content-between mb-2">
                      <label className="form-label mb-0 fw-bold text-info">Dịch vụ</label>
                      <button type="button" className="btn btn-link btn-sm p-0 text-info" onClick={() => setShowServiceModal(true)}>
                        + Thêm mới
                      </button>
                    </div>
                    <div className="card bg-light border-0 mb-0">
                      <div className="card-body p-2">
                        <div className="mb-2">
                          <CustomSelect
                            value={selectedServiceToAdd}
                            options={serviceOptions}
                            onChange={setSelectedServiceToAdd}
                            placeholder="Tìm dịch vụ..."
                          />
                        </div>
                        <button
                          type="button"
                          className="btn btn-info text-white w-100 btn-sm"
                          onClick={handleAddServiceToDraft}
                          disabled={!selectedServiceToAdd || !dbId}
                        >
                          <i className="ti ti-plus me-1"></i>Thêm vào hoá đơn nháp
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 mt-4 mb-3">
                <label className="form-label fw-bold text-uppercase">Chi tiết đơn hàng</label>
                <div className="border rounded bg-white">
                  {items.length > 0 ? (
                    <Table id="invoice_items_list" data={items} columns={columns} selectable={false} />
                  ) : (
                    <div className="text-center py-5">
                      <div className="empty-state">
                        <div className="mb-3">
                          <span className="avatar avatar-xl bg-light text-muted rounded-circle">
                            <i className="ti ti-shopping-cart-plus fs-24"></i>
                          </span>
                        </div>
                        <h6 className="text-muted mb-1">Hóa đơn trống</h6>
                        <p className="text-muted fs-12">Vui lòng thêm sản phẩm hoặc dịch vụ ở trên.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="col-12 mb-3">
                <label className="form-label fw-bold">Mã ưu đãi / Voucher</label>
                <div className="input-group">
                  <span className="input-group-text bg-white text-primary border-end-0">
                    <i className="ti ti-ticket fs-18"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Nhập mã voucher"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  />
                  <button className="btn btn-primary px-4 fw-medium" type="button" onClick={handleApplyVoucher} disabled={!dbId}>
                    Áp dụng
                  </button>
                </div>
              </div>

              <div className="col-12 mb-3">
                <div className="card border">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h6 className="fs-14 fw-semibold mb-0">Tạm tính</h6>
                      <h6 className="fs-14 fw-semibold mb-0">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(tempAmount || 0)}
                      </h6>
                    </div>

                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h6 className="fs-14 fw-semibold mb-0">Giảm giá</h6>
                      <h6 className="fs-14 fw-semibold mb-0">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(discountAmount || 0)}
                      </h6>
                    </div>

                    <hr className="my-2" />
                    <div className="d-flex align-items-center justify-content-between">
                      <h6 className="fs-14 fw-bold mb-0">Tổng cộng</h6>
                      <h6 className="fs-14 fw-bold mb-0">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format((apiTotalAmount || 0) - (discountAmount || 0))}
                      </h6>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Hình thức thanh toán</label>
                <CustomSelect
                  options={paymentOptions}
                  value={paymentOptions.find((opt) => opt.id === paymentMethod)}
                  onChange={(opt: any) => setPaymentMethod(opt?.id || 1)}
                  placeholder="Chọn hình thức..."
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Ngày tạo hóa đơn</label>
                <input type="datetime-local" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="col-md-12 mb-3">
                <label className="form-label">Ghi chú</label>
                <textarea className="form-control" placeholder="Nhập ghi chú" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>

            <div className="d-flex justify-content-end pt-3 border-top">
              <button type="button" className="btn btn-light me-2" onClick={onClose}>
                Hủy
              </button>
              <button type="submit" className="btn btn-primary">
                {mode === "add" ? "Tạo hoá đơn" : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* <ModalProduct type="add" shown={showProductModal} onClose={() => setShowProductModal(false)} onSubmit={handleCreateNewProduct} />
      <ModalService type="add" shown={showServiceModal} onClose={() => setShowServiceModal(false)} onSubmit={handleCreateNewService} /> */}
      {showProductModal && (
        <ModalProduct type="add" shown={showProductModal} onClose={() => setShowProductModal(false)} onSubmit={handleCreateNewProduct} />
      )}

      {showServiceModal && (
        <ModalService type="add" shown={showServiceModal} onClose={() => setShowServiceModal(false)} onSubmit={handleCreateNewService} />
      )}

      {deleteData && (
        <div className="modal fade show d-block" style={{ zIndex: 1100 }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content p-4 text-center">
              <h5 className="mb-3">Xóa {deleteData.type === "product" ? "sản phẩm" : "dịch vụ"}?</h5>
              <div className="d-flex gap-2 justify-content-center">
                <button type="button" className="btn btn-light w-100" onClick={() => setDeleteData(null)}>
                  Hủy
                </button>
                <button type="button" className="btn btn-primary w-100" onClick={confirmDelete}>
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {deleteData && <div className="modal-backdrop fade show" style={{ zIndex: 1090 }} />}
    </>
  );
}

function DeleteModal({ shown, onClose, onDelete }: { shown: boolean; onClose: () => void; onDelete?: () => void }) {
  return (
    <Fragment>
      <div className={`modal fade ${shown ? "show d-block" : "d-block"}`} aria-modal>
        <div className="modal-dialog modal-dialog-centered modal-sm rounded-0">
          <div className="modal-content rounded-0 border-radius">
            <div className="modal-body p-4 text-center position-relative">
              <div className="mb-3 position-relative z-1">
                <span className="avatar avatar-xl badge-soft-danger border-0 text-danger rounded-circle">
                  <i className="ti ti-trash fs-24"></i>
                </span>
              </div>
              <h5 className="mb-1">Xóa hoá đơn</h5>
              <p className="mb-3">Bạn có chắc muốn xóa hoá đơn này không?</p>
              <div className="d-flex justify-content-center">
                <button type="button" className="btn btn-sm btn-light position-relative z-1 me-2 w-100" onClick={onClose}>
                  Hủy
                </button>
                <button type="button" className="btn btn-sm btn-primary position-relative z-1 w-100" onClick={onDelete}>
                  Đồng ý, xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={`modal-backdrop fade ${shown ? "show" : ""}`} />
    </Fragment>
  );
}

function DetailModal({ shown, onClose, item }: { shown: boolean; onClose: () => void; item: IInvoiceResponse }) {
  const [contactInfo, setContactInfo] = useState<{ phone: string; email: string }>({
    phone: item.phone || "-",
    email: item.email || "-",
  });

  useEffect(() => {
    if (shown && item?.customerId && (!item.phone || !item.email)) {
      (async () => {
        const token = getCookie("token") || "";
        const res = await CustomerService.detail(item.customerId, token);
        if (res?.result) setContactInfo(res.result);
      })();
    }
  }, [shown, item]);

  return (
    <Fragment>
      <div className={`modal fade ${shown ? "show d-block" : "d-none"}`} aria-modal="true" role="dialog">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="modal-header">
              <h5 className="modal-title">Chi tiết hóa đơn #{item.invoiceCode}</h5>
              <button className="btn-close custom-btn-close border p-1 me-0 text-dark" onClick={onClose} />
            </div>
            <div className="modal-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  <strong>Khách hàng:</strong> {item.customerName}
                </li>
                <li className="list-group-item">
                  <strong>Số điện thoại:</strong> {contactInfo.phone}
                </li>
                <li className="list-group-item">
                  <strong>Email:</strong> {contactInfo.email}
                </li>
                <li className="list-group-item">
                  <strong>Tổng tiền:</strong> {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.amount)}
                </li>
                <li className="list-group-item">
                  <strong>Hình thức thanh toán:</strong> {item.paymentType === 2 ? "Chuyển khoản" : "Tiền mặt"}
                </li>
                <li className="list-group-item">
                  <strong>Trạng thái:</strong>{" "}
                  {item.status === 1 ? (
                    <span className="badge badge-soft-success">Hoàn thành</span>
                  ) : (
                    <span className="badge badge-soft-warning">Chờ xử lý</span>
                  )}
                </li>
                <li className="list-group-item">
                  <strong>Ngày tạo:</strong> {item.createdTime ? new Date(item.createdTime).toLocaleString("vi-VN") : "-"}
                </li>
              </ul>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={onClose}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className={`modal-backdrop fade ${shown ? "show" : ""}`} />
    </Fragment>
  );
}

export default function ModalInvoice({ type, shown, item, onClose, onSubmit, onDelete }: Props) {
  if (!type) return null;

  return (
    <Fragment>
      {(type === "add" || type === "edit") && <OffcanvasForm mode={type} shown={shown} item={item} onClose={onClose} onSubmit={onSubmit} />}

      {type === "delete" && <DeleteModal shown={shown} onClose={onClose} onDelete={onDelete} />}

      {type === "detail" && item && <DetailModal shown={shown} onClose={onClose} item={item} />}

      {(type === "add" || type === "edit") && <div className="offcanvas-backdrop fade show" onClick={onClose}></div>}
    </Fragment>
  );
}
