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
using Newtonsoft.Json.Linq;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class RubbishBinController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IGoogleAPIService _googleAPIService;
        private readonly IStringLocalizer<RubbishBinController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;


        public RubbishBinController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IGoogleAPIService googleAPIService, IStringLocalizer<RubbishBinController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
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
        public object JTable([FromBody]JTableSearch obj)
        {
            int intBeginFor = (obj.CurrentPage - 1) * obj.Length;
            var query = from a in _context.UrencoRubbishBins.Where(x => x.IsDeleted == false)
                        join b in _context.Users on a.CreatedBy equals b.UserName into b2
                        from b in b2.DefaultIfEmpty()

                        join c in _context.CommonSettings.Where(x=>x.Group== "BIN_STATUS") on a.Status equals c.CodeSet into c2
                        from c in c2.DefaultIfEmpty()

                        join d in _context.CommonSettings.Where(x => x.Group == "BIN_TYPE") on a.BinType equals d.CodeSet into d2
                        from d in d2.DefaultIfEmpty()

                        join e in _context.CommonSettings.Where(x => x.Group == "BIN_MATERIAL") on a.Material equals e.CodeSet into e2
                        from e in e2.DefaultIfEmpty()

                        join f in _context.HREmployees on a.WorkerManage equals f.Id into f2
                        from f in f2.DefaultIfEmpty()
                        where
                        (string.IsNullOrEmpty(obj.BinCode) || a.BinCode.ToLower().Contains(obj.BinCode.ToLower()))
                        && (string.IsNullOrEmpty(obj.Status) || a.Status == obj.Status)
                        && (obj.WorkerManage == null || a.WorkerManage == obj.WorkerManage)
                        select new
                        {
                            a.Id,
                            a.BinName,
                            a.Volume,
                            Material=(e!=null?e.ValueSet:""),
                            a.Structure,
                            a.LastGps,
                            a.CurGps,
                            Status =(c!=null?c.ValueSet:""),
                            BinType = (d!=null?d.ValueSet:""),
                            a.PercentageUsed,
                            CreatedBy= (b!=null?b.GivenName:""),
                            Manager = (f!=null?f.fullname:"")
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(obj.QueryOrderBy).Skip(intBeginFor).Take(obj.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, obj.Draw, count, "Id", "BinName", "Volume", "Material", "Structure", "LastGps", "CurGps", "Status", "BinType", "PercentageUsed", "CreatedBy", "Manager");
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
        public object Insert([FromBody]UrencoRubbishBin obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                obj.CreatedTime = DateTime.Now;
                obj.IsDeleted = false;
                obj.CreatedBy = ESEIM.AppContext.UserName;
                _context.UrencoRubbishBins.Add(obj);
                _context.SaveChanges();
                //msg.Title = "Thêm mới thùng rác thành công";
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["RB_VALIDATE_RECYCLE"]);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_ERR_ADD"];
            }
            return Json(msg);
        }

        [HttpPost]
        public object Update([FromBody]UrencoRubbishBin obj)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var data = _context.UrencoRubbishBins.FirstOrDefault(x => x.Id==obj.Id);
                if (data != null)
                {
                    data.BinName = obj.BinName;
                    data.Material = obj.Material;
                    data.WorkerManage = obj.WorkerManage;
                    data.BinType = obj.BinType;
                    data.Volume = obj.Volume;
                    data.Structure = obj.Structure;
                    data.Status = obj.Status;
                    data.Note = obj.Note;
                    data.Image = obj.Image;
                    _context.UrencoRubbishBins.Update(data);
                    _context.SaveChanges();
                    msg.Error = false;
                    //msg.Title = "Cập nhật thành công";
                    msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];

                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Thùng rác không tồn tại, vui lòng làm mới trang";
                    msg.Title = _stringLocalizer["RB_VALIDATE_RECYCLE_NOT_EXIST"];
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
                var data = _context.UrencoRubbishBins.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    data.IsDeleted = true;
                    data.DeletedBy = ESEIM.AppContext.UserName;
                    data.DeletedTime = DateTime.Now;
                    _context.UrencoRubbishBins.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["RB_VALIDATE_EMPLOYEE"]);
                    return Json(msg);
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Thùng rác không tồn tại, vui lòng làm mới trang";
                    msg.Title = _stringLocalizer["RB_VALIDATE_RECYCLE_NOT_EXIST"];
                    return Json(msg);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = _sharedResources["COM_ERR_DELETE"];
                return Json(msg);
            }
        }
        [HttpGet]
        public object GetItem(int id)
        {
            var data = (from a in _context.UrencoRubbishBins
                        where a.Id == id
                        select new
                        {
                            a.Id,
                            a.BinCode,
                            a.BinName,
                            a.Material,
                            a.WorkerManage,
                            a.BinType,
                            a.Volume,
                            a.Structure,
                            a.Status,
                            a.Note,
                            a.Image,
                            a.QrCode,
                        }).FirstOrDefault();
            return Json(data);
        }
        [HttpPost]
        public object GetBinStatus()
        {
            var query = from a in _context.CommonSettings.Where(x => x.Group == "BIN_STATUS")
                        select new
                        {
                            Code =a.CodeSet,
                            Name = a.ValueSet
                        };
            return query.ToList();
        }
        [HttpPost]
        public object GetBinType()
        {
            var query = from a in _context.CommonSettings.Where(x => x.Group == "BIN_TYPE")
                        select new
                        {
                            Code = a.CodeSet,
                            Name = a.ValueSet
                        };
            return query.ToList();
        }
        [HttpPost]
        public object GetBinMaterial()
        {
            var query = from a in _context.CommonSettings.Where(x => x.Group == "BIN_MATERIAL")
                        select new
                        {
                            Code = a.CodeSet,
                            Name = a.ValueSet
                        };
            return query.ToList();
        }
        [HttpPost]
        public object GetCreatedUser()
        {
            var query = from a in _context.Users.Where(x=>x.Active==true)
                        select new
                        {
                            UserName = a.UserName,
                            GivenName = a.GivenName
                        };
            return query.ToList();
        }
        [HttpPost]
        public object GetManageUser()
        {
            var query = from a in _context.HREmployees
                        select new
                        {
                            Id = a.Id,
                            FullName = a.fullname
                        };
            return query.ToList();
        }

        [HttpPost]
        public object GetRoute()
        {
            var query = from a in _context.UrencoRoutes
                        select new
                        {
                            RouteCode = a.RouteCode,
                            RouteName = a.RouteName
                        };
            return query.ToList();
        }
        [HttpPost]
        public object GetNode()
        {
            var query = from a in _context.UrencoNodes
                        select new
                        {
                            NodeCode = a.NodeCode,
                            NodeName = a.NodeName
                        };
            return query.ToList();
        }
        ///Inner classs
        public class JTableSearch : JTableModel
        {
            public string BinCode { get; set; }
            public string Name { get; set; }
            public string Volume { get; set; }
            public string Material { get; set; }
            public string Structure { get; set; }
            public string Status { get; set; }
            public string BinType { get; set; }
            public string CreatedBy { get; set; }
            public int? WorkerManage { get; set; }
            public string NodeCode { get; set; }
            public string RouteCode { get; set; }
        }

        public class UrencoRubbishBin1
        {
            public int Id { get; set; }

            public string BinCode { get; set; }

            public string BinName { get; set; }

            public double Volume { get; set; }

            public string Material { get; set; }

            public string Structure { get; set; }

            public string QrCode { get; set; }
            public string LastGps { get; set; }
            public string Note { get; set; }
            public string Status { get; set; }
            public string BinType { get; set; }
            public double PercentageUsed { get; set; }
            public string CurGps { get; set; }
            public int? WorkerManage { get; set; }
            public DateTime CreatedTime { get; set; }
            public string CreatedBy { get; set; }
            public DateTime? UpdatedTime { get; set; }
            public string UpdatedBy { get; set; }
            public DateTime? DeletedTime { get; set; }
            public string DeletedBy { get; set; }
            public bool IsDeleted { get; set; }
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