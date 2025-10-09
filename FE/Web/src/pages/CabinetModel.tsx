const CabinetModel = () => {
  return (
    <div className="page-container">
      <h1>Mô hình Cabinet</h1>
      <div className="page-content">
        <p>Trang quản lý các mô hình tủ pin.</p>
        <div className="management-section">
          <div className="section-header">
            <h2>Danh sách mô hình</h2>
            <button className="btn-primary">+ Thêm mô hình mới</button>
          </div>
          <div className="model-grid">
            <div className="model-card">
              <div className="model-icon">📦</div>
              <h3>Model A</h3>
              <p>Tủ pin tiêu chuẩn</p>
              <div className="model-specs">
                <span>Dung lượng: 48 pin</span>
              </div>
            </div>
            <div className="model-card">
              <div className="model-icon">📦</div>
              <h3>Model B</h3>
              <p>Tủ pin mở rộng</p>
              <div className="model-specs">
                <span>Dung lượng: 96 pin</span>
              </div>
            </div>
            <div className="model-card">
              <div className="model-icon">📦</div>
              <h3>Model C</h3>
              <p>Tủ pin cao cấp</p>
              <div className="model-specs">
                <span>Dung lượng: 144 pin</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CabinetModel;

