export default function Footer() {
  return (
    <footer className="footer d-block d-md-flex justify-content-between text-md-start text-center">
      <p className="mb-md-0 mb-1">
        Copyright &copy; {new Date().getFullYear()}{" "}
        <a href="javascript:void(0);" className="link-primary text-decoration-underline">
          CRMS
        </a>
      </p>
      <div className="d-flex align-items-center gap-2 footer-links justify-content-center justify-content-md-end">
        <a href="javascript:void(0);">Giới thiệu</a>
        <a href="javascript:void(0);">Điều khoản</a>
        <a href="javascript:void(0);">Liên hệ</a>
      </div>
    </footer>
  );
}
