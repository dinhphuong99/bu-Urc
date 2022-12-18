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
using Newtonsoft.Json.Linq;
using Microsoft.Extensions.Localization;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class UrencoActivityWorkingController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IGoogleAPIService _googleAPIService;
        private readonly IStringLocalizer<UrencoActivityWorkingController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;


        public UrencoActivityWorkingController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IGoogleAPIService googleAPIService, IStringLocalizer<UrencoActivityWorkingController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
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
            var query = from a in _context.UrencoCatActivitys
                        join b in _context.Users on a.CreatedBy equals b.UserName into b2
                        from b in b2.DefaultIfEmpty()
                        where (string.IsNullOrEmpty(jTablePara.ActName) || a.ActName.ToLower().Contains(jTablePara.ActName.ToLower()))
                        && a.IsDeleted == false
                        select new
                        {
                            a.Id,
                            a.ActCode,
                            a.ActName,
                            a.Note
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ActCode", "ActName", "Note");
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
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_UPLOAD_FILE"));
                return Json(msg);
            }
        }
        [HttpPost]
        public object Insert([FromBody]UrencoCatActivity obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                obj.IsDeleted = false;
                obj.CreatedBy = ESEIM.AppContext.UserName;
                obj.CreatedTime = DateTime.Now;
                _context.UrencoCatActivitys.Add(obj);
                _context.SaveChanges();
                msg.Title = "Thêm mới hoạt động thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
            }
            return Json(msg);
        }

        [HttpPost]
        public object Update([FromBody]UrencoCatActivity obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.UrencoCatActivitys.FirstOrDefault(x => x.IsDeleted == false && x.Id == obj.Id);
                if (data != null)
                {
                  
                    data.ActCode = obj.ActCode;
                    data.ActName = obj.ActName;

                    data.Note = obj.Note;
                    data.UpdatedTime = DateTime.Now;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    _context.UrencoCatActivitys.Update(data);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = "Cập nhật thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Cập nhật bị lỗi, xe rác không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Sảy ra lỗi khi cập nhật";
            }
            
            return Json(msg);
        }

        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage { Error = false };
            try
            {
                var data = _context.UrencoCatActivitys.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.UrencoCatActivitys.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue("HR_HR_MAN_MSG_EMPLOYEE"));
                    return Json(msg);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Xe không tồn tại, vui lòng làm mới trang";
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
        public object JTableHistoryRun()
        {
            Dictionary<string, object> dictionary = new Dictionary<string, object>();
            dictionary.Add("draw", 1);
            dictionary.Add("recordsFiltered",4);
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
            var data = (from a in _context.UrencoCatActivitys
                        where a.Id == id
                        select new
                        {
                            a.Id,
                            a.ActCode,
                            a.ActName,
                            a.Note,
                          
                            
                        }).FirstOrDefault();
            return Json(data);
        }
        [HttpPost]
        public object ChangeStatusCar(int id , string status)
        {
            var msg = new JMessage { Error = false };
            var data = _context.UrencoTrashCars.FirstOrDefault(x => !x.IsDeleted && x.Id == id);
            if(data != null)
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
            var data = from a in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "URENCO_TYPE_CAR")
                       select new {
                           a.CodeSet,
                           a.ValueSet
                       };
            return data;
        }

        public class JTableSearch : JTableModel
        {   
            public string ActName { get; set; }
            public string CarCode { get; set; }
            public string Group { get; set; }
            public int Flag { get; set; }
        }

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

    }
}