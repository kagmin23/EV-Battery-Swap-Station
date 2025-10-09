const CabinetManagement = () => {
  return (
    <div className="page-container">
      <h1>Quản lý Cabinet</h1>
      <div className="page-content">
        <p>Trang quản lý các tủ pin trong hệ thống.</p>
        <div className="management-section">
          <div className="section-header">
            <h2>Danh sách Cabinet</h2>
            <button className="btn-primary">+ Thêm Cabinet mới</button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên Cabinet</th>
                  <th>Vị trí</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                    Chưa có dữ liệu
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CabinetManagement;

