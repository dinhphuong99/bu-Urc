using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Http;
using System.Globalization;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using III.Domain.Enums;
using System.Threading.Tasks;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class TrashCarController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IGoogleAPIService _googleAPIService;
        private readonly IStringLocalizer<TrashCarController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;


        public TrashCarController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IGoogleAPIService googleAPIService, IStringLocalizer<TrashCarController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _googleAPIService = googleAPIService;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        public IActionResult Index()
        {
            return View();
        }
        [HttpPost]
        public object JTable([FromBody]JTableSearch jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.UrencoTrashCars
                        join b in _context.Users on a.CreatedBy equals b.UserName into b2
                        from b in b2.DefaultIfEmpty()
                        where (string.IsNullOrEmpty(jTablePara.CarCode) || a.CarCode.ToLower().Contains(jTablePara.CarCode.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.Group) || a.Group == jTablePara.Group)
                        && a.IsDeleted == false
                        && jTablePara.Flag == -1 || a.Flag == jTablePara.Flag
                        select new
                        {
                            a.Id,
                            a.CarCode,
                            a.CarName,
                            a.Group,
                            a.Generic,
                            a.Origin,
                            a.PositionGps,
                            a.PositionText,
                            a.SumDistance,
                            a.Flag,
                            createdby = b.GivenName,
                            Type = _context.CommonSettings.FirstOrDefault(x => !x.IsDeleted && x.CodeSet == a.Type).ValueSet,
                            sRegistryExpirationDate = a.RegistryExpirationDate,
                            sRoadExpirationDate = a.RoadExpirationDate,
                            sMaintenanceNextDate = a.MaintenanceNextDate,

                            //sRegistryExpirationDate = a.RegistryExpirationDate.HasValue ? a.RegistryExpirationDate.Value.ToString("dd/MM/yyyy") : "",
                            //sRoadExpirationDate = a.RoadExpirationDate.HasValue ? a.RoadExpirationDate.Value.ToString("dd/MM/yyyy") : "",
                            //sMaintenanceNextDate = a.MaintenanceNextDate.HasValue ? a.MaintenanceNextDate.Value.ToString("dd/MM/yyyy") : "",
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "CarCode", "CarName", "Group", "Generic", "Origin", "PositionGps", "PositionText", "SumDistance", "Flag", "CreatedBy", "Type", "sRegistryExpirationDate", "sRoadExpirationDate", "sMaintenanceNextDate");
            return Json(jdata);
        }
        [HttpPost]
        public object UploadImage(IFormFile fileUpload)
        {
            var msg = new JMessage();
            try
            {
                var upload = _upload.UploadImage(fileUpload);
                msg.Error = false;
                msg.Title = "";
                msg.Object = upload.Object;
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                // msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_UPLOAD_FILE"));
                msg.Title = _sharedResources["COM_MSG_ERR"];
                return Json(msg);
            }
        }
        [HttpPost]
        public object Insert([FromBody]UrencoTrashCar obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.UrencoTrashCars.FirstOrDefault(x => x.CarCode.Equals(obj.CarCode));
                if (data == null)
                {
                    obj.YearManufacture = string.IsNullOrEmpty(obj.sYearManufacture) ? (DateTime?)null : DateTime.ParseExact(obj.sYearManufacture, "dd/MM/yyyy", CultureInfo.InvariantCulture);

                    obj.InsurranceDuration = string.IsNullOrEmpty(obj.sInsurranceDuration) ? (DateTime?)null : DateTime.ParseExact(obj.sInsurranceDuration, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    obj.RegistryDuration = string.IsNullOrEmpty(obj.sRegistryDuration) ? (DateTime?)null : DateTime.ParseExact(obj.sRegistryDuration, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    obj.RegistryExpirationDate = string.IsNullOrEmpty(obj.sRegistryExpirationDate) ? (DateTime?)null : DateTime.ParseExact(obj.sRegistryExpirationDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    obj.RoadExpirationDate = string.IsNullOrEmpty(obj.sRoadExpirationDate) ? (DateTime?)null : DateTime.ParseExact(obj.sRoadExpirationDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    obj.MaintenanceNextDate = string.IsNullOrEmpty(obj.sMaintenanceNextDate) ? (DateTime?)null : DateTime.ParseExact(obj.sMaintenanceNextDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    obj.CreatedDate = DateTime.Now;
                    obj.Flag = 1;
                    obj.CarCode = obj.LicensePlate;
                    obj.IsDeleted = false;
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    _context.UrencoTrashCars.Add(obj);
                    _context.SaveChanges();
                    // msg.Title = "Thêm mới xe thành công";
                    msg.Title = _stringLocalizer["TRC_ADD_TRASH_CAR"];
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                // msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public object Update([FromBody]UrencoTrashCar obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.UrencoTrashCars.FirstOrDefault(x => x.IsDeleted == false && x.Id == obj.Id);
                if (data != null)
                {
                    var insurranceDuration = string.IsNullOrEmpty(obj.sInsurranceDuration) ? (DateTime?)null : DateTime.ParseExact(obj.sInsurranceDuration, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    var registryDuration = string.IsNullOrEmpty(obj.sRegistryDuration) ? (DateTime?)null : DateTime.ParseExact(obj.sRegistryDuration, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    var yearManufacture = string.IsNullOrEmpty(obj.sYearManufacture) ? (DateTime?)null : DateTime.ParseExact(obj.sYearManufacture, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    data.CarCode = obj.Type + obj.BranchCode + "_" + obj.LicensePlate;
                    data.Group = obj.Group;
                    data.Generic = obj.Generic;
                    data.Origin = obj.Origin;
                    data.YearManufacture = yearManufacture;
                    data.OwnerCode = obj.OwnerCode;
                    data.Category = obj.Category;
                    data.WeightItself = obj.WeightItself;
                    data.DesignPayload = obj.DesignPayload;
                    data.PayloadPulled = obj.PayloadPulled;
                    data.PayloadTotal = obj.PayloadTotal;
                    data.SizeRegistry = obj.SizeRegistry;
                    data.SizeUse = obj.SizeUse;
                    data.InsurranceDuration = insurranceDuration;
                    data.RegistryDuration = registryDuration;
                    data.Note = obj.Note;
                    data.Image = obj.Image;
                    data.Type = obj.Type;
                    data.BranchCode = obj.BranchCode;
                    data.UpdatedDate = DateTime.Now;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.RouteDefault = obj.RouteDefault;
                    data.DriverDefault = obj.DriverDefault;

                    data.RegistryExpirationDate = string.IsNullOrEmpty(obj.sRegistryExpirationDate) ? (DateTime?)null : DateTime.ParseExact(obj.sRegistryExpirationDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    data.RoadExpirationDate = string.IsNullOrEmpty(obj.sRoadExpirationDate) ? (DateTime?)null : DateTime.ParseExact(obj.sRoadExpirationDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    data.MaintenanceNextDate = string.IsNullOrEmpty(obj.sMaintenanceNextDate) ? (DateTime?)null : DateTime.ParseExact(obj.sMaintenanceNextDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);

                    _context.UrencoTrashCars.Update(data);
                    _context.SaveChanges();
                    msg.Error = false;
                    //msg.Title = "Cập nhật thành công";
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer[""]);
                }
                else
                {
                    msg.Error = true;
                    // msg.Title = "Cập nhật bị lỗi, xe rác không tồn tại";
                    msg.Title = _stringLocalizer["TRC_VALIDATE_TRC_UPDATE_ERR"];

                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Sảy ra lỗi khi cập nhật";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }

            return Json(msg);
        }

        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage { Error = false };
            try
            {
                var data = _context.UrencoTrashCars.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedDate = DateTime.Now;
                    _context.UrencoTrashCars.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue("HR_HR_MAN_MSG_EMPLOYEE"));
                    return Json(msg);
                }
                else
                {
                    msg.Error = true;
                    // msg.Title = "Xe không tồn tại, vui lòng làm mới trang";
                    msg.Title = _stringLocalizer["TRC_VALIDATE_TRC_NULL_REFRESH"];

                    return Json(msg);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                // msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_DELETE"));
                msg.Title = _sharedResources["COM_MSG_ERR"];
                return Json(msg);
            }
        }
        [HttpPost]
        public object JTableHistoryRun()
        {
            Dictionary<string, object> dictionary = new Dictionary<string, object>();
            dictionary.Add("draw", 1);
            dictionary.Add("recordsFiltered", 4);
            dictionary.Add("recordsTotal", 4);
            Dictionary<string, string> data = new Dictionary<string, string>();
            List<object> datas = new List<object>();
            data.Add("Id", "1");
            data.Add("NameRoute", "Lâm Du - Nam Sơn");
            data.Add("TimeStart", "13:00");
            data.Add("TimeEnd", "16:00");
            data.Add("NameDriver", "Lê Đức Phòng");
            data.Add("Km", "2");
            data.Add("Status", "Hoạt động");
            data.Add("Mass", "4");
            data.Add("Unit", "Tấn");
            data.Add("Act", "Quét đường");
            datas.Add(data);

            data = new Dictionary<string, string>();
            data.Add("Id", "2");
            data.Add("NameRoute", "Cầu Diễn - Nam Sơn");
            data.Add("TimeStart", "09:00");
            data.Add("TimeEnd", "12:00");
            data.Add("NameDriver", "Nguyễn Văn Huy");
            data.Add("Km", "3");
            data.Add("Status", "Hoạt động");
            data.Add("Mass", "3");
            data.Add("Unit", "Tấn");
            data.Add("Act", "Ép và chở rác");
            datas.Add(data);

            data = new Dictionary<string, string>();
            data.Add("Id", "3");
            data.Add("NameRoute", "Láng Hạ - Chuyến 2");
            data.Add("TimeStart", "23:30");
            data.Add("TimeEnd", "00:30");
            data.Add("NameDriver", "Phạm Hồng Sơn");
            data.Add("Km", "5");
            data.Add("Status", "Hoạt động");
            data.Add("Mass", "3");
            data.Add("Unit", "Tấn");
            data.Add("Act", "Nhận và chuyển rác");
            datas.Add(data);

            data = new Dictionary<string, string>();
            data.Add("Id", "4");
            data.Add("NameRoute", "Ngọc Hà - Nam Sơn");
            data.Add("TimeStart", "23:30");
            data.Add("TimeEnd", "00:30");
            data.Add("NameDriver", "Lê Xuân Hưng");
            data.Add("Km", "2");
            data.Add("Status", "Hoạt động");
            data.Add("Mass", "3");
            data.Add("Unit", "Tấn");
            data.Add("Act", "Quét đường");
            datas.Add(data);

            dictionary.Add("data", datas);
            return Json(dictionary);
        }
        [HttpPost]
        public object JTableWarning()
        {
            Dictionary<string, object> dictionary = new Dictionary<string, object>();
            dictionary.Add("draw", 1);
            dictionary.Add("recordsFiltered", 2);
            dictionary.Add("recordsTotal", 2);
            Dictionary<string, string> data = new Dictionary<string, string>();
            List<object> datas = new List<object>();
            data.Add("Id", "1");
            data.Add("Title", "Đi vào Đường Bồ Đề");
            data.Add("WarningType", "Chạy sai tuyến đường");
            data.Add("Time", "16:30 05/08/2019");
            data.Add("GPS", "21.0352164,105.8713384");
            data.Add("GPSText", "147, Đường Bồ Đề, Phường Bồ Đề, Quận Long Biên, Bồ Đề, Long Biên, Hà Nội, Vietnam");
            datas.Add(data);

            data = new Dictionary<string, string>();
            data.Add("Id", "2");
            data.Add("Title", "Chạy quá 5km/h");
            data.Add("WarningType", "Quá tốc độ");
            data.Add("Time", "21:30 04/08/2019");
            data.Add("GPS", "21.040092, 105.874965");
            data.Add("GPSText", "Cổ Linh, Bồ Đề, Long Biên, Hà Nội, Vietnam");
            datas.Add(data);


            dictionary.Add("data", datas);
            return Json(dictionary);
        }
        [HttpPost]
        public object JTableQuota()
        {
            Dictionary<string, object> dictionary = new Dictionary<string, object>();
            dictionary.Add("draw", 1);
            dictionary.Add("recordsFiltered", 2);
            dictionary.Add("recordsTotal", 2);
            Dictionary<string, string> data = new Dictionary<string, string>();
            List<object> datas = new List<object>();
            data.Add("Id", "1");
            data.Add("Quota", "Xăng");
            data.Add("Quantity", "120");
            data.Add("UnitPrice", "Lít");
            datas.Add(data);

            data = new Dictionary<string, string>();
            data.Add("Id", "2");
            data.Add("Quota", "Bảo dưỡng");
            data.Add("Quantity", "1.500.000");
            data.Add("UnitPrice", "VNĐ");
            datas.Add(data);

            dictionary.Add("data", datas);
            return Json(dictionary);
        }
        [HttpPost]
        public object JTableActualCosts()
        {
            Dictionary<string, object> dictionary = new Dictionary<string, object>();
            dictionary.Add("draw", 1);
            dictionary.Add("recordsFiltered", 2);
            dictionary.Add("recordsTotal", 2);
            Dictionary<string, string> data = new Dictionary<string, string>();
            List<object> datas = new List<object>();
            data.Add("Id", "1");
            data.Add("ActualCosts", "Xăng");
            data.Add("Value", "50");
            data.Add("Time", "Lít");
            data.Add("Sender", "Nguyễn Văn Huy");
            data.Add("Receiver", "Cây xăng Nam Sơn");
            data.Add("Note", "");
            datas.Add(data);

            data = new Dictionary<string, string>();
            data.Add("Id", "2");
            data.Add("ActualCosts", "Thay dầu máy");
            data.Add("Value", "200.000");
            data.Add("Time", "VNĐ");
            data.Add("Sender", "Nguyễn Văn Huy");
            data.Add("Receiver", "Gara Ô TÔ TÍN PHÁT");
            data.Add("Note", "");
            datas.Add(data);


            dictionary.Add("data", datas);
            return Json(dictionary);
        }
        [HttpPost]
        public object JTableMaintenanceHistory()
        {
            Dictionary<string, object> dictionary = new Dictionary<string, object>();
            dictionary.Add("draw", 1);
            dictionary.Add("recordsFiltered", 2);
            dictionary.Add("recordsTotal", 2);
            Dictionary<string, string> data = new Dictionary<string, string>();
            List<object> datas = new List<object>();
            data.Add("Id", "1");
            data.Add("Maintenance", "Sửa chữa nhỏ");
            data.Add("Type", "Sửa chữa");
            data.Add("Unit", "VNĐ");
            data.Add("Time", "20/07/2019");
            data.Add("Note", "Gara Ô TÔ TÍN PHÁT");
            data.Add("Address", "");
            data.Add("Status", "");
            datas.Add(data);

            data = new Dictionary<string, string>();
            data.Add("Id", "2");
            data.Add("Maintenance", "Bảo dưỡng đinh kỳ");
            data.Add("Type", "Bảo dưỡng");
            data.Add("Unit", "VNĐ");
            data.Add("Time", "22/07/2019");
            data.Add("Note", "Gara Ô TÔ TÍN PHÁT");
            data.Add("Address", "");
            data.Add("Status", "");
            datas.Add(data);


            dictionary.Add("data", datas);
            var count = dictionary.Count();

            return Json(dictionary);
        }
        [HttpPost]
        public object JTableRegisterCars()
        {
            Dictionary<string, object> dictionary = new Dictionary<string, object>();
            dictionary.Add("draw", 1);
            dictionary.Add("recordsFiltered", 2);
            dictionary.Add("recordsTotal", 2);
            Dictionary<string, string> data = new Dictionary<string, string>();
            List<object> datas = new List<object>();
            data.Add("Id", "1");
            data.Add("Maintenance", "Sửa chữa nhỏ");
            data.Add("Type", "Sửa chữa");
            data.Add("Unit", "VNĐ");
            data.Add("Time", "10/08/2019");
            data.Add("Note", "Gara Ô TÔ TÍN PHÁT");
            data.Add("Address", "");
            data.Add("Status", "");
            datas.Add(data);

            data = new Dictionary<string, string>();
            data.Add("Id", "2");
            data.Add("Maintenance", "Bảo dưỡng đinh kỳ");
            data.Add("Type", "Bảo dưỡng");
            data.Add("Unit", "VNĐ");
            data.Add("Time", "22/08/2019");
            data.Add("Note", "Gara Ô TÔ TÍN PHÁT");
            data.Add("Address", "");
            data.Add("Status", "");
            datas.Add(data);


            dictionary.Add("data", datas);
            var count = dictionary.Count();

            return Json(dictionary);
        }
        [HttpPost]
        public object JTableAttribute()
        {
            Dictionary<string, object> dictionary = new Dictionary<string, object>();
            dictionary.Add("draw", 1);
            dictionary.Add("recordsFiltered", 3);
            dictionary.Add("recordsTotal", 3);
            Dictionary<string, string> data = new Dictionary<string, string>();
            List<object> datas = new List<object>();
            data.Add("Id", "1");
            data.Add("code", "Loại xe");
            data.Add("value", "Chợ rác");
            datas.Add(data);

            data = new Dictionary<string, string>();
            data.Add("Id", "2");
            data.Add("code", "Màu sắc");
            data.Add("value", "Xanh, đen");
            datas.Add(data);
            data = new Dictionary<string, string>();
            data.Add("Id", "3");
            data.Add("code", "Công xuất");
            data.Add("value", "100 mã lực");
            datas.Add(data);

            dictionary.Add("data", datas);
            var count = dictionary.Count();

            return Json(dictionary);
        }
        [HttpGet]
        public object GetItem(int id)
        {
            var data = (from a in _context.UrencoTrashCars
                        where a.Id == id
                        select new
                        {
                            a.Id,
                            a.CarCode,
                            a.Group,
                            a.Generic,
                            a.Origin,
                            a.YearManufacture,
                            a.OwnerCode,
                            a.Category,
                            a.WeightItself,
                            a.DesignPayload,
                            a.PayloadPulled,
                            a.PayloadTotal,
                            a.SizeRegistry,
                            a.SizeUse,
                            a.RegistryDuration,
                            a.InsurranceDuration,
                            a.Note,
                            a.Image,
                            a.BranchCode,
                            a.LicensePlate,
                            sRegistryDuration = a.RegistryDuration.HasValue ? a.RegistryDuration.Value.ToString("dd/MM/yyyy") : "",
                            sInsurranceDuration = a.InsurranceDuration.HasValue ? a.InsurranceDuration.Value.ToString("dd/MM/yyyy") : "",
                            sYearManufacture = a.YearManufacture.HasValue ? a.YearManufacture.Value.ToString("dd/MM/yyyy") : "",
                            a.Type,
                            a.QrCode,
                            a.DriverDefault,
                            a.RouteDefault,
                            sRegistryExpirationDate = a.RegistryExpirationDate.HasValue ? a.RegistryExpirationDate.Value.ToString("dd/MM/yyyy") : "",
                            sRoadExpirationDate = a.RoadExpirationDate.HasValue ? a.RoadExpirationDate.Value.ToString("dd/MM/yyyy") : "",
                            sMaintenanceNextDate = a.MaintenanceNextDate.HasValue ? a.MaintenanceNextDate.Value.ToString("dd/MM/yyyy") : "",

                        }).FirstOrDefault();
            return Json(data);
        }
        [HttpPost]
        public object ChangeStatusCar(int id, string status)
        {
            var msg = new JMessage { Error = false };
            var data = _context.UrencoTrashCars.FirstOrDefault(x => !x.IsDeleted && x.Id == id);
            if (data != null)
            {
                data.Status = status;
                _context.UrencoTrashCars.Update(data);
                _context.SaveChanges();
            }
            else
            {
                msg.Error = true;
            }
            return Json(msg);
        }
        [HttpPost]
        public object GetCarType()
        {
            var data = from a in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "URENCO_TYPE_VEHICLE")
                       select new
                       {
                           a.CodeSet,
                           a.ValueSet
                       };
            return data;
        }
        [HttpPost]
        public object GetObjectForType(string objType)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                if (objType == "BIN")
                {
                    var data = (from a in _context.UrencoRubbishBins
                                where !a.IsDeleted
                                select new
                                {
                                    Code = a.BinCode,
                                    Value = a.BinName
                                }).ToList();
                    msg.Object = data;
                }
                else if (objType == "AREA")
                {
                    var data = (from a in _context.UrencoNodes
                                select new
                                {
                                    Code = a.NodeCode,
                                    Value = a.NodeName
                                }).ToList();
                    msg.Object = data;
                }
                else if (objType == "ROUTE")
                {
                    var data = (from a in _context.UrencoRoutes
                                where !a.IsDeleted
                                select new
                                {
                                    Code = a.RouteCode,
                                    Value = a.RouteName
                                }).ToList();
                    msg.Object = data;
                }
                else
                {
                    var data = (from a in _context.UrencoTrashCars
                                where !a.IsDeleted
                                select new
                                {
                                    Code = a.CarCode,
                                    Value = a.CarCode
                                }).ToList();
                    msg.Object = data;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
            }
            return Json(msg);
        }
        [HttpPost]
        public object InsertWorkSpace([FromBody]UrencoObjectWorkspace obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var check = _context.UrencoObjectWorkspaces.FirstOrDefault(x => !x.IsDeleted && x.CarCode == obj.CarCode && x.ObjectCode == obj.ObjectCode && x.ObjectType == obj.ObjectType);
                if (check == null)
                {
                    if (obj.ObjectType == "BIN")
                    {
                        var data = _context.UrencoRubbishBins.FirstOrDefault(x => !x.IsDeleted && x.BinCode == obj.ObjectCode);
                        if (data != null)
                        {
                            obj.ObjectCodeName = data.BinName;
                        }
                    }
                    else if (obj.ObjectType == "AREA")
                    {
                        var data = _context.UrencoNodes.FirstOrDefault(x => x.NodeCode == obj.ObjectCode);
                        if (data != null)
                        {
                            obj.ObjectCodeName = data.NodeName;
                        }
                    }
                    else if (obj.ObjectType == "ROUTE")
                    {
                        var data = _context.UrencoRoutes.FirstOrDefault(x => !x.IsDeleted && x.RouteCode == obj.ObjectCode);
                        if (data != null)
                        {
                            obj.ObjectCodeName = data.RouteName;
                        }
                    }
                    else
                    {
                        var data = _context.UrencoTrashCars.FirstOrDefault(x => !x.IsDeleted && x.CarCode == obj.ObjectCode);
                        if (data != null)
                        {
                            obj.ObjectCodeName = data.CarCode;
                        }
                    }
                    obj.IsDeleted = false;
                    obj.CreatedTime = DateTime.Now;
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    _context.UrencoObjectWorkspaces.Add(obj);
                    _context.SaveChanges();
                    msg.Title = "Thêm thành công !";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Đã thêm đối tượng này cho xe !";
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi thêm !";
            }
            return Json(msg);
        }
        [HttpPost]
        public object GetListWorkSpace([FromBody]JTableSearch jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.UrencoObjectWorkspaces
                        join b in _context.UrencoCatObjectTypes on a.ObjectType equals b.ObjTypeCode
                        where (a.IsDeleted != true && (string.IsNullOrEmpty(jTablePara.CarCode) || (a.CarCode == jTablePara.CarCode)))
                        select new
                        {
                            a.Id,
                            a.ObjectCodeName,
                            a.ObjectCode,
                            b.ObjTypeName,
                            //a.Code,
                            //a.Value
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ObjTypeName", "ObjectCode", "ObjectCodeName");
            return Json(jdata);
        }
        [HttpPost]
        public object DeleteWorkSpace([FromBody]int id)
        {
            var msg = new JMessage { Error = false };
            try
            {
                var data = _context.UrencoObjectWorkspaces.FirstOrDefault(x => x.IsDeleted == false && x.Id == id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    _context.UrencoObjectWorkspaces.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue("HR_HR_MAN_MSG_EMPLOYEE"));
                    return Json(msg);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy đối tượng này của xe";
                    return Json(msg);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_DELETE"));
                return Json(msg);
            }
        }

        [HttpPost]
        public object GetUserDefaultCar()
        {
            var data = from a in _context.Users
                       join b in _context.UserRoles on a.Id equals b.UserId
                       join c in _context.Roles on b.RoleId equals c.Id
                       where c.Code == "LAI_XE"
                       select new
                       {
                           Code = a.Id,
                           Name = a.GivenName
                       };
            return data;
        }

        //[HttpPost]
        //public JsonResult GetBranchWorking()
        //{
        //    var msg = new JMessage();
        //    var data = _context.AdOrganizations.Where(x => x.IsDeleted == false).Select(x => new { Code = x.BranchCode, Name = x.BranchName });
        //    msg.Object = data;
        //    return Json(msg);
        //}

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }).Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion

        public class JTableSearch : JTableModel
        {
            public string CarCode { get; set; }
            public string Group { get; set; }
            public int Flag { get; set; }
        }

    }
}