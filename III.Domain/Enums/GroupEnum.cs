using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace III.Domain.Enums
{
    //Group Enum lấy dữ liệu combobox
    public enum EmployeeEnum
    {
        [Display(Name = "EMPLOYEE")]
        [Description("Nhân sự")]
        Employee = 1,

        [Display(Name = "EMPLOYEE_TYPE")]
        [Description("Loại nhân viên")]
        EmployeeType = 2,

        [Display(Name = "EMPLOYEE_GROUP")]
        [Description("Nhóm nhân viên")]
        EmployeeGroup = 3,

        [Display(Name = "EMPLOYEE_STYLE")]
        [Description("Kiểu nhân viên")]
        EmployeeStyle = 4,
    }
    public enum CMSEnum
    {
        [Display(Name = "CMS")]
        [Description("Quản lý nội dung")]
        CMS = 1,

        [Display(Name = "CMS_TEMPLATE")]
        [Description("Template")]
        CMSTemplate = 2,
        [Display(Name = "CMS_BLOCK")]
        [Description("Danh sách Block hiển thị")]
        CMSBlock = 3,

    }

    public enum ContractEnum
    {
        [Display(Name = "CONTRACT")]
        [Description("Hợp đồng")]
        Contract = 1,

        [Display(Name = "CONTRACT_TYPE")]
        [Description("Loại hợp đồng")]
        ContractType = 2,

        [Display(Name = "CONTRACT_STATUS")]
        [Description("Trạng thái hợp đồng")]
        ContractStatus = 3,

        [Display(Name = "CONTRACT_EXTEND_GROUP")]
        [Description("Thuộc tính mở rộng của hợp đồng")]
        ContractExtend = 4,

        [Display(Name = "CONTRACT_STATUS_PO_CUS")]
        [Description("Trạng thái hợp đồng/Đơn hàng")]
        ContractStatusPoCus = 5,

        [Display(Name = "CONTRACT_STATUS_PO_SUP")]
        [Description("Trạng thái đặt hàng(Nhà cung cấp)")]
        ContractStatusPoSup = 6,

        [Display(Name = "CONTRACT_RELATIVE")]
        [Description("Mối liên hệ")]
        ContractRelative = 7,

        [Display(Name = "REQUEST_IMPORT_PRODUCT")]
        [Description("Y/C đặt hàng")]
        RequestImportProduct = 8,

        [Display(Name = "REQUEST_WORK_PRICE")]
        [Description("Y/C hỏi giá")]
        RequestWorkPrice = 9,
    }

    public enum PoSupplierEnum
    {
        [Display(Name = "PO_SUPPLIER")]
        [Description("Đặt hàng nhà cung cấp")]
        PoSupplier = 1,
    }

    public enum SupplierEnum
    {
        [Display(Name = "SUPPLIER")]
        [Description("Nhà cung cấp")]
        Supplier = 1,

        [Display(Name = "SUPPLIER_GROUP")]
        [Description("Nhóm nhà cung cấp")]
        SupplierGroup = 2,

        [Display(Name = "SUPPLIER_STATUS")]
        [Description("Trạng thái nhà cung cấp")]
        SupplierStatus = 3,

        [Display(Name = "SUPPLIER_ROLE")]
        [Description("Trạng thái nhà cung cấp")]
        SupplierRole = 4,

        [Display(Name = "SUPPLIER_TYPE")]
        [Description("Loại nhà cung cấp")]
        SupplierType = 5,
    }

    public enum CustomerEnum
    {
        [Display(Name = "CUSTOMER")]
        [Description("Khách hàng")]
        Customer = 1,

        [Display(Name = "CUSTOMER_GROUP")]
        [Description("Nhóm khách hàng")]
        CustomerGroup = 2,

        [Display(Name = "CUSTOMER_ROLE")]
        [Description("Vai trò khách hàng")]
        CustomerRole = 3,


        [Display(Name = "CUSTOMER_STATUS")]
        [Description("Trạng thái khách hàng")]
        CustomerStatus = 4,

        [Display(Name = "CUSTOMER_TYPE")]
        [Description("Loại khách hàng")]
        CustomerType = 5,
    }

    public enum HrEmployeeEnum
    {
        [Display(Name = "EMPLOYEE")]
        [Description("Khách hàng")]
        HrEmployeeEnum = 1,
    }

    public enum CustomerRoleEnum
    {
        [Display(Name = "CUSTOMER_AGENCY")]
        [Description("Đại lý")]
        Agency = 1,

        [Display(Name = "CUSTOMER_ARCHITECTURAL")]
        [Description("Công ty Kiến trúc/Người giới thiệu")]
        Architectural = 2,

        [Display(Name = "CUSTOMER_PROJECT")]
        [Description("Dự án")]
        Project = 3,

        [Display(Name = "CUSTOMER_RETAIL")]
        [Description("Khách lẻ")]
        Retail = 4,

        [Display(Name = "CUSTOMER_ROLE_OTHER")]
        [Description("Khác")]
        Other = 5,
    }

    public enum AssetEnum
    {
        [Display(Name = "ASSET")]
        [Description("Tài sản")]
        Asset = 1,

        [Display(Name = "ASSET_TYPE")]
        [Description("Loại tài sản")]
        AssetType = 2,

        [Display(Name = "ASSET_GROUP")]
        [Description("Nhóm tài sản")]
        AssetGroup = 3,

        [Display(Name = "ASSET_ACTIVITY_TYPE")]
        [Description("Hoạt động của tài sản")]
        AssetActivityType = 4,
    }

    public enum ServiceEnum
    {
        [Display(Name = "SERVICE")]
        [Description("Dịch vụ")]
        Service = 1,

        [Display(Name = "MAIN_SERVICE")]
        [Description("Dịch vụ chính")]
        MainService = 2,

        [Display(Name = "SERVICE_GROUP")]
        [Description("Nhóm dịch vụ")]
        ServiceGroup = 3,

        [Display(Name = "SERVICE_UNIT")]
        [Description("Đơn vị dịch vụ")]
        ServiceUnit = 4,

        [Display(Name = "SERVICE_UNIT_VALUE")]
        [Description("Đơn vị giá trị")]
        ServiceUnitValue = 5,

        [Display(Name = "SERVICE_CONDITION")]
        [Description("Điều kiện ràng buộc")]
        ServiceCondition = 6,

        [Display(Name = "SERVICE_STATUS")]
        [Description("Trạng thái dịch vụ")]
        ServiceStatus = 7,

        [Display(Name = "SERVER_LEVEL")]
        [Description("Cấp độ dịch vụ")]
        ServiceLevel = 8,
    }

    public enum PaymentEnum
    {
        [Display(Name = "PAYMENT")]
        [Description("Thanh toán")]
        Payment = 1,

        [Display(Name = "PAY_OBJ_TYOE")]
        [Description("Đối tượng thanh toán")]
        PayObjTyoe = 2,

        [Display(Name = "PAY_TYPE")]
        [Description("Loại thanh toán")]
        PayType = 3,
    }

    public enum PublishEnum
    {
        [Display(Name = "PUBLISH")]
        [Description("Phần dùng chung")]
        Publish = 1,

        [Display(Name = "STATUS")]
        [Description("Trạng thái")]
        Status = 2,

        [Display(Name = "ORIGIN")]
        [Description("Xuất xứ")]
        Origin = 3,

        [Display(Name = "CURRENCY_TYPE")]
        [Description("Loại tiến")]
        CurrencyType = 4,

        [Display(Name = "UNIT")]
        [Description("Đơn vị")]
        Unit = 5,

        [Display(Name = "PRODUCT_GROUP")]
        [Description("Nhóm sản phẩm")]
        ProductGroup = 6,

        [Display(Name = "TASK")]
        [Description("Công việc")]
        Task = 7,

        [Display(Name = "PROGRAM_LANGUAGE")]
        [Description("Ngôn ngữ")]
        ProgramLanguage = 8,

        [Display(Name = "TABLE")]
        [Description("Số dòng hiển thị trong 1 bảng")]
        Table = 9,

        [Display(Name = "ATTR_UNIT")]
        [Description("Đơn vị thuộc tính")]
        AttrUnit = 10,

        [Display(Name = "ATTR_GROUP")]
        [Description("Nhóm thuộc tính")]
        AttrGroup = 11,

        [Display(Name = "ATTR_DATA_TYPE")]
        [Description("Kiểu dữ liệu")]
        AttrDataType = 12,
    }

    public enum ProjectEnum
    {
        [Display(Name = "PROJECT")]
        [Description("Dự án")]
        Project = 1,

        [Display(Name = "PRO_CURENCY")]
        [Description("Đơn vị")]
        ProCurrency = 2,

        [Display(Name = "PRO_STATUS")]
        [Description("Trạng thái")]
        ProStatus = 3,

        [Display(Name = "PRO_TYPE")]
        [Description("Loại dự án")]
        ProType = 4,

        [Display(Name = "PRO_SET_PRIORITY")]
        [Description("Thiết lập ưu tiên")]
        ProSetPriority = 5,

        [Display(Name = "PRO_ROLE")]
        [Description("Vai trò")]
        ProRole = 6,
    }

    public enum CardEnum
    {
        [Display(Name = "CARDJOB")]
        [Description("Thẻ việc")]
        CardJob = 1,

        [Display(Name = "OBJ_DEPENDENCY")]
        [Description("Đối tượng liên quan")]
        ObjDependency = 2,

        [Display(Name = "OBJ_WORKTYPE")]
        [Description("Loại công việc")]
        ObjWorkType = 3,

        [Display(Name = "OBJ_RELATIVE")]
        [Description("Quan hệ")]
        ObjRelative = 4,

        [Display(Name = "STATUS")]
        [Description("Trạng thái")]
        Stautus = 5,

        [Display(Name = "LEVEL")]
        [Description("Cấp độ")]
        Level = 6,

        [Display(Name = "CARD_ROLE")]
        [Description("Vai trò")]
        Role = 7,

        [Display(Name = "TeamAssign")]
        [Description("Nhóm được giao việc")]
        TeamAssignWork = 8,

        [Display(Name = "DepartmentAssign")]
        [Description("Phòng được giao việc")]
        DepartmentAssignWork = 9,

        [Display(Name = "NOTIFICATION")]
        [Description("Thông báo")]
        Notification = 10,

        [Display(Name = "NOTIFICATION_CARD")]
        [Description("Mã cài đặt thông báo thẻ việc")]
        NotificationCard = 11,

        [Display(Name = "YES")]
        [Description("Giá trị cài đặt thông báo thẻ việc")]
        NotificationCardYes = 11,

        [Display(Name = "NO")]
        [Description("Giá trị cài đặt thông báo thẻ việc")]
        NotificationCardNo = 11,
    }

    public enum WarehouseEnum
    {
        [Display(Name = "WAREHOUSE")]
        [Description("Kho và bán hàng")]
        Warehouse = 1,

        [Display(Name = "IMP_STATUS")]
        [Description("Yêu cầu nhập khẩu")]
        ImpStatus = 2,

        [Display(Name = "UNIT")]
        [Description("Đơn vị sản phẩm")]
        UnitProduct = 3,
        [Display(Name = "CAT_STATUS")]
        [Description("Trạng thái danh mục sản phẩm")]
        CatStatus = 4,

        [Display(Name = "PRICE_STATUS")]
        [Description("Yêu cầu hỏi giá")]
        PriceStatus = 5,
    }
    public enum FundEnum
    {
        [Display(Name = "FUND")]
        [Description("Quản lỹ quỹ")]
        Fund = 1,

        [Display(Name = "FUND_RELATIVE")]
        [Description("Quan hệ")]
        FundRelative = 2,
    }

    public enum CommonEnum
    {
        [Display(Name = "AREA")]
        [Description("Vùng khách hàng,Nhà cung cấp")]
        Area = 1,

        [Display(Name = "UNIT")]
        [Description("Đơn vị")]
        Unit = 2,

        [Display(Name = "CURRENCY_TYPE")]
        [Description("Loại tiền")]
        Currency = 3,
    }

    public enum DataTypeEnum
    {
        [Display(Name = "NUMBER")]
        [Description("Số")]
        Number = 1,

        [Display(Name = "TEXT")]
        [Description("Chuỗi kí tự")]
        Text = 2,

        [Display(Name = "DATETIME")]
        [Description("Ngày tháng")]
        DateTime = 3,

        [Display(Name = "MONEY")]
        [Description("Tiền tệ")]
        Money = 4,
    }

    public enum TypeConnection
    {
        [Display(Name = "DRIVER")]
        [Description("Google driver")]
        GooglerDriver = 1,

        [Display(Name = "DROPBOX")]
        [Description("Dropbox")]
        DropBox = 2,

        [Display(Name = "SERVER")]
        [Description("Server")]
        Server = 3,
    }
    public enum UnitDuration
    {
        [Display(Name = "DATE")]
        [Description("Ngày")]
        Date = 1,

        [Display(Name = "MONTH")]
        [Description("Tháng")]
        Month = 2,

        [Display(Name = "YEAR")]
        [Description("Năm")]
        Year = 3,
    }
    public enum TypeWork
    {
        [Display(Name = "P")]
        [Description("PartTime")]
        P = 1,

        [Display(Name = "F")]
        [Description("FullTime")]
        F = 2,
    }
    public enum EnumMaterialProduct
    {
        [Display(Name = "PRODUCT")]
        [Description("Sản phẩm")]
        Product = 1,

        [Display(Name = "PRODUCT_IMP_TYPE")]
        [Description("Loại hình nhập kho")]
        ProductImpType = 2,
    }
    public enum PriceAgency
    {
        [Display(Name = "PRICE_COST_CATELOGUE")]
        [Description("Giá đại lý catalogue")]
        Catelogue = 1,

        [Display(Name = "PRICE_COST_AIRLINE")]
        [Description("Giá đại lý đường bay")]
        Airline = 2,

        [Display(Name = "PRICE_COST_SEA")]
        [Description("Giá đại lý đường biển")]
        Sea = 3,
    }

    public enum PriceRetail
    {
        [Display(Name = "PRICE_RETAIL_BUILD")]
        [Description("Giá bán lẻ có thi công")]
        Buid = 1,

        [Display(Name = "PRICE_RETAIL_BUILD_AIRLINE")]
        [Description("Giá bán lẻ có thi công bay")]
        Airline = 2,

        [Display(Name = "PRICE_RETAIL_BUILD_SEA")]
        [Description("Giá bán lẻ có thi công kho,biển")]
        Sea = 3,

        [Display(Name = "PRICE_RETAIL_NO_BUILD")]
        [Description("Giá bán lẻ không thi công")]
        NoBuid = 4,

        [Display(Name = "PRICE_RETAIL_NO_BUILD_AIRLINE")]
        [Description("Giá bán lẻ không thi công bay")]
        NoBuidAirline = 5,

        [Display(Name = "PRICE_RETAIL_NO_BUILD_SEA")]
        [Description("Giá bán lẻ không thi công kho, biển")]
        NoBuidSea = 6,
    }

    public enum All
    {
        [Display(Name = "All")]
        [Description("Tất cả")]
        All = 1,
    }

    public enum StaffEnum
    {
        [Display(Name = "Shift")]
        [Description("Ca làm việc")]
        Shift = 1,
    }
    public enum UserEnum
    {
        [Display(Name = "ROLE_COMBINATION")]
        [Description("Loại hình")]
        Combination = 1,
    }

    public enum MappingEnum
    {
        [Display(Name = "MAPPING_RELATIVE")]
        [Description("Quan hệ")]
        Relative = 1,

        [Display(Name = "REQ_PRICE")]
        [Description("Y/C đặt hàng")]
        RqPrice = 2,

        [Display(Name = "PO_BUY")]
        [Description("Hợp đồng mua")]
        PoBuy = 3,

        [Display(Name = "PROJECT")]
        [Description("Dự án")]
        Project = 4,

        [Display(Name = "PO_SALE")]
        [Description("Hợp đồng bán")]
        PoSale = 5,
    }

    public enum UserBusyOrFreeEnum
    {
        [Display(Name = "STAFF_BUSY")]
        [Description("Bận")]
        Busy = 0,
        [Display(Name = "STAFF_FREE")]
        [Description("Rảnh")]
        Free = 1,
    }
}
