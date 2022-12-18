using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using static III.Admin.Controllers.ContractController;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class CarMaintenanceController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private static AsyncLocker<string> userLock = new AsyncLocker<string>();
        private readonly IStringLocalizer<ContractPoController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IRepositoryService _repositoryService;
        public CarMaintenanceController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IStringLocalizer<ContractPoController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources,
            IRepositoryService repositoryService)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _repositoryService = repositoryService;
        }
        public IActionResult Index()
        {
            return View();
        }

        #region Car Maintenance Header
        public class JTableModelContract : JTableModel
        {
            public string Key { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string ContractCode { get; set; }
            public string PoSupCode { get; set; }
            public string Status { get; set; }
            public string BudgetF { get; set; }
            public string BudgetT { get; set; }
            public string Signer { get; set; }
            public string Currency { get; set; }
            public string ProjectCode { get; set; }
            public string BranchId { get; set; }
        }

        public class JTableModelDetail : JTableModel
        {
            public string PoSupCode { get; set; }
        }
        public class RequestModel
        {
            public string Code { get; set; }
            public string Name { get; set; }
            public string PoCode { get; set; }
        }
        [HttpPost]
        public object JTable([FromBody]JTableModelContract jTablePara)
        {
            var session = HttpContext.GetSessionUser();

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            string poSupCode = jTablePara.PoSupCode;
            string status = jTablePara.Status;

            var query = (from a in _context.PoBuyerHeaderPayments
                         .Where(x => !x.IsDeleted && ((fromDate == null) || (x.CreatedTime.HasValue && x.CreatedTime.Value.Date >= fromDate)) &&
                               ((toDate == null) || (x.CreatedTime.HasValue && x.CreatedTime.Value.Date <= toDate)) &&
                               (string.IsNullOrEmpty(jTablePara.PoSupCode) || x.PoSupCode.ToLower().Contains(poSupCode.ToLower()) || (x.PoTitle.ToLower().Contains(poSupCode.ToLower()))) &&
                               (string.IsNullOrEmpty(jTablePara.Status) || x.Status.Equals(status)))
                         join b in _context.Customerss.Where(x => !x.IsDeleted) on a.BuyerCode equals b.CusCode
                         join c in _context.Suppliers.Where(x => !x.IsDeleted) on a.SupCode equals c.SupCode
                         join d in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals d.CodeSet into d1
                         from d2 in d1.DefaultIfEmpty()
                             //from e in _context.RequestImpProductHeaders
                             //join f in _context.PoBuyerDetails on e.ReqCode equals f.ReqCode
                             //join g in _context.PoSaleHeaders
                         from e in _context.PoBuyerDetails.Where(x => x.PoSupCode == a.PoSupCode && x.Type == "REQUEST")
                         join f in _context.RequestImpProductHeaders on e.ReqCode equals f.ReqCode
                         join k in _context.Users.Where(x => x.Active) on a.CreatedBy equals k.UserName
                         //join g in _context.PoSaleHeaders.Where(x => !x.IsDeleted) on f.PoCode equals g.ContractCode

                         //join e in _context.PoBuyerDetails on a.PoSupCode equals e.PoSupCode into e2
                         //from e in e2.DefaultIfEmpty()

                         //join e in _context.PoBuyerDetails.Where(x => x.Type == "REQUEST") on a.PoSupCode equals e.PoSupCode
                         //join f in _context.RequestImpProductHeaders on e.ReqCode equals f.ReqCode
                         //join g in _context.PoSaleHeaders on f.PoCode equals g.ContractCode
                         where (string.IsNullOrEmpty(jTablePara.ContractCode) || f.PoCode == jTablePara.ContractCode)
                         && (string.IsNullOrEmpty(jTablePara.ProjectCode) || f.ProjectCode == jTablePara.ProjectCode)
                         && (string.IsNullOrEmpty(jTablePara.BranchId) || k.BranchId.Equals(jTablePara.BranchId))
                         //Điều kiện phân quyền dữ liệu
                         && (session.IsAllData
                         || (!session.IsAllData && session.IsBranch && session.RoleCode.Equals(EnumHelper<Role>.GetDisplayValue(Role.Giamdoc)) && session.ListUserOfBranch.Any(x => x == a.CreatedBy))
                         || (!session.IsAllData && !session.IsBranch && session.IsUser && session.UserName == a.CreatedBy))
                         select new
                         {
                             Id = a.Id,
                             PoSupCode = a.PoSupCode,
                             PoTitle = a.PoTitle,
                             OrderBy = a.OrderBy,
                             Consigner = a.Consigner,
                             Mobile = a.Mobile,
                             Buyer = a.Buyer,
                             BuyerCode = a.BuyerCode + " - " + b.CusName,
                             SupCode = a.SupCode,
                             SupName = c.SupName,
                             CreatedBy = a.CreatedBy,
                             CreatedTime = a.CreatedTime,
                             Status = d2.ValueSet,
                             Icon = d2.Logo,
                             Type = a.Type,
                             //TotalAmount = a.TotalAmount,
                             //TotalPayment = a.TotalPayment,
                             //ContractNo = (e == null ? "" : ""),
                         }).Distinct();
            
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "PoSupCode", "PoTitle", "OrderBy", "Consigner", "Mobile", "BuyerCode", "SupCode", "SupName", "CreatedTime", "Status", "Icon", "Type", "TotalAmount", "TotalPayment", "ContractNo", "Title");
            return Json(jdata);
        }
        [HttpPost]
        public async Task<JsonResult> Insert([FromBody]PoBuyerHeader obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                using (await userLock.LockAsync(obj.PoSupCode.ToLower()))
                {
                    DateTime? date = !string.IsNullOrEmpty(obj.sDateOfOrder) ? DateTime.ParseExact(obj.sDateOfOrder, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    DateTime? estimateDate = !string.IsNullOrEmpty(obj.sEstimateTime) ? DateTime.ParseExact(obj.sEstimateTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                    var data = _context.PoBuyerHeaders.FirstOrDefault(x => x.IsDeleted == false && x.PoSupCode.ToLower() == obj.PoSupCode.ToLower());
                    if (data == null)
                    {
                        obj.IsDeleted = false;
                        obj.DateOfOrder = date;
                        obj.CreatedBy = ESEIM.AppContext.UserName;
                        obj.CreatedTime = DateTime.Now;
                        obj.EstimateTime = estimateDate;
                        //Facco bỏ title => lấy mặc định = code để view ra
                        obj.PoTitle = obj.PoSupCode;
                        obj.ListUserView = ESEIM.AppContext.UserId;
                        //obj.Confirm = InsertConfirmText(obj.Confirm);
                        _context.PoBuyerHeaders.Add(obj);
                        _context.SaveChanges();
                        msg.Title = String.Format(_stringLocalizer["CP_MSG_ADD_ORDER_SUCCESS"]);//"Thêm mới thành công đơn đặt hàng";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["CP_MSG_NOT_ADD_NEW"]);//"Mã đơn đặt hàng đã tồn tại, không thể thêm mới";
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["CP_MSG_ADD_ERROR"]);//"Có lỗi khi thêm đơn đặt hàng";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Update([FromBody]PoBuyerHeader obj)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                DateTime? date = !string.IsNullOrEmpty(obj.sDateOfOrder) ? DateTime.ParseExact(obj.sDateOfOrder, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                DateTime? estimateDate = !string.IsNullOrEmpty(obj.sEstimateTime) ? DateTime.ParseExact(obj.sEstimateTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                var checkImp = _context.ProdReceivedDetails.FirstOrDefault(x => x.LotProductCode.Equals(obj.PoSupCode));
                //Kiểm tra đơn hàng đã được nhập kho chưa nếu nhập kho rồi thì không được sửa
                if (checkImp != null)
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CP_MSG_ENTERED_NOT_ADD_EDIT_EDLETE"]);//"Đơn đặt hàng đã được nhập kho không được phép thêm,sửa,xóa";
                }
                else
                {
                    var data = _context.PoBuyerHeaders.FirstOrDefault(x => x.IsDeleted == false && x.Id == obj.Id);
                    var status = data.Status;
                    if (data != null)
                    {
                        var oldEtimateTime = data.EstimateTime;
                        data.PoTitle = obj.PoTitle;
                        data.DateOfOrder = date;
                        data.OrderBy = obj.OrderBy;
                        data.Buyer = obj.Buyer;
                        data.Email = obj.Email;
                        data.Status = obj.Status;
                        data.ShippingAdd = obj.ShippingAdd;
                        data.Consigner = obj.Consigner;
                        data.Mobile = obj.Mobile;
                        data.PaymentTerm = obj.PaymentTerm;
                        data.Noted = obj.Noted;
                        data.BuyerCode = obj.BuyerCode;
                        data.SupCode = obj.SupCode;
                        data.Type = obj.Type;
                        data.EstimateTime = estimateDate;
                        data.Currency = obj.Currency;
                        data.ExchangeRate = obj.ExchangeRate;
                        data.ContractCode = obj.ContractCode;
                        data.ProjectCode = obj.ProjectCode;
                        data.ListUserView = ESEIM.AppContext.UserId;
                        data.UpdatedBy = ESEIM.AppContext.UserName;
                        data.UpdatedTime = DateTime.Now;
                        _context.PoBuyerHeaders.Update(data);
                        _context.SaveChanges();
                        msg.Title = String.Format(_stringLocalizer["CP_MSG_UPDATE_SUCCESS"]);//"Cập nhật thành công đơn đặt hàng";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["CP_MSG_UPDATE_REFRESH"]);//"Đơn đặt hàng không tồn tại, vui lòng làm mới trang";
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["CP_MSG_UPDATE_ERROR"]);//"Có lỗi khi cập nhật đơn đặt hàng";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Delete(int id)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var data = _context.PoBuyerHeaders.FirstOrDefault(x => x.IsDeleted == false && x.Id == id);
                var status = data.Status;
                if (data != null)
                {
                    var checkImp = _context.ProdReceivedDetails.Any(x => !x.IsDeleted && x.LotProductCode.Equals(data.PoSupCode));
                    //Kiểm tra đơn hàng đã được nhập kho chưa nếu nhập kho rồi thì không được sửa
                    if (checkImp)
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["CP_MSG_NOT_DELETE"]);//"Đơn đặt hàng đã được nhập kho không được phép xóa";
                        return Json(msg);
                    }

                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    data.IsDeleted = true;
                    _context.PoBuyerHeaders.Update(data);
                    _context.SaveChanges();

                    msg.Title = String.Format(_stringLocalizer["CP_MSG_DELETE_SUCCESS"]);//"Xóa thành công đơn đặt hàng";

                    var listPoSupDetails = _context.PoBuyerDetails.Where(x => !x.IsDeleted && x.PoSupCode == data.PoSupCode).ToList();
                    listPoSupDetails.ForEach(x => { x.IsDeleted = true; x.DeletedBy = ESEIM.AppContext.UserName; x.DeletedTime = DateTime.Now.Date; });
                    _context.PoBuyerDetails.UpdateRange(listPoSupDetails);

                    var listRequestPoSups = _context.RequestPoSups.Where(x => !x.IsDeleted && x.PoSupCode == data.PoSupCode).ToList();
                    listRequestPoSups.ForEach(x => { x.IsDeleted = true; x.DeletedBy = ESEIM.AppContext.UserName; x.DeletedTime = DateTime.Now.Date; });
                    _context.RequestPoSups.UpdateRange(listRequestPoSups);

                    var listPoSupAttributes = _context.PoSupAttributes.Where(x => !x.IsDeleted && x.PoSupCode == data.PoSupCode).ToList();
                    listPoSupAttributes.ForEach(x => { x.IsDeleted = true; x.DeletedBy = ESEIM.AppContext.UserName; x.DeletedTime = DateTime.Now.Date; });
                    _context.PoSupAttributes.UpdateRange(listPoSupAttributes);

                    _context.SaveChanges();
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CP_MSG_DELETE_REFRESH"]);//"Đơn đặt hàng không tồn tại, vui lòng làm mới trang";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["CP_MSG_DELETE_ERROR"]);//"Có lỗi khi xóa đơn đặt hàng";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetItem(int Id)
        {
            var data = _context.PoBuyerHeaders.FirstOrDefault(x => x.Id == Id);
            data.ListUserView += ";" + ESEIM.AppContext.UserId;
            _context.SaveChanges();
            data.sEstimateTime = data.EstimateTime.HasValue ? data.EstimateTime.Value.ToString("dd/MM/yyyy") : null;
            JMessage msg = new JMessage();
            msg.Object = data;
            return Json(msg);
        }
        #endregion

        #region Detail
        public class JTableModelPayment : JTableModel
        {
            public string ContractCode { get; set; }
            public string PaymentName { get; set; }
            public string PaymentType { get; set; }
            public string FromTo { get; set; }
            public string DateTo { get; set; }
        }
        public object JTableDetail([FromBody]JTableModelDetail jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.PoBuyerDetails.Where(x => !x.IsDeleted && x.PoSupCode.Equals(jTablePara.PoSupCode))
                            //join b in _context.SubProducts on a.ProductCode equals b.ProductQrCode into b1
                            //from b2 in b1.DefaultIfEmpty()
                            //join c in _context.MaterialProducts on a.ProductCode equals c.ProductCode into c1
                            //from c2 in c1.DefaultIfEmpty()
                        join d in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Unit equals d.CodeSet into d1
                        from d2 in d1.DefaultIfEmpty()
                        join e in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Currency equals e.CodeSet into e1
                        from e2 in e1.DefaultIfEmpty()
                        where a.PoSupCode.Equals(jTablePara.PoSupCode) && a.Type == "STORAGE"
                        select new
                        {
                            a.Id,
                            a.PoSupCode,
                            ProductName = a.ProductType == "SUB_PRODUCT" ? _context.SubProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(a.ProductCode)) != null ? _context.SubProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(a.ProductCode)).AttributeName : null : _context.MaterialProducts.FirstOrDefault(p => !p.IsDeleted && p.ProductCode.Equals(a.ProductCode)) != null ? _context.MaterialProducts.FirstOrDefault(p => !p.IsDeleted && p.ProductCode.Equals(a.ProductCode)).ProductName : null,
                            a.ProductCode,
                            a.Quantity,
                            a.Unit,
                            UnitName = d2.ValueSet,
                            a.UnitPrice,
                            a.Note,
                            a.TotalAmount,
                            a.ProductType,
                            ProductTypeName = a.ProductType == "SUB_PRODUCT" ? "Nguyên liệu" : "Thành phẩm",
                            a.Currency,
                            CurrencyName = e2.ValueSet,
                        };

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "PoSupCode", "ProductCode", "ProductName", "Quantity", "Unit", "UnitName", "UnitPrice", "Note", "TotalAmount", "ProductType", "ProductTypeName", "Currency", "CurrencyName");
            return Json(jdata);
        }
        [HttpPost]
        public async Task<JsonResult> InsertDetail([FromBody]PoBuyerDetail obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var checkImp = _context.ProdReceivedDetails.FirstOrDefault(x => x.LotProductCode.Equals(obj.PoSupCode));
                //Kiểm tra đơn hàng đã được nhập kho chưa nếu nhập kho rồi thì không được sửa
                if (checkImp != null)
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CP_MSG_ENTERED_NOT_ADD_EDIT_EDLETE"]);//"Đơn đặt hàng đã được nhập kho không được phép thêm,sửa,xóa";
                }
                else
                {
                    using (await userLock.LockAsync(obj.ProductCode.ToLower()))
                    {
                        var data = _context.PoBuyerDetails.FirstOrDefault(x => x.IsDeleted == false && x.PoSupCode == obj.PoSupCode && x.ProductCode == obj.ProductCode && x.ProductType == obj.ProductType);
                        if (data == null)
                        {
                            obj.Id = 0;
                            obj.IsDeleted = false;
                            obj.CreatedBy = ESEIM.AppContext.UserName;
                            obj.CreatedTime = DateTime.Now;
                            obj.TotalAmount = obj.UnitPrice * int.Parse(obj.Quantity);
                            obj.QuantityNeedImport = decimal.Parse(obj.Quantity);
                            obj.Type = "STORAGE";

                            _context.PoBuyerDetails.Add(obj);
                            _context.SaveChanges();
                            msg.Title = String.Format(_stringLocalizer["CP_MSG_DELETE_ADD_PRODUCT_SUCCESS"]);//"Thêm mới sản phẩm thành công";
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = String.Format(_stringLocalizer["CP_MSG_CAN_NOT_ADD_NEW"]);//"Mã sản phẩm đã tồn tại, không thể thêm mới";
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["CP_MSG_ADD_ERROR"]);//"Có lỗi khi thêm sản phẩm";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateDetail([FromBody]PoBuyerDetail obj)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var checkImp = _context.ProdReceivedDetails.FirstOrDefault(x => x.LotProductCode.Equals(obj.PoSupCode));
                //Kiểm tra đơn hàng đã được nhập kho chưa nếu nhập kho rồi thì không được sửa
                if (checkImp != null)
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CP_MSG_ENTERED_NOT_ADD_EDIT_EDLETE"]);//"Đơn đặt hàng đã được nhập kho không được phép thêm,sửa,xóa";
                }
                else
                {
                    var data = _context.PoBuyerDetails.FirstOrDefault(x => x.IsDeleted == false && x.PoSupCode == obj.PoSupCode && x.ProductCode == obj.ProductCode && x.ProductType == obj.ProductType);
                    if (data != null)
                    {
                        int oldQuantity = int.Parse(data.Quantity);

                        data.Quantity = obj.Quantity;
                        data.TotalAmount = obj.UnitPrice * int.Parse(obj.Quantity);
                        data.QuantityNeedImport = decimal.Parse(obj.Quantity);
                        data.Unit = obj.Unit;
                        data.UnitPrice = obj.UnitPrice;
                        data.Note = obj.Note;
                        data.Currency = obj.Currency;
                        data.Type = "STORAGE";
                        data.UpdatedBy = ESEIM.AppContext.UserName;
                        data.UpdatedTime = DateTime.Now;

                        _context.PoBuyerDetails.Update(data);
                        _context.SaveChanges();
                        msg.Title = String.Format(_stringLocalizer["CP_MSG_EDIT_SUCCESS"]);//"Sửa sản phẩm thành công";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["CP_MSG_NOT_EDIT"]);//"Mã sản phẩm không tồn tại tồn tại, không thể chỉnh sửa";
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["CP_MSG_EDIT_ERROR"]);//"Có lỗi khi sửa sản phẩm";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult DeleteDetail(int id)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var data = _context.PoBuyerDetails.FirstOrDefault(x => x.IsDeleted == false && x.Id == id);
                if (data != null)
                {
                    var checkImp = _context.ProdReceivedDetails.FirstOrDefault(x => x.LotProductCode.Equals(data.PoSupCode));
                    //Kiểm tra đơn hàng đã được nhập kho chưa nếu nhập kho rồi thì không được sửa
                    if (checkImp != null)
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["CP_MSG_ENTERED_NOT_ADD_EDIT_EDLETE"]);//"Đơn đặt hàng đã được nhập kho không được phép thêm,sửa,xóa";
                    }
                    else
                    {
                        data.DeletedBy = ESEIM.AppContext.UserName;
                        data.DeletedTime = DateTime.Now;
                        data.IsDeleted = true;

                        _context.PoBuyerDetails.Update(data);
                        _context.SaveChanges();
                        msg.Title = String.Format(_stringLocalizer["CP_MSG_DELETE_SUCCESS1"]);//"Xóa sản phẩm thành công";

                        var contract = _context.PoBuyerHeaders.FirstOrDefault(x => x.PoSupCode == data.PoSupCode);
                        if (contract != null)
                        {
                            string[] param = new string[] { "@ProductCode", "@OldQuantity", "@NewQuantity", "@ProductType", "@EstimateDate" };
                            object[] val = new object[] { data.ProductCode, data.Quantity, 0, data.ProductType, contract.EstimateTime.Value.Date };
                            _repositoryService.CallProc("PR_UPDATE_PO_BUYER_DETAIL", param, val);

                        }
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["CP_MSG_NOT_EDIT"]);//"Mã sản phẩm không tồn tại tồn tại, không thể chỉnh sửa";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_stringLocalizer["CP_MSG_DELETE_SUCCESS"]);//"Có lỗi khi xóa sản phẩm";
            }
            return Json(msg);
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}