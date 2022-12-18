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
    public class UrencoTypeCarController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IGoogleAPIService _googleAPIService;
        private readonly IStringLocalizer<UrencoTypeCarController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public UrencoTypeCarController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IGoogleAPIService googleAPIService, IStringLocalizer<UrencoTypeCarController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _googleAPIService = googleAPIService;
            _sharedResources = sharedResources;
            _stringLocalizer = stringLocalizer;
        }
        public IActionResult Index()
        {
            return View();
        }
        [HttpPost]
        public object JTable([FromBody]JTableSearch jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.CommonSettings
                        where a.Group == "URENCO_TYPE_CAR" && a.IsDeleted != true
                        select new
                        {
                            a.SettingID,
                            a.CodeSet,
                            a.ValueSet,
                            Activity = string.Join("; ", (from b in _context.UrencoActivityCars
                                                          join c in _context.UrencoCatActivitys on b.ActCode equals c.ActCode
                                                          where b.CarTypeCode == a.CodeSet && b.IsDeleted == false
                                                          select c.ActName).ToList()),
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "SettingID", "CodeSet", "ValueSet", "Activity");
            return Json(jdata);
        }
        [HttpGet]
        public object GetItem(int id)
        {
            var data = (from a in _context.CommonSettings
                        where a.SettingID == id
                        select new
                        {
                            a.SettingID,
                            a.CodeSet,
                            a.ValueSet
                        }).FirstOrDefault();
            return Json(data);
        }
        [HttpPost]
        public JsonResult getListActivity()
        {
            var data = from a in _context.UrencoCatActivitys
                       where a.IsDeleted == false
                       select new
                       {
                           a.ActCode,
                           a.ActName
                       };
            return Json(data.ToList());
        }
        #region hoạt động xe
        [HttpPost]
        public object GetListActivityCar(string carType)
        {
            var query = (from a in _context.UrencoActivityCars
                         where (a.IsDeleted != true && a.CarTypeCode == carType)
                         select new
                         {
                             a.Id,
                             a.ActCode,
                             //ActName =string.Join("",(from b in _context.UrencoCatActivitys
                             //                              where b.ActCode == a.ActCode && b.IsDeleted == false
                             //                              select b.ActName).ToList()),
                             ActName = _context.UrencoCatActivitys.FirstOrDefault(x => !x.IsDeleted && x.ActCode == a.ActCode).ActName,
                             a.CarTypeCode,
                             a.Priority,
                         }).ToList();
            return Json(query);
        }
        [HttpPost]
        public object InsertActivityCar([FromBody]UrencoActivityCar obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var check = _context.UrencoActivityCars.FirstOrDefault(x => !x.IsDeleted && x.CarTypeCode == obj.CarTypeCode && x.ActCode == obj.ActCode);
                if (check == null)
                {
                    UrencoActivityCar dataNew = new UrencoActivityCar();
                    dataNew.ActCode = obj.ActCode;
                    dataNew.CarTypeCode = obj.CarTypeCode;
                    dataNew.Priority = obj.Priority;
                    dataNew.IsDeleted = false;
                    _context.UrencoActivityCars.Add(obj);
                    _context.SaveChanges();
                    msg.Title = "Thêm hành động thành công";
                    msg.Object = new
                    {
                        data = _context.UrencoActivityCars.FirstOrDefault(x => !x.IsDeleted && x.CarTypeCode == obj.CarTypeCode && x.ActCode == obj.ActCode),
                        dataName = _context.UrencoCatActivitys.FirstOrDefault(x => !x.IsDeleted && x.ActCode == obj.ActCode).ActName
                    };
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Đã tồn tại hoạt động này!";
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Sảy ra lỗi khi thêm mới";
            }

            return Json(msg);
        }
        [HttpPost]
        public object UpdateActivityCar([FromBody]UrencoActivityCar obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.UrencoActivityCars.FirstOrDefault(x => x.IsDeleted == false && x.Id == obj.Id);
                if (data != null)
                {
                    data.ActCode = obj.ActCode;
                    data.CarTypeCode = obj.CarTypeCode;
                    data.Priority = obj.Priority;
                    _context.UrencoActivityCars.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Sửa hành động thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "xảy ra lỗi khi cập nhật!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "xảy ra lỗi khi cập nhật!";
            }

            return Json(msg);
        }
        [HttpPost]
        public object DeleteActivityCar([FromBody]int id)
        {
            var msg = new JMessage { Error = false };
            try
            {
                var data = _context.UrencoActivityCars.FirstOrDefault(x => x.IsDeleted == false && x.Id == id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    _context.UrencoActivityCars.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Xóa hành động xe thành công!";
                    return Json(msg);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Hoạt động không tồn tại với loại xe này";
                    return Json(msg);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = "Có lỗi khi xóa hành động xe!";
                return Json(msg);
            }
        }
        #endregion
        #region thuộc tính của xe
        [HttpPost]
        public object InsertCatObjectActivity([FromBody]UrencoCatObjectActivity obj)
        {
            var msg = new JMessage { Error = false };
            try
            {
                obj.CreatedTime = DateTime.Now;
                obj.CreatedBy = ESEIM.AppContext.UserName;
                _context.UrencoCatObjectActivitys.Add(obj);
                _context.SaveChanges();
                msg.Title = "Thêm thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_DELETE"));

            }
            return Json(msg);
        }
        [HttpPost]
        public object UpdateCatObjectActivity([FromBody]UrencoCatObjectActivity obj)
        {
            var msg = new JMessage { Error = false };
            try
            {
                var data = _context.UrencoCatObjectActivitys.FirstOrDefault(x => x.IsDeleted == false && x.Id == obj.Id);
                if (data != null)
                {
                    data.ActCode = obj.ActCode;
                    data.ObjTypeCode = obj.ObjTypeCode;
                    //data.Code = obj.Code;
                    //data.Value = obj.Value;
                    _context.UrencoCatObjectActivitys.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Sửa giá trị thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Giá trị không tồn tại với loại xe này";
                    return Json(msg);
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_DELETE"));

            }
            return Json(msg);
        }
        [HttpPost]
        public object DeleteCatObjectActivity([FromBody]int id)
        {
            var msg = new JMessage { Error = false };
            try
            {
                var data = _context.UrencoCatObjectActivitys.FirstOrDefault(x => x.IsDeleted == false && x.Id == id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    _context.UrencoCatObjectActivitys.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue("HR_HR_MAN_MSG_EMPLOYEE"));
                    return Json(msg);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Hoạt động không tồn tại với loại xe này";
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
        public object JTableobjectActivityType([FromBody]JTableSearch jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.UrencoCatObjectActivitys
                        join b in _context.UrencoCatActivitys on a.ActCode equals b.ActCode
                        where (a.IsDeleted != true && (string.IsNullOrEmpty(jTablePara.ActCode) || (a.ActCode == jTablePara.ActCode)) && a.ObjTypeCode == jTablePara.CarTypeCode)
                        select new
                        {
                            a.Id,
                            a.ActCode,
                            a.ObjTypeCode,
                            //a.Code,
                            //a.Value
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ActCode", "ObjTypeCode", "Code", "Value");
            return Json(jdata);
        }
        [HttpPost]
        public object GetListCatObjectType()
        {
            var data = (from a in _context.UrencoCatObjectTypes.Where(x => !x.IsDeleted)
                        select new
                        {
                            a.ObjTypeCode,
                            a.ObjTypeName
                        }).ToList();
            return Json(data);
        }
        #endregion

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
            public string ActName { get; set; }
            public string ActCode { get; set; }
            public string CarTypeCode { get; set; }
            public string Group { get; set; }
            public int Flag { get; set; }
        }

    }
}