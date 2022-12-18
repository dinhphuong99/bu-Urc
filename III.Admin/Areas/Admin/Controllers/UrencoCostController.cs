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
    public class UrencoCostController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private static AsyncLocker<string> userLock = new AsyncLocker<string>();
        private readonly IStringLocalizer<UrencoCostController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<AssetRqMaintenanceRepairController> _assetRMRstringLocalizer;
        private readonly IStringLocalizer<AssetInventoryController> _inventoryController;
        private readonly IRepositoryService _repositoryService;
        public UrencoCostController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IStringLocalizer<UrencoCostController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources,
            IStringLocalizer<AssetRqMaintenanceRepairController> assetRMRstringLocalizer,
            IStringLocalizer<AssetInventoryController> inventoryController,
            IRepositoryService repositoryService)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _assetRMRstringLocalizer = assetRMRstringLocalizer;
            _inventoryController = inventoryController;
            _repositoryService = repositoryService;
        }
        public IActionResult Index()
        {
            return View();
        }

        #region Car Cost Header
        public class JTableModelContract : JTableModel
        {
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string CostCode { get; set; }
            public string CarPlate { get; set; }
        }

        public class JTableModelDetail : JTableModel
        {
            public string CostCode { get; set; }
        }

        [HttpGet]
        public JsonResult GenCostCode()
        {
            var monthNow = DateTime.Now.Month;
            var yearNow = DateTime.Now.Year;
            var reqCode = string.Empty;
            var no = 1;
            var noText = "01";
            var data = _context.UrencoCarCostHeaders.Where(x => x.CreatedTime.Value.Year == yearNow && x.CreatedTime.Value.Month == monthNow).ToList();
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

            reqCode = string.Format("{0}{1}{2}{3}", "REQ_COST_", "T" + monthNow + ".", yearNow + "_", noText);

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
            var data = _context.UrencoCostTypes.Where(x => !x.IsDeleted).Select(x => new { Code = x.Code, Name = x.Name });
            return data;
        }
        [HttpPost]
        public object GetListStatus()
        {
            var data = _context.CommonSettings.Where(x => x.Group == "URENCO_REQ_COST_STATUS").OrderBy(x => x.Priority).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
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

        [HttpGet]
        public object GetListCostCategory()
        {
            var data = from a in _context.UrencoCostCategorys.Where(x => !x.IsDeleted).Select(x => new { Code = x.ServiceCode, Name = x.ServiceName, x.Unit, x.ServiceType })
                       join b in _context.UrencoCostTypes.Where(x => !x.IsDeleted) on a.ServiceType equals b.Code into b1
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
        public object GetCatObjActivity()
        {
            var check = (from a in _context.UrencoCarCostHeaders
                         join b in _context.CatWorkFlows on a.ObjActCode equals b.WorkFlowCode
                         select new
                         {
                             Code = a.ObjActCode,
                             CatName = b.Name
                         }).Distinct().ToList();

            if (check.Count > 0)
            {
                return check;
            }
            else
            {
                var data = _context.CatWorkFlows.Where(x => x.IsDeleted == false).OrderBy(x => x.Name).ThenBy(x => x.WorkFlowCode).Select(x => new { Code = x.WorkFlowCode, CatName = x.Name }).ToList();
                return data;
            }
        }

        [HttpPost]
        public object JTable([FromBody]JTableModelContract jTablePara)
        {
            var session = HttpContext.GetSessionUser();

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            var query = from a in _context.UrencoCarCostHeaders
                         .Where(x => !x.IsDeleted && ((fromDate == null) || (x.CreatedTime.HasValue && x.CreatedTime.Value.Date >= fromDate)) &&
                               ((toDate == null) || (x.CreatedTime.HasValue && x.CreatedTime.Value.Date <= toDate)) &&
                               ((string.IsNullOrEmpty(jTablePara.CarPlate)) || (x.CarPlate.Contains(jTablePara.CarPlate))) &&
                               ((string.IsNullOrEmpty(jTablePara.CostCode)) || (x.CostCode.Contains(jTablePara.CostCode))))
                        join b in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Status equals b.CodeSet into b1
                        from b2 in b1.DefaultIfEmpty()
                        select new
                        {
                            a.Id,
                            a.CostCode,
                            a.Title,
                            a.CarPlate,
                            a.Note,
                            StartDate = a.StartDate.HasValue ? a.StartDate.Value.ToString("dd/MM/yyyy") : "",
                            EndDate = a.EndDate.HasValue ? a.EndDate.Value.ToString("dd/MM/yyyy") : "",
                            a.CreatedBy,
                            CreatedTime = a.CreatedTime.HasValue ? a.CreatedTime.Value.ToString("dd/MM/yyyy") : "",
                            a.ApprovedBy,
                            ApprovedTime = a.ApprovedTime.HasValue ? a.ApprovedTime.Value.ToString("dd/MM/yyyy") : "",
                            a.Creator,
                            Status = b2 != null ? b2.ValueSet : ""
                        };

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "CostCode", "Title", "CarPlate", "Note", "Gara", "StartDate", "EndDate", "CreatedBy", "CreatedTime", "ApprovedBy", "ApprovedTime", "Creator", "Status");
            return Json(jdata);
        }
        [HttpPost]
        public async Task<JsonResult> Insert([FromBody]UrencoCarCostHeaderModel obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                using (await userLock.LockAsync(obj.CostCode.ToLower()))
                {
                    DateTime? startDate = !string.IsNullOrEmpty(obj.StartDate) ? DateTime.ParseExact(obj.StartDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    DateTime? endDate = !string.IsNullOrEmpty(obj.EndDate) ? DateTime.ParseExact(obj.EndDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    DateTime? approvedTime = !string.IsNullOrEmpty(obj.ApprovedTime) ? DateTime.ParseExact(obj.ApprovedTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    DateTime? createTime = !string.IsNullOrEmpty(obj.CreatedDate) ? DateTime.ParseExact(obj.CreatedDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                    var actCode = EnumHelper<LogActivity>.GetDisplayValue(LogActivity.ActivityCreate);
                    var data = _context.UrencoCarCostHeaders.FirstOrDefault(x => !x.IsDeleted && x.CostCode == obj.CostCode);
                    if (data == null)
                    {
                        var item = new UrencoCarCostHeader
                        {
                            CostCode = obj.CostCode,
                            Title = obj.Title,
                            CarPlate = obj.CarPlate,
                            StartDate = startDate,
                            EndDate = endDate,
                            Note = obj.Note,
                            Creator = obj.Creator,
                            ApprovedBy = obj.ApprovedBy,
                            ApprovedTime = approvedTime,
                            CreatedBy = User.Identity.Name,
                            CreatedTime = DateTime.Now,
                            Type = obj.Type,
                            ObjActCode = obj.ObjActCode,
                            Status = obj.Status,
                            CreatTime = createTime
                        };

                        _context.UrencoCarCostHeaders.Add(item);

                        InsertLogDataAuto(actCode, item);

                        _context.SaveChanges();
                        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["UC_LBL_MAINTENANCE"]);//"Thêm sửa chữa bảo dưỡng thành công!";

                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["UC_CURD_LBL_CODE"]); //"Mã phiếu đã tồn tại";
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], _stringLocalizer["UC_LBL_MAINTENANCE"]); //"Có lỗi xảy ra khi thêm sửa chữa bảo dưỡng!";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Update([FromBody]UrencoCarCostHeaderModel obj)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                DateTime? startDate = !string.IsNullOrEmpty(obj.StartDate) ? DateTime.ParseExact(obj.StartDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                DateTime? endDate = !string.IsNullOrEmpty(obj.EndDate) ? DateTime.ParseExact(obj.EndDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                DateTime? approvedTime = !string.IsNullOrEmpty(obj.ApprovedTime) ? DateTime.ParseExact(obj.ApprovedTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                DateTime? createTime = !string.IsNullOrEmpty(obj.CreatedDate) ? DateTime.ParseExact(obj.CreatedDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                var actCode = EnumHelper<LogActivity>.GetDisplayValue(LogActivity.ActivityUpdate);
                var data = _context.UrencoCarCostHeaders.FirstOrDefault(x => !x.IsDeleted && x.CostCode == obj.CostCode);
                if (data != null)
                {
                    data.Title = obj.Title;
                    data.CarPlate = obj.CarPlate;
                    data.StartDate = startDate;
                    data.EndDate = endDate;
                    data.Note = obj.Note;
                    data.Creator = obj.Creator;
                    data.ApprovedBy = obj.ApprovedBy;
                    data.ApprovedTime = approvedTime;
                    data.UpdatedBy = User.Identity.Name;
                    data.UpdatedTime = DateTime.Now;
                    data.Type = obj.Type;
                    data.ObjActCode = obj.ObjActCode;
                    data.Status = obj.Status;
                    data.CreatTime = createTime;

                    _context.UrencoCarCostHeaders.Update(data);

                    InsertLogDataAuto(actCode, data);

                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["UC_LBL_MAINTENANCE"]);// "Cập nhập sửa chữa bảo dưỡng thành công!";

                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["UC_ERR_MAINTANANCE_NOT_EXITS"]);//"Mã phiếu không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], _stringLocalizer["UC_LBL_MAINTENANCE"]); //"Có lỗi khi cập nhập sửa chữa bảo dưỡng !:" + ex.Message;
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Delete(int id)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var actCode = EnumHelper<LogActivity>.GetDisplayValue(LogActivity.ActivityDelete);

                var data = _context.UrencoCarCostHeaders.FirstOrDefault(x => !x.IsDeleted && x.Id == id);
                if (data != null)
                {
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    data.IsDeleted = true;
                    _context.UrencoCarCostHeaders.Update(data);

                    InsertLogDataAuto(actCode, data);

                    _context.SaveChanges();

                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["UC_LBL_MAINTENANCE"]); //"Xóa thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["UC_ERR_MAINTANANCE_NOT_EXITS"]);//"Bảo dưỡng sửa chữa không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer["UC_LBL_MAINTENANCE"]); //"Có lỗi xảy ra khi xóa!";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetItem(int Id)
        {
            var msg = new JMessage();
            try
            {
                var data = _context.UrencoCarCostHeaders.Where(x => x.Id == Id).Select(p => new
                {
                    p.CostCode,
                    p.Title,
                    p.Note,
                    p.CarPlate,
                    p.Creator,
                    StartDate = p.StartDate.HasValue ? p.StartDate.Value.ToString("dd/MM/yyyy") : "",
                    EndDate = p.EndDate.HasValue ? p.EndDate.Value.ToString("dd/MM/yyyy") : "",
                    ApprovedTime = p.ApprovedTime.HasValue ? p.ApprovedTime.Value.ToString("dd/MM/yyyy") : "",
                    p.ApprovedBy,
                    p.Type,
                    p.ObjActCode,
                    p.Status,
                    CreatedDate = p.CreatTime.HasValue ? p.CreatTime.Value.ToString("dd/MM/yyyy") : "",
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

        public void InsertLogDataAuto(string actCode, UrencoCarCostHeader obj)
        {
            var data = _context.ActivityLogDatas.FirstOrDefault(x => !x.IsDeleted && x.WorkFlowCode.Equals(obj.ObjActCode) && x.ActCode.Equals(actCode) && x.ObjCode.Equals(obj.CostCode));
            if (data == null)
            {
                data = new ActivityLogData();
                data.ListLog = new List<string>();
                data.ActCode = actCode;
                data.ActType = "ACTIVITY_AUTO_LOG";
                data.WorkFlowCode = obj.ObjActCode;
                data.ObjCode = obj.CostCode;
                data.ActTime = DateTime.Now;
                data.CreatedBy = ESEIM.AppContext.UserName;
                data.CreatedTime = DateTime.Now;
                string jObj = JsonConvert.SerializeObject(obj);
                data.ListLog.Add(jObj);
                data.Log = JsonConvert.SerializeObject(data.ListLog);
                _context.ActivityLogDatas.Add(data);
            }
            else
            {
                string jObj = JsonConvert.SerializeObject(obj);
                data.ListLog.Add(jObj);
                data.Log = JsonConvert.SerializeObject(data.ListLog);
                _context.ActivityLogDatas.Update(data);
            }

        }

        [HttpPost]
        public object InsertLogData([FromBody]ActivityLogDataRes obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            var data = _context.CatActivitys.Where(x => x.ActCode.Equals(obj.ActCode)).Select(y => y.ActType).ToList();
            string actType = "";
            foreach (var item in data)
            {
                actType = item;
            }
            try
            {
                DateTime? actTime = !string.IsNullOrEmpty(obj.ActTime) ? DateTime.ParseExact(obj.ActTime, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                if (obj.ObjActCode != null && obj.ObjCode != null)
                {
                    List<string> list = new List<string>();
                    var activityLogData = new ActivityLogData
                    {
                        ActCode = obj.ActCode,
                        WorkFlowCode = obj.ObjActCode,
                        ObjCode = obj.ObjCode,
                        ActTime = actTime,
                        ActType = actType,
                        ActLocationGPS = obj.ActLocationGPS, // Chưa biết cách lấy
                        ActFromDevice = obj.ActFromDevice,    // Chưa biết cách lấy
                        CreatedBy = ESEIM.AppContext.UserName,
                        CreatedTime = DateTime.Now
                    };
                    _context.ActivityLogDatas.Add(activityLogData);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _assetRMRstringLocalizer["ASSET_RMR_ACT"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_INFOMATION"];
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }


        #endregion

        #region Detail

        #region 
        public object JTableDetail([FromBody]JTableModelDetail jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.UrencoCarCostDetails.Where(x => !x.IsDeleted && x.CostCode.Equals(jTablePara.CostCode))
                        join d in _context.CommonSettings.Where(x => !x.IsDeleted) on a.Unit equals d.CodeSet into d1
                        from d2 in d1.DefaultIfEmpty()
                        join e in _context.UrencoCostCategorys.Where(x => !x.IsDeleted) on a.ItemCode equals e.ServiceCode into e1
                        from e2 in e1.DefaultIfEmpty()
                        join f in _context.CommonSettings.Where(x => !x.IsDeleted) on a.ItemType equals f.CodeSet into f1
                        from f2 in d1.DefaultIfEmpty()
                        select new
                        {
                            a.Id,
                            a.CostCode,
                            ItemName = e2 != null ? e2.ServiceName : "",
                            a.ItemCode,
                            a.Quantity,
                            a.Unit,
                            UnitName = d2 != null ? d2.ValueSet : "",
                            a.Cost,
                            a.Note,
                            a.Total,
                            ItemTypeName = f2 != null ? f2.ValueSet : "",
                            a.ItemType,
                            CreatedDate = a.CreatedDate.HasValue ? a.CreatedDate.Value.ToString("dd/MM/yyyy") : ""
                        };

            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "CostCode", "ItemName", "ItemCode", "Quantity", "Unit", "UnitName", "Cost", "Note", "Total", "ItemType", "ItemTypeName", "CreatedDate");
            return Json(jdata);
        }
        [HttpPost]
        public async Task<JsonResult> InsertDetail([FromBody]UrencoCarCostDetailModel obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                using (await userLock.LockAsync(obj.CostCode.ToLower()))
                {
                    DateTime? createdDate = !string.IsNullOrEmpty(obj.CreatedDate) ? DateTime.ParseExact(obj.CreatedDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                    var data = _context.UrencoCarCostDetails.FirstOrDefault(x => !x.IsDeleted && x.CostCode == obj.CostCode && x.ItemCode.Equals(obj.ItemCode));
                    if (data == null)
                    {
                        var item = new UrencoCarCostDetail
                        {
                            CostCode = obj.CostCode,
                            ItemCode = obj.ItemCode,
                            ItemType = obj.ItemType,
                            Unit = obj.Unit,
                            Cost = obj.Cost,
                            Quantity = obj.Quantity,
                            Total = obj.Cost * obj.Quantity,
                            Note = obj.Note,
                            CreatedBy = User.Identity.Name,
                            CreatedTime = DateTime.Now,
                            CreatedDate = createdDate
                        };

                        _context.UrencoCarCostDetails.Add(item);
                        _context.SaveChanges();
                        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["UC_CURD_LBL_MATERIAL_CODE"]);//"Thêm phụ tùng thay thế thành công!";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["UC_ERR_MATERIAL_EXITS"]);//"Phụ tùng thay thế đã tồn tại";
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAILED"], _stringLocalizer["UC_CURD_LBL_MATERIAL_CODE"]); //"Có lỗi xảy ra khi thêm phụ tùng thay thế!";
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<JsonResult> UpdateDetail([FromBody]UrencoCarCostDetailModel obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                using (await userLock.LockAsync(obj.CostCode.ToLower()))
                {
                    DateTime? createdDate = !string.IsNullOrEmpty(obj.CreatedDate) ? DateTime.ParseExact(obj.CreatedDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                    var data = _context.UrencoCarCostDetails.FirstOrDefault(x => !x.IsDeleted && x.CostCode == obj.CostCode && x.ItemCode.Equals(obj.ItemCode));
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
                        data.CreatedDate = createdDate;

                        _context.UrencoCarCostDetails.Update(data);
                        _context.SaveChanges();
                        msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["UC_CURD_LBL_MATERIAL_CODE"]); //"Cập nhật hợp đồng thành công!";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["UC_ERR_MATERIAL_NOT_EXITS"]);//"Phụ tùng thay thế không tồn tại";
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], _stringLocalizer["UC_CURD_LBL_MATERIAL_CODE"]); //"Có lỗi khi cập nhập Phụ tùng thay thế !:" + ex.Message;
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult DeleteDetail(int id)
        {
            JMessage msg = new JMessage() { Error = false };
            try
            {
                var data = _context.UrencoCarCostDetails.FirstOrDefault(x => !x.IsDeleted && x.Id == id);
                if (data != null)
                {
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    data.IsDeleted = true;

                    _context.UrencoCarCostDetails.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["UC_CURD_LBL_MATERIAL_CODE"]); //"Xóa thành công phụ tùng thay thế";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["UC_ERR_MATERIAL_NOT_EXITS"]);//"Phụ tùng thay thế không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer["UC_CURD_LBL_MATERIAL_CODE"]); //"Có lỗi xảy ra khi xóa phụ tùng thay thế!";
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
                .Union(_assetRMRstringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_inventoryController.GetAllStrings().Select(x => new { x.Name, x.Value }))
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