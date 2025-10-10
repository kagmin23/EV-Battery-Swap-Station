const Home = () => {
  return (
    <div className="page-container">
      <h1>Trang chủ</h1>
      <div className="page-content">
        <p>Chào mừng bạn đến với hệ thống quản lý trạm thay pin EV Battery Swap Station.</p>
        <div className="info-cards">
          <div className="info-card">
            <h3>📊 Dashboard</h3>
            <p>Xem tổng quan về hệ thống</p>
          </div>
          <div className="info-card">
            <h3>🔋 Quản lý Cabinet</h3>
            <p>Quản lý các tủ pin và mô hình</p>
          </div>
          <div className="info-card">
            <h3>📈 Thống kê</h3>
            <p>Xem báo cáo và phân tích dữ liệu</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

