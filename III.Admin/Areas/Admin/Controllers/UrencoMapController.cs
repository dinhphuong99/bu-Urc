using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using System.Data;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Newtonsoft.Json;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class UrencoMapController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<UrencoMapController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IHostingEnvironment _hostingEnvironment;
        public UrencoMapController(EIMDBContext context, IStringLocalizer<UrencoMapController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources, IHostingEnvironment hostingEnvironment)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _hostingEnvironment = hostingEnvironment;
        }
        public IActionResult Index()
        {
            return View();
        }
        [HttpPost]
        public object insert([FromBody]UrencoRoute jTablePara)
        {
            var msg = new JMessage() { Error = false };
            try
            {

            }
            catch (Exception ex)
            {

            }

            return Json(msg);
        }
        [HttpPost]
        public object JTable([FromBody]JTableSearch jTablePara)
        {
            //int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.UrencoRoutes
                            .Where(x => x.IsDeleted == false && (string.IsNullOrEmpty(jTablePara.RouteName) || x.RouteName.ToLower().Contains(jTablePara.RouteName.ToLower())))
                        join b in _context.Users on a.CreatedBy equals b.UserName
                        join c in _context.CommonSettings.Where(x => x.Group == "ROAD_STATUS") on a.Status equals c.CodeSet into c2
                        from c in c2.DefaultIfEmpty()
                        join d in _context.CommonSettings.Where(x => x.Group == "ROAD_PRIORIRY") on a.Status equals d.CodeSet into d2
                        from d in d2.DefaultIfEmpty()
                        join e in _context.CommonSettings.Where(x => x.Group == "ROAD_LEVEL") on a.Status equals e.CodeSet into e2
                        from e in e2.DefaultIfEmpty()
                        join f in _context.HREmployees on a.Manager equals f.Id into f2
                        from f in f2.DefaultIfEmpty()
                        where
                        (jTablePara.Manager == null || (jTablePara.Manager.HasValue && a.Manager == jTablePara.Manager.Value))
                        && (string.IsNullOrEmpty(jTablePara.Status) || a.Status == jTablePara.Status)
                        && (jTablePara.NumLine == null || (jTablePara.NumLine.HasValue && a.NumLine == jTablePara.NumLine.Value))
                        select new
                        {
                            a.Id,
                            a.RouteName,
                            RouteLevel = a.RouteLevel,
                            RoutePriority = a.RoutePriority,
                            Manager = (f != null ? f.fullname : ""),
                            Status = (c != null ? c.ValueSet : ""),
                            a.NumLine,
                            a.NumLength,
                            CreatedBy = b != null ? b.GivenName : ""
                        };
            var count = query.Count();
            //var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var data = query.AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "RouteName", "RouteLevel", "RoutePriority", "Manager", "Status", "NumLine", "NumLength", "CreatedBy");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult JTableVehicle([FromBody]JTableVehicle jTablepara)
        {
            string[] states = null;
            if (jTablepara.State != null)
            {
                states = jTablepara.State.Split(",");
            }
            int intBeginFor = (jTablepara.CurrentPage - 1) * jTablepara.Length;
            var query = (from a in _context.UrencoTrashCars
                         join b in _context.CommandTrackings on a.LicensePlate equals b.LicensePlate into b1
                         from b2 in b1.DefaultIfEmpty()
                         where a.IsDeleted == false
                         && (string.IsNullOrEmpty(jTablepara.Type) || a.Type.Equals(jTablepara.Type))
                         && (string.IsNullOrEmpty(jTablepara.BranchCode) || a.BranchCode.Equals(jTablepara.BranchCode))
                         && (string.IsNullOrEmpty(jTablepara.State) || (b2.State.Equals(states[0]) || b2.State.Equals(states[1]) || b2.State.Equals(states[2])))

                         select new
                         {
                             a.Id,
                             a.LicensePlate,
                             a.CarCode,
                             //Time = b2.UpdatedTime.Value.Hour + ":" + b2.UpdatedTime.Value.Minute,
                             Time = b2.UpdatedTime.ToString("HH:mm"),
                             b2.Speed,
                         });
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablepara.QueryOrderBy).Skip(intBeginFor).Take(jTablepara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablepara.Draw, count, "Id", "LicensePlate", "CarCode", "Speed", "Time");
            return Json(jdata);
        }
        [HttpGet]
        public object GetRoute()
        {
            var data = _context.UrencoRoutes.Where(x => !x.IsDeleted).ToList();
            return data;
        }

        [HttpPost]
        public JsonResult GetPark()
        {
            var data = (from a in _context.UrencoNodes
                        join b in _context.CommonSettings on a.Unit equals b.CodeSet into b1
                        from b2 in b1.DefaultIfEmpty()
                        select new
                        {
                            a.Id,
                            a.NodeCode,
                            a.NodeName,
                            Unit = b2.ValueSet,
                            a.Volume,
                            a.VolumeLimit,
                            a.GpsNode
                        }).ToList();
            return Json(data);
        }
        public object GetDetailRoute(string RouteCode)
        {
            var data = _context.UrencoRoutes.FirstOrDefault(x => !x.IsDeleted && x.RouteCode == RouteCode);
            return data;
        }
        [HttpPost]
        public object GetListCar()
        {
            var data = from a in _context.UrencoTrashCars.Where(x => x.IsDeleted == false)
                       join b in _context.UrencoRoutes on a.RouteDefault equals b.RouteCode
                       join c in _context.Users on a.DriverDefault equals c.Id
                       where (!b.IsDeleted)

                       select new
                       {
                           a.Id,
                           a.LicensePlate,
                           a.RouteDefault,
                           routeName = b.RouteName,
                           a.DriverDefault,
                           nameDriver = c.GivenName,
                           rountCode = b.RouteCode,
                           isCheck = a.Status == "START" ? true : false
                       };
            return data.ToList();
        }
        [HttpPost]
        public object GetListParkInRoute([FromBody]JTableSearchMap jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.UrencoNodes
                        where (string.IsNullOrEmpty(jTablePara.RouteCode) || a.Route.ToLower().Contains(jTablePara.RouteCode.ToLower()))
                        && (string.IsNullOrEmpty(jTablePara.NodeCode) || a.NodeCode.ToLower().Contains(jTablePara.NodeCode.ToLower()))
                        select new
                        {
                            Id = a.Id,
                            NodeCode = a.NodeCode,
                            NodeName = a.NodeName,
                            Used = a.Volume,
                            VolumeUsed = a.Volume
                        };
            //var data = query.AsNoTracking().ToList();
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "NodeCode", "NodeName", "Volume", "VolumeUsed");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult GetListPark()
        {
            var msg = new JMessage { Error = false };
            try
            {
                var data = _context.UrencoNodes.Select(x => new { Code = x.NodeCode, Name = x.NodeName});
                msg.Object = data;
            }
            catch (Exception ex)
            {
                msg.Error = true;
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetRouteOfNode(string nodeCode)
        {
            var msg = new JMessage { Error = false };
            var data = (from a in _context.UrencoNodes
                       where a.NodeCode.Equals(nodeCode)
                       join b in _context.UrencoRoutes on a.Route equals b.RouteCode
                       select new
                       {
                           RouteName = b.RouteName,
                           ID = b.Id,
                           RouteCode = b.RouteCode
                       }).FirstOrDefault();
            msg.Object = data;
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UpdateNote([FromBody]UrencoNode obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var area = _context.UrencoNodes.FirstOrDefault(x => x.Id == obj.Id);
                if (area != null)
                {
                    area.Volume = obj.Volume;
                    _context.UrencoNodes.Update(area);
                    _context.SaveChanges();
                    msg.Title = "Cập nhập thể tích sử dụng thành công !";
                }
            }
            catch (Exception ex)
            {
                msg.Object = ex.Message;
                msg.Error = true;
                msg.Title = "Có lỗi xảy ra. Xin thử lại !";
            }
            return Json(msg);
        }
        [HttpGet]
        public object GetRouteId(int Id)
        {
            var data = (from a in _context.UrencoRoutes
                        where a.Id == Id
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
        public JsonResult GetParkInRoute(string routeCode)
        {
            //var data = _context.UrencoNodes.Where(x => x.Route.Equals(routeCode));
            var data = (from a in _context.UrencoNodes
                        join b in _context.CommonSettings on a.Unit equals b.CodeSet into b1
                        from b2 in b1.DefaultIfEmpty()
                        where a.Route.Equals(routeCode)
                        select new
                        {
                            a.Id,
                            a.NodeName,
                            a.NodeCode,
                            Unit = b2.ValueSet,
                            a.Volume,
                            a.VolumeLimit,
                            a.GpsNode
                        }).ToList();
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetUrencoRoute()
        {
            var data = _context.UrencoRoutes.Where(x => x.IsDeleted == false).Select(x => new { ID = x.Id, Code = x.RouteCode, Name = x.RouteName });
            return Json(data);
        }

        [HttpPost]
        public JsonResult InsertCommandTracking([FromBody] Vehicle vehicle)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            var data = _context.CommandTrackings.FirstOrDefault(x => x.LicensePlate.Equals(vehicle.VehiclePlate));
            if (data == null)
            {
                data = new CommandTracking();
                data.ListGPS = new List<GisDataTracking>();
                data.LicensePlate = vehicle.VehiclePlate;
                data.ComCode = vehicle.VehiclePlate;
                data.Speed = vehicle.Speed;
                data.State = vehicle.State;
                data.CreatedBy = ESEIM.AppContext.UserName;
                data.CreatedTime = DateTime.Now;
                data.ListGPS.Add(new GisDataTracking
                {
                    Latitude = double.Parse(vehicle.Latitude),
                    Longitude = double.Parse(vehicle.Longitude),
                    State = vehicle.State
                });
                data.GpsData = JsonConvert.SerializeObject(data.ListGPS);
                _context.CommandTrackings.Add(data);
                _context.SaveChanges();
            }
            else
            {
                data.Speed = vehicle.Speed;
                data.State = vehicle.State;
                data.ListGPS.Add(new GisDataTracking
                {
                    Latitude = double.Parse(vehicle.Latitude),
                    Longitude = double.Parse(vehicle.Longitude),
                    State = vehicle.State
                });
                data.GpsData = JsonConvert.SerializeObject(data.ListGPS);
                data.UpdatedBy = ESEIM.AppContext.UserName;
                data.UpdatedTime = DateTime.Now;
                _context.CommandTrackings.Update(data);
                _context.SaveChanges();
            }
            return Json(msg);
        }
        [HttpPost]
        public object GetDataTracking(string vehiclePlate)
        {
            var msg = new JMessage();
            var data = _context.CommandTrackings.Where(x => x.IsDeleted == false && x.LicensePlate.Equals(vehiclePlate)).Select(x => x.GpsData);
            return data;
        }

        [HttpGet]
        public JsonResult GetGroupVehicle(string vehicelPalate)
        {
            var msg = new JMessage();
            var data = (from a in _context.UrencoTrashCars
                        join b in _context.Users on a.DriverDefault equals b.Id into b1
                        from b2 in b1.DefaultIfEmpty()
                        where a.IsDeleted == false && a.LicensePlate.Equals(vehicelPalate)
                        select new
                        {
                            Code = a.CarCode,
                            Type = a.Type,
                            Group = a.Group,
                            BranchCode = a.BranchCode,
                            FullName = b2.GivenName != null ? b2.GivenName : "Không xác định",
                            Phone = b2.PhoneNumber != null ? b2.PhoneNumber : "Không xác định"
                        }).FirstOrDefault();
            msg.Object = data;
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetStatusVehicle()
        {
            var msg = new JMessage();
            var data = _context.CommonSettings.Where(x => x.Group == "URENCO_GROUP_STATUS").OrderBy(x => x.Priority).Select(x => new { Code = x.CodeSet, Status = x.ValueSet, Condition = x.Condition });
            msg.Object = data;
            return Json(msg);
        }

        [HttpPost]
        public JsonResult LoadMenuVehicle()
        {
            var data = (from a in _context.UrencoTrashCars
                        join b in _context.CommonSettings on a.Type equals b.CodeSet
                        join c in _context.UrencoBranchWorkings on a.BranchCode equals c.BranchCode
                        select new
                        {
                            a.Type,
                            a.BranchCode,
                            c.BranchName,
                            Menu = b.ValueSet,
                            BranchAndType = a.Type + "/" + a.BranchCode
                        }).DistinctBy(x => new { x.Type, x.BranchCode }).ToList();
            return Json(data);
        }

        [HttpPost]
        public JsonResult GetListVehicle()
        {
            var data = _context.UrencoTrashCars.Where(x => !x.IsDeleted).Select(x => new { VehiclePlate = x.LicensePlate, Code = x.CarCode });
            return Json(data);
        }

        #region BinhAnhDataVehicle

        [HttpGet]
        public async Task<JsonResult> GetUrencoData()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var result = CommonUtil.Deserialize<BAVehicle>(await UrencoBinhAnhData.GetUrencoBinhAnhData());
                if (result.MessageResult == "Success")
                {
                    msg.Object = result.Vehicle;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<JsonResult> InsertDataBinhAnh()
        {
            var result = CommonUtil.Deserialize<BAVehicle>(await UrencoBinhAnhData.GetUrencoBinhAnhData());
            return Json(result);
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

    }
    public class Menu
    {
        public string BranchCode { get; set; }
        public string TypeVehicle { get; set; }
        public string TypeMenu { get; set; }
        public int ParentId { get; set; }
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
    public class JTableVehicle : JTableModel
    {
        public string Type { get; set; }
        public string State { get; set; }
        public string BranchCode { get; set; }
    }
    public class JTableSearchMap : JTableModel
    {
        public string RouteCode { get; set; }
        public string NodeCode { get; set; }
    }
}