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
    public class UrencoMaintenanceController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private static AsyncLocker<string> userLock = new AsyncLocker<string>();
        private readonly IStringLocalizer<UrencoMaintenanceController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IRepositoryService _repositoryService;
        public UrencoMaintenanceController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IStringLocalizer<UrencoMaintenanceController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources,
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
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string MtnCode { get; set; }
            public string CarPlate { get; set; }
        }

        public class JTableModelDetail : JTableModel
        {
            public string MtnCode { get; set; }
        }

        [HttpGet]
        public JsonResult GenMantenanceCode()
        {
            var monthNow = DateTime.Now.Month;
            var yearNow = DateTime.Now.Year;
            var reqCode = string.Empty;
            var no = 1;
            var noText = "01";
            var data = _context.UrencoCarMaintenanceHeaders.Where(x => x.CreatedTime.Value.Year == yearNow && x.CreatedTime.Value.Month == monthNow).ToList();
            if (data.Count > 0)
            {
                no = data.Count + 1;
                if (no < 10)
                {
                    noText = "0" + no;
                }
                else
                {
                    noText = no.ToString();
                }
            }

            reqCode = string.Format("{0}{1}{2}{3}", "REQ_MAINTENANCE_", "T" + monthNow + ".", yearNow + "_", noText);

            return Json(reqCode);
        }

        [HttpGet]
        public JsonResult GetListCar()
        {
            var data = from a in _context.UrencoTrashCars.Where(x => !x.IsDeleted)
                       join b in _context.CommonSettings on a.Type equals b.CodeSet into b2
                       from b1 in b2.DefaultIfEmpty()
                       join c in _context.AdOrganizations on a.BranchCode equals c.OrgAddonCode into c2
                       from c1 in c2.DefaultIfEmpty()
                       join d in _context.Users on a.DriverDefault equals d.UserName into d2
                       from d1 in d2.DefaultIfEmpty()
                       select new
                       {
                           Code = a.LicensePlate,
                           Name = b1 != null ? string.Format("{0} - {1}", a.LicensePlate, b1.ValueSet) : a.LicensePlate,
                           Info = (b1 != null || c1 != null) ? string.Format("{0} - {1} - Đơn vị: {2} - Lái xe: {3}", a.LicensePlate, b1 != null ? b1.ValueSet : "", c1 != null ? c1.OrgName : "", d1 != null ? d1.GivenName : "") : a.LicensePlate
                       };
            return Json(data);
        }

        [HttpPost]
        public object GetListType()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "MAINTENANCE_TYPE").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }

        [HttpGet]
        public object GetListService()
        {
            var data = from a in _context.ServiceCategorys.Where(x => !x.IsDeleted).Select(x => new { Code = x.ServiceCode, Name = x.ServiceName, x.Unit, x.ServiceType })
                       join b in _context.ServiceCategoryTypes.Where(x => !x.IsDeleted) on a.ServiceType equals b.Code into b1
                       from b2 in b1.DefaultIfEmpty()
                       select new
                       {
                           a.Code,
                           a.Name,
                           a.ServiceType,
                           a.Unit,
                           ServiceTypeName = b2 != null ? b2.Name : ""
                       };
            return data;
        }

        [HttpPost]
        public object JTable([FromBody]JTableModelContract jTablePara)
        {
            var session = HttpContext.GetSessionUser();

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var query = from a in _context.UrencoCarMaintenanceHeaders
                         .Where(x => !x.IsDeleted && ((fromDate == null) || (x.CreatedTime.HasValue && x.CreatedTime.Value.Date >= fromDate)) &&
                               ((toDate == null) || (x.CreatedTime.HasValue && x.CreatedTime.Value.Date <= toDate)) &&
                               ((string.IsNullOrEmpty(jTablePara.CarPlate)) || (x.CarPlate.Contains(jTablePara.CarPlate))) &&
                               ((string.IsNullOrEmpty(jTablePara.MtnCode)) || (x.MtnCode.Contains(jTablePara.MtnCode))))
                        select new
                        {
                            a.Id,
                            a.MtnCode,
                            a.Title,
                            a.CarPlate,
                            a.Note,
                            a.Gara,
                            StartDate = a.StartDate.HasValue ? a.StartDate.Value.ToString("dd/MM/yyyy") : "",
                            EndDate = a.EndDate.HasValue ? a.EndDate.Value.ToString("dd/MM/yyyy") : "",
                            a.CreatedBy,
                            CreatedTime = a.CreatedTime.HasValue ? a.CreatedTime.Value.ToString("dd/MM/yyyy") : "",
                            a.ApprovedBy,
                            ApprovedTime = a.ApprovedTime.HasValue ? a.ApprovedTime.Value.ToString("dd/MM/yyyy") : "",
                            a.Creator
                        };

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "MtnCode", "Title", "CarPlate", "Note", "Gara", "StartDate", "EndDate", "CreatedBy", "CreatedTime", "ApprovedBy", "ApprovedTime", "Creator");
            return Json(jdata);
        }
        [HttpPost]
        public async Task<JsonResult> Insert([FromBody]UrencoCarMaintenanceHeaderModel obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                using (await userLock.LockAsync(obj.MtnCode.ToLower()))
                {
                    DateTime? startDate = !string.IsNullOrEmpty(obj.StartDate) ? DateTime.ParseExact(obj.StartDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    DateTime? endDate = !string.IsNullOrEmpty(obj.EndDate) ? DateTime.ParseExact(obj.EndDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    DateTime? approvedTime = !string.IsNullOrEmpty(obj.ApprovedTime) ? DateTime.ParseExact(obj.ApprovedTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    DateTime? createTime = !string.IsNullOrEmpty(obj.CreatedDate) ? DateTime.ParseExact(obj.CreatedDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                    var data = _context.UrencoCarMaintenanceHeaders.FirstOrDefault(x => !x.IsDeleted && x.MtnCode == obj.MtnCode);
                    if (data == null)
                    {
                        var item = new UrencoCarMaintenanceHeader
                        {
                            MtnCode = obj.MtnCode,
                            Title = obj.Title,
                            CarPlate = obj.CarPlate,
                            Gara = obj.Gara,
                            StartDate = startDate,
                            EndDate = endDate,
                            Note = obj.Note,
                            Creator = obj.Creator,
                            ApprovedBy = obj.ApprovedBy,
                            ApprovedTime = approvedTime,
                            CreatedBy = User.Identity.Name,
                            CreatedTime = DateTime.Now,
                            CreatTime = createTime,
                            Type = obj.Type
                        };

                        _context.UrencoCarMaintenanceHeaders.Add(item);
                        _context.SaveChanges();
                        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["UM_LBL_MAINTENANCE"]);//"Thêm sửa chữa bảo dưỡng thành công!";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["UM_CURD_LBL_CODE"]); //"Mã phiếu đã tồn tại";
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], _stringLocalizer["UM_LBL_MAINTENANCE"]); //"Có lỗi xảy ra khi thêm sửa chữa bảo dưỡng!";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Update([FromBody]UrencoCarMaintenanceHeaderModel obj)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                DateTime? startDate = !string.IsNullOrEmpty(obj.StartDate) ? DateTime.ParseExact(obj.StartDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                DateTime? endDate = !string.IsNullOrEmpty(obj.EndDate) ? DateTime.ParseExact(obj.EndDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                DateTime? approvedTime = !string.IsNullOrEmpty(obj.ApprovedTime) ? DateTime.ParseExact(obj.ApprovedTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                DateTime? createTime = !string.IsNullOrEmpty(obj.CreatedDate) ? DateTime.ParseExact(obj.CreatedDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                var data = _context.UrencoCarMaintenanceHeaders.FirstOrDefault(x => !x.IsDeleted && x.MtnCode == obj.MtnCode);
                if (data != null)
                {
                    data.Title = obj.Title;
                    data.CarPlate = obj.CarPlate;
                    data.Gara = obj.Gara;
                    data.StartDate = startDate;
                    data.EndDate = endDate;
                    data.Note = obj.Note;
                    data.Creator = obj.Creator;
                    data.ApprovedBy = obj.ApprovedBy;
                    data.ApprovedTime = approvedTime;
                    data.UpdatedBy = User.Identity.Name;
                    data.UpdatedTime = DateTime.Now;
                    data.CreatTime = createTime;
                    data.Type = obj.Type;

                    _context.UrencoCarMaintenanceHeaders.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["UM_LBL_MAINTENANCE"]);// "Cập nhập sửa chữa bảo dưỡng thành công!";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["UM_ERR_MAINTANANCE_NOT_EXITS"]);//"Mã phiếu không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], _stringLocalizer["UM_LBL_MAINTENANCE"]); //"Có lỗi khi cập nhập sửa chữa bảo dưỡng !:" + ex.Message;
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Delete(int id)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var data = _context.UrencoCarMaintenanceHeaders.FirstOrDefault(x => !x.IsDeleted && x.Id == id);
                if (data != null)
                {
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    data.IsDeleted = true;
                    _context.UrencoCarMaintenanceHeaders.Update(data);
                    _context.SaveChanges();

                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["UM_LBL_MAINTENANCE"]); //"Xóa thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["UM_ERR_MAINTANANCE_NOT_EXITS"]);//"Bảo dưỡng sửa chữa không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer["UM_LBL_MAINTENANCE"]); //"Có lỗi xảy ra khi xóa!";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetItem(int Id)
        {
            var msg = new JMessage();
            try
            {
                var data = _context.UrencoCarMaintenanceHeaders.Where(x => x.Id == Id).Select(p => new
                {
                    p.MtnCode,
                    p.Title,
                    p.Gara,
                    p.Note,
                    p.CarPlate,
                    p.Creator,
                    StartDate = p.StartDate.HasValue ? p.StartDate.Value.ToString("dd/MM/yyyy") : "",
                    EndDate = p.EndDate.HasValue ? p.EndDate.Value.ToString("dd/MM/yyyy") : "",
                    ApprovedTime = p.ApprovedTime.HasValue ? p.ApprovedTime.Value.ToString("dd/MM/yyyy") : "",
                    p.ApprovedBy,
                    p.Type,
                    CreatedDate = p.CreatTime.HasValue ? p.CreatTime.Value.ToString("dd/MM/yyyy") : ""
                }).FirstOrDefault();

                msg.Object = data;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = ex.Message;
            }

            return Json(msg);
        }
        #endregion

        #region Detail

        #region Material
        public object JTableMaterialDetail([FromBody]JTableModelDetail jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.UrencoCarMaintenanceMaterialDetails.Where(x => !x.IsDeleted && x.MtnCode.Equals(jTablePara.MtnCode))
                        join d in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Unit equals d.CodeSet into d1
                        from d2 in d1.DefaultIfEmpty()
                        select new
                        {
                            a.Id,
                            a.MtnCode,
                            ItemName = a.ItemType == "SUB_PRODUCT" ? _context.SubProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(a.ItemCode)) != null ? _context.SubProducts.FirstOrDefault(x => !x.IsDeleted && x.ProductQrCode.Equals(a.ItemCode)).AttributeName : null : _context.MaterialProducts.FirstOrDefault(p => !p.IsDeleted && p.ProductCode.Equals(a.ItemCode)) != null ? _context.MaterialProducts.FirstOrDefault(p => !p.IsDeleted && p.ProductCode.Equals(a.ItemCode)).ProductName : null,
                            a.ItemCode,
                            a.Quantity,
                            a.Unit,
                            UnitName = d2 != null ? d2.ValueSet : "",
                            a.Cost,
                            a.Note,
                            a.Total,
                            ItemTypeName = a.ItemType == "SUB_PRODUCT" ? "Nguyên liệu" : "Thành phẩm",
                            a.ItemType
                        };

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "MtnCode", "ItemName", "ItemCode", "Quantity", "Unit", "UnitName", "Cost", "Note", "Total", "ItemType", "ItemTypeName");
            return Json(jdata);
        }
        [HttpPost]
        public async Task<JsonResult> InsertMaterialDetail([FromBody]UrencoCarMaintenanceMaterialDetailModel obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                using (await userLock.LockAsync(obj.MtnCode.ToLower()))
                {
                    var data = _context.UrencoCarMaintenanceMaterialDetails.FirstOrDefault(x => !x.IsDeleted && x.MtnCode == obj.MtnCode && x.ItemCode.Equals(obj.ItemCode));
                    if (data == null)
                    {
                        var item = new UrencoCarMaintenanceMaterialDetail
                        {
                            MtnCode = obj.MtnCode,
                            ItemCode = obj.ItemCode,
                            ItemType = obj.ItemType,
                            Unit = obj.Unit,
                            Cost = obj.Cost,
                            Quantity = obj.Quantity,
                            Total = obj.Cost * obj.Quantity,
                            Note = obj.Note,
                            CreatedBy = User.Identity.Name,
                            CreatedTime = DateTime.Now
                        };

                        _context.UrencoCarMaintenanceMaterialDetails.Add(item);
                        _context.SaveChanges();
                        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["UM_CURD_LBL_MATERIAL_CODE"]);//"Thêm phụ tùng thay thế thành công!";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["UM_ERR_MATERIAL_EXITS"]);//"Phụ tùng thay thế đã tồn tại";
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], _stringLocalizer["UM_CURD_LBL_MATERIAL_CODE"]); //"Có lỗi xảy ra khi thêm phụ tùng thay thế!";
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<JsonResult> UpdateMaterialDetail([FromBody]UrencoCarMaintenanceMaterialDetailModel obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                using (await userLock.LockAsync(obj.MtnCode.ToLower()))
                {
                    var data = _context.UrencoCarMaintenanceMaterialDetails.FirstOrDefault(x => !x.IsDeleted && x.MtnCode == obj.MtnCode && x.ItemCode.Equals(obj.ItemCode));
                    if (data != null)
                    {
                        data.ItemCode = obj.ItemCode;
                        data.ItemType = obj.ItemType;
                        data.Unit = obj.Unit;
                        data.Cost = obj.Cost;
                        data.Quantity = obj.Quantity;
                        data.Total = obj.Total;
                        data.Note = obj.Note;
                        data.UpdatedBy = User.Identity.Name;
                        data.UpdatedTime = DateTime.Now;

                        _context.UrencoCarMaintenanceMaterialDetails.Update(data);
                        _context.SaveChanges();
                        msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["UM_CURD_LBL_MATERIAL_CODE"]); //"Cập nhật hợp đồng thành công!";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["UM_ERR_MATERIAL_NOT_EXITS"]);//"Phụ tùng thay thế không tồn tại";
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], _stringLocalizer["UM_CURD_LBL_MATERIAL_CODE"]); //"Có lỗi khi cập nhập Phụ tùng thay thế !:" + ex.Message;
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult DeleteMaterialDetail(int id)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var data = _context.UrencoCarMaintenanceMaterialDetails.FirstOrDefault(x => !x.IsDeleted && x.Id == id);
                if (data != null)
                {
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    data.IsDeleted = true;

                    _context.UrencoCarMaintenanceMaterialDetails.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["UM_CURD_LBL_MATERIAL_CODE"]); //"Xóa thành công phụ tùng thay thế";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["UM_ERR_MATERIAL_NOT_EXITS"]);//"Phụ tùng thay thế không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer["UM_CURD_LBL_MATERIAL_CODE"]); //"Có lỗi xảy ra khi xóa phụ tùng thay thế!";
            }
            return Json(msg);
        }
        #endregion

        #region Service
        public object JTableServiceDetail([FromBody]JTableModelDetail jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.UrencoCarMaintenanceServiceDetails.Where(x => !x.IsDeleted && x.MtnCode.Equals(jTablePara.MtnCode))
                        join d in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Unit equals d.CodeSet into d1
                        from d2 in d1.DefaultIfEmpty()
                        join e in _context.ServiceCategorys.Where(x => !x.IsDeleted) on a.ItemCode equals e.ServiceCode into e1
                        from e2 in e1.DefaultIfEmpty()
                        join f in _context.ServiceCategoryTypes.Where(x => !x.IsDeleted) on a.ItemType equals f.Code into f1
                        from f2 in f1.DefaultIfEmpty()
                        select new
                        {
                            a.Id,
                            a.MtnCode,
                            ItemName = e2 != null ? e2.ServiceName : "",
                            a.ItemCode,
                            a.Quantity,
                            a.Unit,
                            UnitName = d2 != null ? d2.ValueSet : "",
                            a.Cost,
                            a.Note,
                            a.Total,
                            ItemTypeName = f2 != null ? f2.Name : "",
                            a.ItemType
                        };

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "MtnCode", "ItemName", "ItemCode", "Quantity", "Unit", "UnitName", "Cost", "Note", "Total", "ItemType", "ItemTypeName");
            return Json(jdata);
        }
        [HttpPost]
        public async Task<JsonResult> InsertServiceDetail([FromBody]UrencoCarMaintenanceServiceDetailModel obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                using (await userLock.LockAsync(obj.MtnCode.ToLower()))
                {
                    var data = _context.UrencoCarMaintenanceServiceDetails.FirstOrDefault(x => !x.IsDeleted && x.MtnCode == obj.MtnCode && x.ItemCode.Equals(obj.ItemCode));
                    if (data == null)
                    {
                        var item = new UrencoCarMaintenanceServiceDetail
                        {
                            MtnCode = obj.MtnCode,
                            ItemCode = obj.ItemCode,
                            ItemType = obj.ItemType,
                            Unit = obj.Unit,
                            Cost = obj.Cost,
                            Quantity = obj.Quantity,
                            Total = obj.Cost * obj.Quantity,
                            Note = obj.Note,
                            CreatedBy = User.Identity.Name,
                            CreatedTime = DateTime.Now
                        };

                        _context.UrencoCarMaintenanceServiceDetails.Add(item);
                        _context.SaveChanges();
                        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["UM_CURD_LBL_SERVICE_CODE"]);//"Thêm phụ tùng thay thế thành công!";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["UM_ERR_SERVICE_EXITS"]);//"Dịch vụ đã tồn tại";
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], _stringLocalizer["UM_CURD_LBL_SERVICE_CODE"]); //"Có lỗi xảy ra khi thêm dịch vụ!";
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<JsonResult> UpdateServiceDetail([FromBody]UrencoCarMaintenanceServiceDetailModel obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                using (await userLock.LockAsync(obj.MtnCode.ToLower()))
                {
                    var data = _context.UrencoCarMaintenanceServiceDetails.FirstOrDefault(x => !x.IsDeleted && x.MtnCode == obj.MtnCode && x.ItemCode.Equals(obj.ItemCode));
                    if (data != null)
                    {
                        data.ItemCode = obj.ItemCode;
                        data.ItemType = obj.ItemType;
                        data.Unit = obj.Unit;
                        data.Cost = obj.Cost;
                        data.Quantity = obj.Quantity;
                        data.Total = obj.Total;
                        data.Note = obj.Note;
                        data.UpdatedBy = User.Identity.Name;
                        data.UpdatedTime = DateTime.Now;

                        _context.UrencoCarMaintenanceServiceDetails.Update(data);
                        _context.SaveChanges();
                        msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["UM_CURD_LBL_SERVICE_CODE"]); //"Cập nhật dịch vụ thành công!";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["UM_ERR_SERVICE_NOT_EXITS"]);//"Dịch vụ không tồn tại";
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], _stringLocalizer["UM_CURD_LBL_MATERIAL_CODE"]); //"Có lỗi khi cập nhập dịch vụ !:" + ex.Message;
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult DeleteServiceDetail(int id)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var data = _context.UrencoCarMaintenanceServiceDetails.FirstOrDefault(x => !x.IsDeleted && x.Id == id);
                if (data != null)
                {
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    data.IsDeleted = true;

                    _context.UrencoCarMaintenanceServiceDetails.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["UM_CURD_LBL_SERVICE_CODE"]); //"Xóa thành dịch vụ";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["UM_ERR_SERVICE_NOT_EXITS"]);//"Dịch vụ không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer["UM_CURD_LBL_SERVICE_CODE"]); //"Có lỗi xảy ra khi xóa dịch vụ!";
            }
            return Json(msg);
        }
        #endregion
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