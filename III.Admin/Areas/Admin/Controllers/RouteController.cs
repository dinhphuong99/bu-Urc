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
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class RouteController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IGoogleAPIService _googleAPIService;
        private readonly IStringLocalizer<RouteController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;


        public RouteController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IGoogleAPIService googleAPIService, IStringLocalizer<RouteController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
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
            var query = from a in _context.UrencoRoutes
                            .Where(x => x.IsDeleted == false && (string.IsNullOrEmpty(jTablePara.RouteName) || x.RouteName.ToLower().Contains(jTablePara.RouteName.ToLower())))
                        join b in _context.Users on a.CreatedBy equals b.UserName
                        join c in _context.CommonSettings.Where(x => x.Group == "ROAD_STATUS") on a.Status equals c.CodeSet into c2
                        from c in c2.DefaultIfEmpty()
                        join d in _context.CommonSettings.Where(x => x.Group == "ROAD_PRIORIRY") on a.Status equals d.CodeSet into d2
                        from d in d2.DefaultIfEmpty()
                        join e in _context.CommonSettings.Where(x => x.Group == "ROAD_LEVEL") on a.Status equals e.CodeSet into e2
                        from e in e2.DefaultIfEmpty()
                        join f in _context.Vayxe_Customer on a.Manager equals f.Id into f2
                        from f in f2.DefaultIfEmpty()
                        where
                        (jTablePara.Manager == null || (jTablePara.Manager.HasValue && a.Manager == jTablePara.Manager.Value))
                        && (string.IsNullOrEmpty(jTablePara.Status) || a.Status == jTablePara.Status)
                        && (jTablePara.NumLine == null || (jTablePara.NumLine.HasValue && a.NumLine == jTablePara.NumLine.Value))
                        && (jTablePara.RouteLevel == null || jTablePara.RouteLevel.HasValue && a.RouteLevel == jTablePara.RouteLevel.Value)
                        && (jTablePara.RoutePriority == null || (jTablePara.RoutePriority.HasValue && a.RoutePriority == jTablePara.RoutePriority.Value))
                        //&& (string.IsNullOrEmpty(jTablePara.RouteCode) || a.RouteCode.Equals(jTablePara.RouteCode))
                        select new
                        {
                            a.Id,
                            a.RouteName,
                            RouteLevel = a.RouteLevel,
                            RoutePriority = a.RoutePriority,
                            Manager = (f != null ? f.FirstName + ' ' +  f.LastName: ""),
                            Status = (c != null ? c.ValueSet : ""),
                            a.NumLine,
                            a.NumLength,
                            CreatedBy = b != null ? b.GivenName : "",
                            a.RouteDataGps
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "RouteName", "RouteLevel", "RoutePriority", "Manager", "Status", "NumLine", "NumLength", "CreatedBy", "RouteDataGps");
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
                //msg.Title = _sharedResources["COM_ERR_UPLOAD_FILE"];
                msg.Title = _sharedResources["COM_MSG_ERR"];
                return Json(msg);
            }
        }
        [HttpPost]
        public object Insert([FromBody]UrencoRoute obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var check = _context.UrencoRoutes.FirstOrDefault(x => x.RouteCode == obj.RouteCode);
                if (check != null)
                {
                    msg.Error = true;
                    //msg.Title = "Mã tuyến đường này đã tồn tại";
                    msg.Title = _stringLocalizer["ROUTE_VALIDATE_ROUTE_CODE"];
                }
                else
                {
                    obj.CreatedTime = DateTime.Now;
                    obj.IsDeleted = false;
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    _context.UrencoRoutes.Add(obj);
                    _context.SaveChanges();
                    //msg.Title = "Thêm mới tuyến đường thành công";
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["ROUTE_VALIDATE_ROUTE"]);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;

                //msg.Title = _sharedResources["COM_ERR_ADD"];
                System.Console.WriteLine(ex.Message);
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        [HttpPost]
        public object Update([FromBody]UrencoRoute obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.UrencoRoutes.FirstOrDefault(x => x.IsDeleted == false && x.Id == obj.Id);
                if (data != null)
                {
                    data.RouteName = obj.RouteName;
                    data.RouteType = obj.RouteType;
                    data.NumLength = obj.NumLength;
                    data.NumLine = obj.NumLine;
                    data.Manager = obj.Manager;
                    data.RouteDataGps = obj.RouteDataGps;
                    data.Status = obj.Status;
                    data.RouteLevel = obj.RouteLevel;
                    data.RoutePriority = obj.RoutePriority;
                    data.TimeActive = obj.TimeActive;
                    data.Note = obj.Note;
                    data.UpdatedTime = DateTime.Now;
                    data.Images = obj.Images;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.QrCode = obj.QrCode;
                    _context.UrencoRoutes.Update(data);
                    _context.SaveChanges();
                    msg.Error = false;
                    //msg.Title = "Cập nhật thành công";
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];

                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Cập nhật bị lỗi, tuyến đường không tồn tại";
                    msg.Title = _stringLocalizer["ROUTE_VALIDATE_UPDATE_ERR"];

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
                var data = _context.UrencoRoutes.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.UrencoRoutes.Update(data);
                    _context.SaveChanges();
                    //msg.Title = "Xóa thành công";
                    msg.Title = _sharedResources["COM_DELETE_SUCCESS"];


                    return Json(msg);

                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Tuyến đường không tồn tại, vui lòng làm mới trang";
                    msg.Title = _stringLocalizer["ROUTE_VALIDATE_ROUTE_EXIST"];
                    return Json(msg);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                //msg.Title = _sharedResources["COM_ERR_DELETE"];
                msg.Title = _sharedResources["COM_MSG_ERR"];
                return Json(msg);
            }
        }
        [HttpGet]
        public object GetItem(int id)
        {
            var data = (from a in _context.UrencoRoutes
                        where a.Id == id
                        select new
                        {
                            a.Id,
                            a.RouteName,
                            a.RouteDataGps,
                            a.RouteLevel,
                            a.RoutePriority,
                            a.Note,
                            a.Manager,
                            a.Status,
                            a.NumLine,
                            a.NumLength,
                            a.TimeActive,
                            a.Images,
                            a.QrCode,
                            a.RouteCode,
                            a.RouteType

                        }).FirstOrDefault();
            return Json(data);
        }

        [HttpPost]
        public object GetStatus()
        {
            var list = from a in _context.CommonSettings.Where(x => x.Group == "ROAD_STATUS").OrderBy(x => x.SettingID)
                       select new
                       {
                           Code = a.CodeSet,
                           Name = a.ValueSet
                       };
            return list.ToList();
        }
        [HttpPost]
        public object GetEmployee()
        {
            var list = (from a in _context.Vayxe_Customer
                       select new
                       {
                           Code = a.Id,
                           Name = a.FirstName + " " + a.LastName
                       }).DistinctBy(x => x.Code);
            return list.ToList();
        }
        [HttpPost]
        public object InsertDriverMapping([FromBody]UrencoDriverMapping obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {

                obj.IsDeleted = false;
                obj.CreatedBy = ESEIM.AppContext.UserName;
                obj.CreatedTime = DateTime.Now;
                _context.UrencoDriverMappings.Add(obj);
                _context.SaveChanges();
                //msg.Title = "Thêm lái xe thành công";
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["ROUTE_VALIDATE_DRIVER"]);

            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra khi thêm lái xe";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        public object DeleteDriverMapping(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.UrencoDriverMappings.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.UrencoDriverMappings.Update(data);
                    _context.SaveChanges();
                    //msg.Title = "Xóa lái xe thành công";
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["ROUTE_VALIDATE_DRIVER"]);
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Không tồn tại bản ghi";
                    msg.Title = _sharedResources["COM_MSG_NOT_EXITS_RECORD"];

                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra khi xóa lái xe";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        public object JTableDriver([FromBody]JTableSearch jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.UrencoDriverMappings
                        join b in _context.Vayxe_Customer on a.Driver equals b.Id into b1
                        from b2 in b1.DefaultIfEmpty()
                        where a.IsDeleted == false
                         && (string.IsNullOrEmpty(jTablePara.RouteCode) || (!string.IsNullOrEmpty(jTablePara.RouteCode) && a.RouteCode.Equals(jTablePara.RouteCode)))
                        select new
                        {
                            a.Id,
                            a.RouteCode,
                            a.Note,
                            a.Driver,
                            fullname = b2.FirstName + " " + b2.LastName,
                            a.CarCode,
                            a.ActiveFrom,
                            a.ActiveTo
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "fullname", "RouteCode", "Note", "Driver", "CarCode", "ActiveFrom", "ActiveTo");
            return Json(jdata);
        }
        public object JTableNode([FromBody]JTableSearch jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.UrencoNodes
                        where ((string.IsNullOrEmpty(jTablePara.RouteCode)) || ((!string.IsNullOrEmpty(jTablePara.RouteCode)) && (a.Route.Equals(jTablePara.RouteCode))))
                        select new
                        {
                            a.Id,
                            a.NodeName,
                            a.NodeCode,
                            a.Route,
                            a.Note,

                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "NodeName", "NodeCode", "Route", "Note");
            return Json(jdata);
        }
        [HttpPost]
        public object InsertNode([FromBody]Note obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.UrencoNodes.FirstOrDefault(x => x.NodeCode.Equals(obj.NodeCode));
                if (data == null)
                {
                    msg.Error = true;
                    //msg.Title = "Điểm đã bị xóa hoặc không tồn tại";
                    msg.Title = _stringLocalizer["ROUTE_VALIDATE_POINT"];

                }
                else
                {
                    data.Route = obj.RouteCode;
                    _context.UrencoNodes.Update(data);
                    _context.SaveChanges();
                    //msg.Title = "Thêm thành công điểm vào tuyến đường";
                    msg.Title = _stringLocalizer["ROUTE_VALIDATE_ADD_SUCCESS"];
                }

            }
            catch (Exception ex)
            {

                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra khi thêm điểm vào tuyến đường";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);

        }
        public object DeleteNode(int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.UrencoNodes.FirstOrDefault(x => x.Id == id);
                if (data == null)
                {
                    msg.Error = true;
                    //msg.Title = "Điểm đã bị xóa hoặc không tồn tại";
                    msg.Title = _stringLocalizer["ROUTE_VALIDATE_POINT"];
                }
                else
                {
                    data.Route = "";
                    _context.UrencoNodes.Update(data);
                    _context.SaveChanges();
                    //msg.Title = "Xóa thành công điểm khỏi tuyến đường";
                    msg.Title = _stringLocalizer["ROUTE_VALIDATE_DEL_SUCCESS"];
                }

            }
            catch (Exception ex)
            {

                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra khi xóa điểm khỏi tuyến đường";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);

        }
        [HttpPost]
        public object GetListNode()
        {
            var list = from a in _context.UrencoNodes
                       select new
                       {
                           Code = a.NodeCode,
                           Name = a.NodeName
                       };
            return list.ToList();
        }
        [HttpPost]
        public object GetListCar()
        {
            var list = from a in _context.UrencoTrashCars
                       select new
                       {
                           Code = a.CarCode,
                           Name = a.CarName
                       };
            return list.ToList();
        }



        ///Inner classs
        ///
        public class Note
        {
            public string NodeCode { get; set; }
            public string RouteCode { get; set; }
        }
        public class JTableSearch : JTableModel
        {
            public string RouteName { get; set; }
            public int? RouteLevel { get; set; }
            public int? RoutePriority { get; set; }
            public int? Manager { get; set; }
            public int? NumLine { get; set; }
            public string Status { get; set; }
            public string RouteCode { get; set; }
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