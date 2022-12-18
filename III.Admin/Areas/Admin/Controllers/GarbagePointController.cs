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
using Microsoft.Extensions.Localization;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class GarbagePointController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IGoogleAPIService _googleAPIService;
        private readonly IStringLocalizer<GarbagePointController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public GarbagePointController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IGoogleAPIService googleAPIService, IStringLocalizer<GarbagePointController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
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
        public class JTableModelUrencoNode : JTableModel
        {
            public string NodeCode { get; set; }
            public string NodeName { get; set; }
            public string Address { get; set; }
            public int? VolumeLimit { get; set; }
            public string Note { get; set; }
        }
        [HttpPost]
        public object JTable([FromBody]JTableModelUrencoNode jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.UrencoNodes
                        where (string.IsNullOrEmpty(jTablePara.NodeCode) || a.NodeCode.ToLower().Equals(jTablePara.NodeCode.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.NodeName) || a.NodeName.ToLower().Equals(jTablePara.NodeName.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.Address) || a.Address.ToLower().Equals(jTablePara.Address.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.Note) || a.Note.ToLower().Equals(jTablePara.Note.ToLower()))
                        && ((jTablePara.VolumeLimit == null) || (jTablePara.VolumeLimit == a.VolumeLimit))
                        select new
                        {
                            id = a.Id,
                            nodeCode = a.NodeCode,
                            nodeName = a.NodeName,
                            route = _context.UrencoRoutes.FirstOrDefault(x =>

                            x.RouteCode == a.Route
                            ).RouteName,
                            
                            //route = a.Route,
                            marager = _context.Vayxe_Customer.FirstOrDefault(y => y.Id == a.Manager).FirstName 
                                    + " " + _context.Vayxe_Customer.FirstOrDefault(y => y.Id == a.Manager).LastName,
                            address = a.Address,
                            volumeLimit = a.VolumeLimit,
                            gps = a.GpsNode,
                            note = a.Note
                        };

            int count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().ToList();
            var data1 = data.Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data1, jTablePara.Draw, count, "id", "nodeCode", "nodeName", "route", "marager", "address", "gps", "volumeLimit", "note");
            return Json(jdata);
        }
        [HttpPost]
        public object Insert([FromBody]UrencoNode data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var query = _context.UrencoNodes.FirstOrDefault(x => x.NodeCode.Equals(data.NodeCode));
                if(query != null)
                {
                    msg.Error = true;
                    //msg.Title = "Điểm này đã tồn tại";
                    msg.Title = String.Format(_sharedResources["COM_MSG_EXITS"], _stringLocalizer["GP_MSG_THIS_POINT"]);
                }
                else
                {
                    _context.UrencoNodes.Add(data);
                    _context.SaveChanges();
                    //msg.Title = "Thêm mới thành công";
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["GP_MSG_NEW"]);
                }

            }
            catch(Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi thêm thông tin điểm";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);

        }
        public object Update([FromBody]UrencoNode data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var query = _context.UrencoNodes.FirstOrDefault(x => x.NodeCode.Equals(data.NodeCode));
                if(query == null)
                {
                    msg.Error = true;
                    //msg.Title = "Điểm không tồn tại";
                    msg.Title = _stringLocalizer["GP_MSG_NOT_EXISTED_POINT"];
                }
                else
                {
                    query.Volume = data.Volume;
                    query.Manager = data.Manager;
                    query.Unit = data.Unit;
                    query.NodeName = data.NodeName;
                    query.Note = data.Note;
                    query.GpsNode = data.GpsNode;
                    query.VolumeLimit = data.VolumeLimit;
                    query.Address = data.Address;
                    query.GpsNode = data.GpsNode;
                    query.QrCode = data.QrCode;
                    query.Image = data.Image;
                    query.Route = data.Route;
                    query.Image = data.Image;
                    _context.UrencoNodes.Update(query);
                    _context.SaveChanges();
                    //msg.Title = "Cập nhật điểm thành công";
                    msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["GP_MSG_POINT"]);
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi sửa thông tin điểm";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        public object Delete(int id)
        {
            var msg = new JMessage(){ Error = false };
            try
            {
                var query = _context.UrencoNodes.FirstOrDefault(x => x.Id.Equals(id));
                if(query == null)
                {
                    msg.Error = true;
                    //msg.Title = "Điểm không tồn tại";
                    msg.Title = _stringLocalizer["GP_MSG_NOT_EXISTED_POINT"];
                }
                else
                {
                    _context.UrencoNodes.Remove(query);
                    _context.SaveChanges();
                    //msg.Title = "Xóa điểm thành công";
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["GP_MSG_POINT"]);
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi xóa điểm";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }
        public object GetItem(int id)
        {
            var query = _context.UrencoNodes.FirstOrDefault(x => x.Id.Equals(id));
            return query;
        }
        [HttpPost]
        public object GetListRoute()
        {
            var data = _context.UrencoRoutes.Where(x => x.IsDeleted == false).Select(x=> new { Code = x.RouteCode, Name = x.RouteName});
            return data;
        }
        public object GetListUnit()
        {
            var data = _context.CommonSettings.Where(x => x.IsDeleted == false && x.Group == "URENCO_UNIT").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }
        public object GetListStatus()
        {
            var data = _context.CommonSettings.Where(x => x.IsDeleted == false && x.Group == "URENCO_STATUS_NODE").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return data;
        }
        [HttpGet]
        public object GetRoute(string RouteCode)
        {
            var data = (from a in _context.UrencoRoutes
                        where a.RouteCode == RouteCode
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
        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new Newtonsoft.Json.Linq.JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }).Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion

        
        public class CommonSettingInsert
        {
            public string CodeSet { get; set; }
            public string ValueSet { get; set; }
            public string Group { get; set; }
            public string AssetCode { get; set; }

            public string GroupNote { get; set; }
            public string Type { get; set; }
            public string Condition { get; set; }
        }

        [HttpPost]
        public object InsertCommonSetting([FromBody] CommonSettingInsert data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var obj = new CommonSetting
                {

                };

                obj.CodeSet = data.CodeSet;
                obj.ValueSet = data.ValueSet;
                obj.Group = data.Group;
                obj.GroupNote = data.GroupNote;
                obj.Type = data.Type;
                obj.AssetCode = data.AssetCode;
                _context.CommonSettings.Add(obj);
                _context.SaveChanges();
                //msg.Title = "Thêm mới thành công";
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["GP_MSG_NEW"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi thêm thông tin điểm";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);

        }
    }
}